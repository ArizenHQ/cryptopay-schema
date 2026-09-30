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
import { paginateModel } from './utils/paginateModel';
import { resolveNetworkForCurrency, resolveBlockchainForCurrency } from './blockchains';
import { withoutKeys } from "./utils/callerData";

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
      order = withoutKeys(order);
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
        // Backward-compatible defaulting for blockchain/network
        blockchain: order.blockchain || project?.parameters?.blockchain || resolveBlockchainForCurrency(order.currency, project?.parameters?.network || project?.parameters?.blockchain),
        network: order.network || resolveNetworkForCurrency(order.currency, project?.parameters?.network || project?.parameters?.blockchain),
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
      // Ajouter les paramètres de paiement physique si présents
      if (Object.keys(project?.parameters?.physicalPayment || {}).length > 0) {
        orderData.physicalPaymentParams = project.parameters.physicalPayment;
      }

      // Créer l'ordre et retourner une version nettoyée
      const createdOrder = await this.Order.create(orderData, { context: { accountId } });
      
      // Liste des champs à supprimer de la réponse
      const fieldsToRemove = [
        'applicationInfo',
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

  scan = async (params: any = {}, query: any = {}) => {
    return await paginateModel(this.Order, 'scan', params, query);
  };

  getById = async (id: string) => {
    return await this.Order.get({ id: id }, { index: "gs1", follow: true });
  };

  list = async (accountId: string, query: any = {}) => {
    const key: any = {};
    if (accountId) key.pk = `account#${accountId}`;

    return await paginateModel(this.Order, 'find', key, query, {
      index: 'gs3',
      follow: true,
    });
  };

  patchById = async (id: string, data: any) => {
    try {
      data = withoutKeys(data);
      let order = await this.Order.get(
        { id: id },
        { index: "gs1", follow: true }
      );
      if (!order) throw new Error(`no order fund for id: ${id}`);
      data.id = id;
      return await this.Order.update(data, { return: "get", context: { accountId: order.accountId } });
    } catch (err) {
      throw new Error(`Error during update order ${err}`);
    }
  };

  // A renewed quote is stored only while the order still waits for its payment, carries
  // the quote the caller read and is not held: a payment, another renewal or a hold in
  // between wins. Returns null when the condition refused the write.
  patchQuoteIfCurrent = async (id: string, data: any, current: { dateQuote?: string | null; now: string }) => {
    const order = await this.Order.get({ id: id }, { index: "gs1", follow: true });
    if (!order) throw new Error(`no order fund for id: ${id}`);
    const sameQuote = current.dateQuote ? "${dateQuote} = @{dateQuote}" : "attribute_not_exists(${dateQuote})";
    try {
      return await this.Order.update(
        { ...withoutKeys(data), id },
        {
          where: `\${statusOrder} = {CREATED} and ${sameQuote} and (attribute_not_exists(\${quoteHeldUntil}) or \${quoteHeldUntil} < @{now})`,
          substitutions: { dateQuote: current.dateQuote, now: current.now },
          return: "get",
          context: { accountId: order.accountId },
        }
      );
    } catch (err: any) {
      if (err?.code === "ConditionalCheckFailedException") return null;
      throw err;
    }
  };

  // Holds the quote the payer is shown until `until`, while the order waits for its
  // payment: refused when that quote was renewed meanwhile, and never shortens a longer
  // hold. Returns null when refused.
  holdQuote = async (id: string, until: string, shown: { dateQuote?: string | null } = {}) => {
    const order = await this.Order.get({ id: id }, { index: "gs1", follow: true });
    if (!order) throw new Error(`no order fund for id: ${id}`);
    const sameQuote = shown.dateQuote ? "${dateQuote} = @{dateQuote}" : "attribute_not_exists(${dateQuote})";
    try {
      return await this.Order.update(
        { id, quoteHeldUntil: until },
        {
          where: `\${statusOrder} = {CREATED} and ${sameQuote} and (attribute_not_exists(\${quoteHeldUntil}) or \${quoteHeldUntil} < @{until})`,
          substitutions: { dateQuote: shown.dateQuote, until },
          return: "get",
          context: { accountId: order.accountId },
        }
      );
    } catch (err: any) {
      if (err?.code === "ConditionalCheckFailedException") return null;
      throw err;
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
