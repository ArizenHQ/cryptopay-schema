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


  insert = async (accountId: string, order: any) => {
    try {
      const account = await this.Account.get({ id: order.accountId });
      this.table.setContext({ accountId: order.accountId });
      order.accountId = accountId;
      if (order.projectCode && !order.codeProject) { order.codeProject = order.projectCode }
      await this.Project.get({codeProject: order.codeProject}, { index: "gs2", follow: true }).then((_project: any)=>{
        if(Object.keys(_project).length === 0) {
          order.codeProject = _project.codeProject;
          order.applicationInfo = {
            externalPlatform: {
              integrator: account.name,
              name: _project.name,
            },
            merchantApplication: {
              name: _project.name,
            }
          }
          if (Object.keys(order.urlsRedirect).length === 0) {
            order.urlsRedirect = {
              urlRedirectSuccess: _project.parameters?.urlRedirectSuccess,
              urlRedirectPending: _project.parameters?.urlRedirectPending,
              urlRedirectFailed: _project.parameters?.urlRedirectFailed,
              urlRedirectError: _project.parameters?.urlRedirectError
            }
          }
          if (!order.webhookUrl) order.webhookUrl = _project.parameters?.webhookUrl
        }
      })
      console.log("Order to create", order)
      return this.Order.create(order).then(async (order: any) => {
        delete order.notificationFromAdyen;
        delete order.session;
        delete order.applicationInfo;
        delete order.audit;
        delete order.countryCode;
        delete order.typeOrder;
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