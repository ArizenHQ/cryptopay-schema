import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Table } from "dynamodb-onetable";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new Dynamo({ client: new DynamoDBClient({ region: "eu-west-1" }) });
import Schema from './schema'
import retrieveSecrets from "./utils/retrieveSecrets";

export class Payments {
  Crypto: any;
  table: Table;
  User: any;
  Project: any;
  Account: any;
  Order: any;
  Payment: any;
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
      name: "CryptoPay-Accounts",
    });

    this.User = this.table.getModel("User");
    this.Project = this.table.getModel("Project");
    this.Account = this.table.getModel("Account");
    this.Order = this.table.getModel("Order");
    this.Payment = this.table.getModel("Payment");
  }

  static init = async () => {
    const secretsString = await retrieveSecrets("/coinhouse-solution/CardPayment-configuration")
    return new Payments(secretsString)
  }


  insert = async (accountId: string, data: any) => {
    try {
      const account = await this.Account.get({ id: data.accountId });
      this.table.setContext({ accountId: data.accountId });
      data.accountId = accountId;
      return this.Payment.create(data).then(async (payment: any) => {
        return payment;
      })
    } catch (error) {
      throw new Error(`Error during add new payment ${error}`);
    }
  };

  findById = async (id: string) => {
    return this.Payment.get({ id: id }, { index: "gs2", follow: true });
  };

  findPublicById = async (id: string) => {
    let order = await this.Payment.get({ id: id }, { index: "gs2", follow: true });
    return order;
  };

  scan = async (params: any, query: any) => {
    return this.Payment.scan(params, query)
  }

  getById = async (id: string) => {
    return this.Payment.get({ id: id }, { index: "gs1", follow: true });
  };

  getByOrderId = async (orderId: string) => {
    return this.scan({orderId: orderId}, {})
  }

  list = async (accountId: string, query: any) => {
    let key = {};
    if (accountId) key = { pk: `account#${accountId}` };
    return this.Payment.find(key, { index: "gs1", follow: true }, query);
  };

  patchById = async (id: string, data: any) => {
    try {
      let payment = await this.Payment.get({ id: id }, { index: "gs1", follow: true });
      if (!payment) throw new Error(`no order fund for id: ${id}`)
      this.table.setContext({ accountId: payment.accountId });
      data.id = id;
      return this.Payment.update(data);
    } catch (err) {
      throw new Error(`Error during update order ${err}`);
    }
  };

  removeById = async (id: string) => {
    let payment = await this.Payment.get({ id: id }, { index: "gs1", follow: true });
    if (!payment) throw new Error(`Order not found`);
    return this.Payment.remove({ sk: `order#${id}`, pk: `account#${payment.accountId}` });
  };

}
export default Payments