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
import { paginateModel } from './utils/paginateModel';

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
      const account = await this.Account.get({ pk: `account#${data.accountId}` });
      if (!account) throw new Error("Account not found");
      // Déterminer si ce compte a un revendeur parent
      let resellerAccountId = null;
      if (account.parentAccountId) {
        resellerAccountId = account.parentAccountId;
      }

      this.table.setContext({ accountId: data.accountId });
      const isValid = this.checkData(data);

      if (isValid === true) {
        const projectData: any = {
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
          resellerAccountId: resellerAccountId
        };
        if (resellerAccountId) {
          projectData.gs5pk = `reseller#${resellerAccountId}`;
        }

        return this.Project.create(projectData).then(async (project: any) => {
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

  listProjectsForReseller = async (resellerAccountId: string, query: any = {}) => {
    return await paginateModel(this.Project, 'find', 
      { gs5pk: `reseller#${resellerAccountId}` }, 
      query,
      { index: 'gs5', follow: true }
    );
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

  list = async (accountId: string, query: any = {}) => {
    const key: any = {};
    if (accountId) key.pk = `account#${accountId}`;
    return await paginateModel(this.Project, 'find', key, query, {
      index: 'gs4',
      follow: true,
    });
  };

  patchById = async (id: string, data: any) => {
    let project = await this.Project.get(
      { id: id },
      { index: "gs2", follow: true }
    );
    this.table.setContext({ accountId: project.accountId });
    data.id = id;

    // Si le projet change de compte, mettre à jour resellerAccountId
    if (data.accountId && data.accountId !== project.accountId) {
      const account = await this.Account.get({ pk: `account#${data.accountId}` });
      if (!account) throw new Error("Account not found");
      
      // Déterminer le nouveau resellerAccountId
      let resellerAccountId = null;
      if (account.parentAccountId) {
        resellerAccountId = account.parentAccountId;
      }
      
      // Ajouter le resellerAccountId aux données de mise à jour
      data.resellerAccountId = resellerAccountId;
      data.gs5pk = resellerAccountId ? `reseller#${resellerAccountId}` : "standard#project";
    }
    const controlData = this.checkData(data);
    if (controlData !== true) return controlData;
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

    // Méthode pour mettre à jour les projets existants avec les valeurs gs5pk appropriées
    updateProjectsWithCorrectGs5pk = async () => {
      try {
        const allProjects = await this.Project.scan();
        console.log(`Found ${allProjects.length} projects to check.`);
        
        let updatedCount = 0;
        let errorCount = 0;
        
        for (const project of allProjects) {
          try {
            // Récupérer le compte associé au projet
            const account = await this.Account.get({ pk: `account#${project.accountId}` });
            if (!account) {
              console.warn(`Account not found for project ${project.id}`);
              continue;
            }
            
            // Déterminer le resellerAccountId et gs5pk correct
            let resellerAccountId = null;
            let correctGs5pk = "standard#project";
            
            if (account.parentAccountId) {
              resellerAccountId = account.parentAccountId;
              correctGs5pk = `reseller#${resellerAccountId}`;
            }
            
            // Mettre à jour le projet si nécessaire
            if (project.resellerAccountId !== resellerAccountId || project.gs5pk !== correctGs5pk) {
              await this.Project.update({
                id: project.id,
                resellerAccountId: resellerAccountId,
                gs5pk: correctGs5pk,
                gs5sk: `project#${project.id}`
              });
              updatedCount++;
            }
          } catch (error) {
            console.error(`Error updating project ${project.id}:`, error);
            errorCount++;
          }
        }
        
        console.log(`Update completed: ${updatedCount} projects updated, ${errorCount} errors.`);
        
        return {
          total: allProjects.length,
          updated: updatedCount,
          errors: errorCount
        };
      } catch (error) {
        console.error("Update error:", error);
        throw error;
      }
    };

  checkData = (data: any) => {
    // Vérification du type de projet
    const isCryptoPayment = data.typeProject === "cryptoPayment";
    const isCardPayment = data.typeProject === "cardPayment";
    const isGasStation = data.typeProject === "gasStation";
    const params = data.parameters || {};

    // Vérification des paramètres interdits pour certains types de projets
    if (isCryptoPayment || isGasStation) {
      if (params.methodSmartContract || params.abiSmartContract) {
        throw new Error(
          "Invalid parameters for this project. Do not use methodSmartContract, abiSmartContract for this type of project"
        );
      }
    }

    // Vérification des URLs pour les projets cryptoPayment et cardPayment
    if (isCryptoPayment || isCardPayment) {
      const urlChecks = [
        { field: 'urlRedirectSuccess', value: params.urlRedirectSuccess },
        { field: 'urlRedirectError', value: params.urlRedirectError },
        { field: 'urlRedirectFailed', value: params.urlRedirectFailed },
        { field: 'urlRedirectPending', value: params.urlRedirectPending }
      ];

      for (const check of urlChecks) {
        if (check.value && !validateString(check.value, Match.url)) {
          throw new Error(`${check.field} is invalid or missed`);
        }
      }
    }

    // Vérifications spécifiques pour cardPayment
    if (isCardPayment) {
      if (!params.walletAddress) {
        throw new Error(
          "Missing parameters for this smart contract. You need to provide the wallet address"
        );
      }

      const hasMethod = !!params.methodSmartContract;
      const hasAbi = !!params.abiSmartContract;

      if (hasMethod !== hasAbi) {
        throw new Error(
          "Missing parameters for this smart contract. If you use a custom method, you must provide the method and the abi"
        );
      }

      if (hasAbi && !isJsonValid(params.abiSmartContract)) {
        throw new Error("Invalid abi for this smart contract");
      }
    }

    // Vérifications pour physicalPayment dans cryptoPayment
    if (isCryptoPayment && params.physicalPayment && Object.keys(params.physicalPayment).length > 0) {
      const requiredFields = ['logo', 'name', 'description', 'email', 'logoInverse'];
      
      for (const field of requiredFields) {
        if (!params.physicalPayment[field]) {
          throw new Error(`Missing ${field} for this physical payment`);
        }
      }
    }

    return true;
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
