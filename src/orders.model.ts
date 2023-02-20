import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Table } from "dynamodb-onetable";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new Dynamo({ client: new DynamoDBClient({ region: "eu-west-1" }) });
import Schema from './schema'
import retrieveSecrets from "./utils/retrieveSecrets";

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


  insert = async (accountId: string, data: any) => {
    try {
      const account = await this.Account.get({ id: data.accountId });
      this.table.setContext({ accountId: data.accountId });
      data.accountId = accountId;
      if (data.projectCode) data.codeProject = data.projectCode

      return this.Order.create(data).then(async (order: any) => {
        const project  = await this.Project.get({ codeProject: order.codeProject }, { index: "gs1", follow: true })
        delete order.notificationFromAdyen;
        delete order.session;
        delete order.applicationInfo;
        delete order.audit;
        delete order.countryCode;
        delete order.typeOrder;
        
        if (Object.keys(order.urlsRedirect).length === 0) {
          order.urlsRedirect = {
            urlRedirectSuccess: project.parameters?.urlRedirectSuccess,
            urlRedirectPending: project.parameters?.urlRedirectPending,
            urlRedirectFailed: project.parameters?.urlRedirectFailed,
            urlRedirectError: project.parameters?.urlRedirectError
          }
        }
        if (!order.webhookUrl) order.webhookUrl = project.parameters?.webhookUrl
        return order;
      })
    } catch (error) {
      throw new Error(`Error during add new order ${error}`);
    }
  };

  findById = async (id: string) => {
    return this.Order.get({ id: id }, { index: "gs2", follow: true });
  };

  findPublicById = async (id: string) => {
    let order = await this.Order.get({ id: id }, { index: "gs2", follow: true });
    return order;
  };

  scan = async (params: any, query: any) => {
    return this.Order.scan(params, query)
  }

  getById = async (id: string) => {
    return this.Order.get({ id: id }, { index: "gs1", follow: true });
  };

  list = async (accountId: string, query: any) => {
    let key = {};
    if (accountId) key = { pk: `account#${accountId}` };
    return this.Order.find(key, { index: "gs1", follow: true }, query);
  };

  patchById = async (id: string, data: any) => {
    try {
      let order = await this.Order.get({ id: id }, { index: "gs1", follow: true });
      if (!order) throw new Error(`no order fund for id: ${id}`)
      this.table.setContext({ accountId: order.accountId });
      data.id = id;
      const currentDate = new Date();
      data.dateLastUpdated = currentDate.getTime();
      return this.Order.update(data);
    } catch (err) {
      throw new Error(`Error during update order ${err}`);
    }
  };

  removeById = async (id: string) => {
    let order = await this.Order.get({ id: id }, { index: "gs1", follow: true });
    if (!order) throw new Error(`Order not found`);
    return this.Order.remove({ sk: `order#${id}`, pk: `account#${order.accountId}` });
  };

}
export default Orders