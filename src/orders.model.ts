import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Table } from "dynamodb-onetable";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new Dynamo({
  client: new DynamoDBClient({ region: "eu-west-1" }),
});
import Schema from "./schema";
import retrieveSecrets from "./utils/retrieveSecrets";
import { Projects } from "./projects.model";
import { Accounts } from "./accounts.model";

export class Orders {
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
    return new Orders(secretsString);
  };

  insert = async (accountId: string, order: any) => {
    try {
      // Normaliser le code du projet
      order.codeProject = order.projectCode || order.codeProject;

      // Récupérer les informations du projet
      const project = await this.Project.get(
        { codeProject: order.codeProject },
        { index: "gs1", follow: true }
      );

      if (!Object.keys(project).length) {
        throw new Error(`Project not found! Please check your codeProject or API Key`);
      }

      // Vérifier que le compte correspond au projet
      if (accountId !== project.accountId) {
        throw new Error(
          `accountId and project do not match. Please check all information or contact administrator`
        );
      }

      // Récupérer les informations du compte
      const account = await this.Account.get({ pk: `account#${accountId}` });

      // Configurer le contexte et les propriétés de base de l'ordre
      this.table.setContext({ accountId });
      
      // Construire l'objet order avec les propriétés requises
      const orderData = {
        ...order,
        accountId,
        codeProject: project.codeProject,
        autoConvert: project.autoConvert ? "enabled" : "disabled",
        urlsRedirect: order.urlsRedirect || project.parameters,
        webhookUrl: order.webhookUrl || project.parameters?.webhookUrl,
        currency: order.currency?.toUpperCase(),
        customerAddress: order.customerAddress?.toLowerCase(),
        applicationInfo: {
          externalPlatform: {
            integrator: account.name,
            name: project.name,
          },
          merchantApplication: {
            name: project.name,
          },
        }
      };
      console.log(Object.keys(project?.parameters?.physicalPayment || {}).length > 0, project)
      // Ajouter les paramètres de paiement physique si présents
      if (Object.keys(project?.parameters?.physicalPayment || {}).length > 0) {
        orderData.physicalPaymentParams = project.parameters.physicalPayment;
      }

      // Créer l'ordre et retourner une version nettoyée
      const createdOrder = await this.Order.create(orderData);
      
      // Liste des champs à supprimer de la réponse
      const fieldsToRemove = [
        'notificationFromAdyen', 'session', 'applicationInfo',
        'audit', 'statusOrder', 'countryCode', 'typeOrder'
      ];
      
      // Supprimer les champs non nécessaires
      return fieldsToRemove.reduce((order, field) => {
        delete order[field];
        return order;
      }, createdOrder);
      
    } catch (error) {
      throw new Error(`Error during add new order ${error}`);
    }
  };

  findById = async (id: string) => {
    return await this.Order.get({ id: id }, { index: "gs2", follow: true });
  };

  findPublicById = async (id: string) => {
    let order = await this.Order.get(
      { id: id },
      { index: "gs2", follow: true }
    );
    return order;
  };

  scan = async (params: any, query: any) => {
    return await this.Order.scan(params, query);
  };

  getById = async (id: string) => {
    return await this.Order.get({ id: id }, { index: "gs1", follow: true });
  };

  list = async (accountId: string, query: any) => {
    let key = {};
    if (accountId) key = { pk: `account#${accountId}` };
    return await this.Order.find(key, { index: "gs1", follow: true }, query);
  };

  patchById = async (id: string, data: any) => {
    try {
      let order = await this.Order.get(
        { id: id },
        { index: "gs1", follow: true }
      );
      if (!order) throw new Error(`no order fund for id: ${id}`);
      this.table.setContext({ accountId: order.accountId });
      data.id = id;
      return await this.Order.update(data, { return: "get" });
    } catch (err) {
      throw new Error(`Error during update order ${err}`);
    }
  };

  removeById = async (id: string) => {
    let order = await this.Order.get(
      { id: id },
      { index: "gs1", follow: true }
    );
    if (!order) throw new Error(`Order not found`);
    return await this.Order.remove({
      sk: `order#${id}`,
      pk: `account#${order.accountId}`,
    });
  };
}
export default Orders;
