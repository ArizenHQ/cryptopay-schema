import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Model, Table } from "dynamodb-onetable";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import Schema from "./schema";
import {
  importApiKey,
  removeApiKey,
  configureUsagePlanKey,
} from "./utils/ApiGatewayCryptoPayment.js";
import retrieveSecrets from "./utils/retrieveSecrets";
import { randomBytes, createHash } from "crypto";
const client = new Dynamo({
  client: new DynamoDBClient({ region: "eu-west-1" }),
});

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
    this.secretsString = secretsString;

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
    const secretsString = await retrieveSecrets(
      "/coinhouse-solution/CardPayment-configuration"
    );
    return new Projects(secretsString);
  };

  randomString = () => {
    return randomBytes(5).toString("hex");
  };
  generateApiKey = () => {
    return createHash("sha256").update(Math.random().toString()).digest("hex");
  };
  insert = async (data: any) => {
    try {
      const account = await this.Account.get({ id: data.accountId });
      if (!account) throw new Error("Account not found");
      this.table.setContext({ accountId: data.accountId });
      const isValid = this.checkData(data);

      if (isValid === true) {
        return this.Project.create({
          name: data.name,
          accountId: data.accountId,
          codeProject: data.codeProject,
          typeProject: data.typeProject,
          description: data.description,
          userIdCNHS: data.userIdCNHS || null,
          status: data.status,
          parameters: data.parameters,
          apiKey: this.generateApiKey(),
          hmacPassword: this.randomString(),
        }).then(async (project: any) => {
          await this.createApiKey({
            accountName: account.name,
            project: project,
          });
          return project;
        });
      } else {
        throw new Error(`Invalid data provided: ${isValid}`);
      }
    } catch (error: any) {
      throw error;
    }
  };

  findById = async (id: string) => {
    return await this.Project.get({ id: id }, { index: "gs2", follow: true });
  };

  findPublicById = async (id: string) => {
    let project = await this.Project.get(
      { id: id },
      { index: "gs2", follow: true }
    );
    delete project.hmacPassword;
    delete project.apiKey;
    delete project.accountId;
    delete project.status;
    delete project.created;
    delete project.updated;
    if (project.userIdCNHS) delete project.userIdCNHS;
    return project;
  };

  findByCodeProject = async (codeProject: string, showHiddenFields = false) => {
    let project = await this.Project.get(
      { codeProject: codeProject },
      { index: "gs1", follow: true }
    );
    if (showHiddenFields === false) {
      delete project.hmacPassword;
      delete project.apiKey;
      delete project.status;
      delete project.created;
      delete project.updated;
      if (project.userIdCNHS) delete project.userIdCNHS;
    }
    return project;
  };

  findByApiKey = async (apiKey: string) => {
    return await this.Project.get(
      { apiKey: apiKey },
      { index: "gs3", follow: true }
    );
  };
  getById = async (id: string) => {
    return await this.Project.get({ id: id }, { index: "gs2", follow: true });
  };

  list = async (accountId: string, query: any) => {
    let key = {};
    if (accountId) key = { pk: `account#${accountId}` };
    return await this.Project.find(key, { index: "gs1", follow: true }, query);
  };

  patchById = async (id: string, data: any) => {
    let project = await this.Project.get(
      { id: id },
      { index: "gs2", follow: true }
    );
    this.table.setContext({ accountId: project.accountId });
    data.id = id;
    const controlData = this.checkData(data);
    if (controlData !== true) return controlData;
    //this.createApiKey(data);
    return await this.Project.update(data, { return: "get" });
  };

  removeById = async (id: string) => {
    let project = await this.Project.get(
      { id: id },
      { index: "gs2", follow: true }
    );
    if (!project) throw new Error(`Project not found`);
    if (project.typeProject === "cryptoPayment")
      await removeApiKey(project.apiKeyId);
    return await this.Project.remove({
      sk: `project#${id}`,
      pk: `account#${project.accountId}`,
    });
  };

  createApiKey = async (obj: any) => {
    if (
      obj.project.typeProject === "cryptoPayment" ||
      obj.project.typeProject === "gasStation"
    ) {
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
    console.log("Projects ~ data:", data);
    try {
      if (
        data.typeProject === "cryptoPayment" ||
        data.typeProject === "gasStation"
      ) {
        if (
          data.parameters?.methodSmartContract ||
          data.parameters?.abiSmartContract
        ) {
          throw new Error(
            "Invalid parameters for this project. Do not use methodSmartContract, abiSmartContract for this type of project"
          );
        }
      }
      if (
        data.typeProject === "cryptoPayment" ||
        data.typeProject === "cardPayment"
      ) {
        if (
          data.parameters?.urlRedirectSuccess &&
          !validateString(data.parameters?.urlRedirectSuccess, Match.url)
        ) {
          throw new Error("urlRedirectSuccess is invalid or missed");
        } else if (
          data.parameters?.urlRedirectError &&
          !validateString(data.parameters?.urlRedirectError, Match.url)
        ) {
          throw new Error("urlRedirectError is invalid or missed");
        } else if (
          data.parameters?.urlRedirectFailed &&
          !validateString(data.parameters?.urlRedirectFailed, Match.url)
        ) {
          throw new Error("urlRedirectFailed is invalid or missed");
        } else if (
          data.parameters?.urlRedirectPending &&
          !validateString(data.parameters?.urlRedirectPending, Match.url)
        ) {
          throw new Error("urlRedirectPending is invalid or missed");
        }
      }
      if (data.typeProject === "cardPayment") {
        if (!data.parameters?.walletAddress) {
          throw new Error(
            "Missing parameters for this smart contract. You need to provide the wallet address"
          );
        } else if (
          (data.parameters?.methodSmartContract &&
            !data.parameters?.abiSmartContract) ||
          (!data.parameters?.methodSmartContract &&
            data.parameters?.abiSmartContract)
        ) {
          throw new Error(
            "Missing parameters for this smart contract. If you use a custom method, you must provide the method and the abi"
          );
        } else if (
          data.parameters?.abiSmartContract &&
          !isJsonValid(data.parameters?.abiSmartContract)
        ) {
          throw new Error("Invalid abi for this smart contract");
        }
      }
      return true;
    } catch (e: any) {
      throw e;
    }
  };
}

const validateString = (data: string, match: any) => {
  const pattern = new RegExp(match);
  return pattern.test(data);
};

const isJsonValid = (json: any) => {
  try {
    JSON.parse(json);
  } catch (e) {
    return false;
  }
  return true;
};

const Match = {
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  email:
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  name: /^[a-z0-9 ,.'-]+$/i,
  address: /[a-z0-9 ,.-]+$/,
  cryptoAddress: /^(0x)?[0-9a-f]{40}$/i,
  zip: /^\d{5}(?:[-\s]\d{4})?$/,
  phone: /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/,
  url: /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/,
  permissionLevel: /^(1|4|16|128|2048)$/,
};

export default Projects;
