import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Model, Table } from "dynamodb-onetable";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import Schema from "./schema";
import { importApiKey, removeApiKey, configureUsagePlanKey } from "./utils/ApiGatewayCryptoPayment.js";
import retrieveSecrets from "./utils/retrieveSecrets";
import { randomBytes, createHash } from 'crypto'
const client = new Dynamo({ client: new DynamoDBClient({ region: "eu-west-1" }) });



export class Projects {
  Crypto: any;
  table: Table;
  User: any;
  Project: any;
  Account: any;
  Order: any;
  Payment: any;
  Kyt: any;
  secretsString: any;
  private constructor(secretsString: any) {

    this.secretsString = secretsString

    this.Crypto = {
      primary: {
        cipher: "aes-256-gcm",
        password: this.secretsString.CryptoPrimaryPassword,
      },
    };

    this.table = new Table({
      client: client,
      schema: Schema,
      partial: false,
      crypto: this.Crypto,
      name: process.env.TABLE_CRYPTOPAY_ACCOUNTS,
    });

    this.User = this.table.getModel("User");
    this.Project = this.table.getModel("Project");
    this.Account = this.table.getModel("Account");
    this.Order = this.table.getModel("Order");
    this.Payment = this.table.getModel("Payment");
    this.Kyt = this.table.getModel("Kyt");

  }

  static init = async () => {
    const secretsString = await retrieveSecrets("/coinhouse-solution/CardPayment-configuration")
    return new Projects(secretsString)
  }

  randomString = () => {
    return randomBytes(5).toString("hex");
  }
  generateApiKey = () => {
    return createHash("sha256").update(Math.random().toString()).digest("hex");
  }
  insert = async (data: any) => {
    try {
      const account = await this.Account.get({ id: data.accountId });
      this.table.setContext({ accountId: data.accountId });
      const isValid = this.checkData(data);
  
      if (isValid === true) {
        return this.Project.create({
          name: data.name,
          accountId: data.accountId,
          codeProject: data.codeProject,
          typeProject: data.typeProject,
          description: data.description,
          status: data.status,
          parameters: data.parameters,
          apiKey: this.generateApiKey(),
          hmacPassword: this.randomString()  
        }).then(async (project: any) => {
          await this.createApiKey({ accountName: account.name, project: project });
          return project;
        });
      } else {
        throw new Error(`Invalid data provided: ${isValid}`);
      }
    } catch (error:any) {
      throw error;
    }
  };
  

  findById = async (id: string) => {
    return await this.Project.get({ id: id }, { index: "gs2", follow: true });
  };

  findPublicById = async (id: string) => {
    let project = await this.Project.get({ id: id }, { index: "gs2", follow: true });
    delete project.hmacPassword;
    delete project.apiKey;
    delete project.accountId;
    delete project.status;
    delete project.created;
    delete project.updated;

    return project;
  };

  findByCodeProject = async (codeProject: string, showHiddenFields = false) => {
    let project = await this.Project.get({ codeProject: codeProject }, { index: "gs1", follow: true });
    if (showHiddenFields === false) {
      delete project.hmacPassword;
      delete project.apiKey;
      delete project.status;
      delete project.created;
      delete project.updated;
    }
    return project;
  };


  findByApiKey = async (apiKey: string) => {
    return await this.Project.get({ apiKey: apiKey }, { index: "gs3", follow: true });
  };
  getById = async (id: string) => {
    return await this.Project.get({ id: id }, { index: "gs2", follow: true });
  };

  list = async (accountId: string, query: any) => {
    let key = {};
    if (accountId) key = { pk: `account#${accountId}` };
    return this.Project.find(key, { index: "gs1", follow: true }, query);
  };

  patchById = async (id: string, data: any) => {
    let project = await this.Project.get({ id: id }, { index: "gs2", follow: true });
    this.table.setContext({ accountId: project.accountId });
    data.id = id;
    const controlData = this.checkData(data);
    if(controlData !== true) return controlData;
    this.createApiKey(data);
    return this.Project.update(data);
  };

  removeById = async (id: string) => {
    let project = await this.Project.get({ id: id }, { index: "gs2", follow: true });
    if (!project) throw new Error(`Project not found`);
    if (project.typeProject === "cryptoPayment") await removeApiKey(project.apiKeyId);
    return this.Project.remove({ sk: `project#${id}`, pk: `account#${project.accountId}` });
  };

  createApiKey = async (obj: any) => {
    if (obj.project.typeProject === "cryptoPayment") {
      await importApiKey(obj)
        .then(async (keyId: any) => {
          await configureUsagePlanKey(keyId).catch((error) => {
            console.error(error);
            throw new Error(`Error during configure usage plan key ${error}`);
          });
          await this.Project.update({ id: obj.project.id, apiKeyId: keyId });
        })
        .catch((error) => {
          console.error(error);
          throw new Error(`Error during import key ${error}`);
        });
    }
  };

  checkData = (data: any) => {
    try {
      if (data.typeProject === "cryptoPayment" || data.typeProject === "gasStation") {
        if (data.parameters.methodSmartContract || data.parameters.abiSmartContract) {
          throw new Error("Invalid parameters for this project. Do not use methodSmartContract, abiSmartContract for this type of project");
        }
      }
      if (data.typeProject === "cardPayment") {
        if (!data.parameters.walletAddress) {
          throw new Error("Missing parameters for this smart contract. You need to provide the wallet address");
        } else if ((data.parameters.methodSmartContract && !data.parameters.abiSmartContract) || (!data.parameters.methodSmartContract && data.parameters.abiSmartContract) ) {
          throw new Error("Missing parameters for this smart contract. If you use a custom method, you must provide the method and the abi");
        } else if (data.parameters.abiSmartContract && !isJsonValid(data.parameters.abiSmartContract)) {
          throw new Error("Invalid abi for this smart contract");
        }
      }
      return true;
    } catch (e: any) {
      throw e;
    }
  };
}

const isJsonValid = (json: any) => {
  try {
    JSON.parse(json);
  } catch (e) {
    return false;
  }
  return true;
};

export default Projects