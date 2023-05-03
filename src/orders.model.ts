import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Table } from "dynamodb-onetable";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new Dynamo({ client: new DynamoDBClient({ region: "eu-west-1" }) });
import Schema from './schema'
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
    return new Orders(secretsString)
  }


  insert = async (accountId: string, order: any) => {
    try {
      if (order.projectCode && !order.codeProject) { order.codeProject = order.projectCode }

      const project = await this.Project.get({ codeProject: order.codeProject }, { index: "gs1", follow: true })

      if (Object.keys(project).length > 0) {
        
        if (accountId !== project.accountId) throw new Error(`accountId and project do not match. Please check all information or contact administrator`);
        const account = await this.Account.get({ pk: `account#${accountId}` });

        this.table.setContext({ accountId: accountId });
        order.accountId = accountId;
        order.codeProject = project.codeProject;
        order.autoConvert = (project.autoConvert) ? "enabled" : "disabled";

        order.applicationInfo = {
          externalPlatform: {
            integrator: account.name,
            name: project.name,
          },
          merchantApplication: {
            name: project.name,
          }
        }

        if (!order.urlsRedirect) {
          order.urlsRedirect =  project.parameters
        }
        
        if (!order.webhookUrl) order.webhookUrl = project.parameters?.webhookUrl
       
        if(order.currency) order.currency = order.currency.toUpperCase()
        if(order.customerAddress) order.customerAddress = order.customerAddress.toLowerCase()

      } else {
        throw new Error(`Project not found! Please check your codeProject or API Key`);
      }
      return await this.Order.create(order).then(async (order: any) => {
        delete order.notificationFromAdyen;
        delete order.session;
        delete order.applicationInfo;
        delete order.audit;
        delete order.statusOrder;
        delete order.countryCode;
        delete order.typeOrder;
        return order;
      })
    } catch (error) {
      throw new Error(`Error during add new order ${error}`);
    }
  };

  findById = async (id: string) => {
    return await this.Order.get({ id: id }, { index: "gs2", follow: true });
  };

  findPublicById = async (id: string) => {
    let order = await this.Order.get({ id: id }, { index: "gs2", follow: true });
    return order;
  };

  scan = async (params: any, query: any) => {
    return await this.Order.scan(params, query)
  }

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
      let order = await this.Order.get({ id: id }, { index: "gs1", follow: true });
      if (!order) throw new Error(`no order fund for id: ${id}`)
      this.table.setContext({ accountId: order.accountId });
      data.id = id;
      return await this.Order.update(data, {return: 'get'});
    } catch (err) {
      throw new Error(`Error during update order ${err}`);
    }
  };

  removeById = async (id: string) => {
    let order = await this.Order.get({ id: id }, { index: "gs1", follow: true });
    if (!order) throw new Error(`Order not found`);
    return await this.Order.remove({ sk: `order#${id}`, pk: `account#${order.accountId}` });
  };

}
export default Orders