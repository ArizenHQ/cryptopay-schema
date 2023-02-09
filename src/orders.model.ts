import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Model, Table } from "dynamodb-onetable";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new Dynamo({ client: new DynamoDBClient({ region: "eu-west-1" }) });
import Schema from './schema'
import retrieveSecrets from "./utils/retrieveSecrets";

let Crypto: {};
let table: Table;
let User: any;
let Account: any;
let Order: any;

export class Orders {
  constructor() {
    this.init()
  }
  init = async () => {
    const secretsString: any = await retrieveSecrets("/coinhouse-solution/CardPayment-configuration");

    Crypto = {
      primary: {
        cipher: "aes-256-gcm",
        password: secretsString.CryptoPrimaryPassword,
      },
    };

    table = new Table({
      client: client,
      schema: Schema,
      partial: false,
      crypto: Crypto,
      name: "CryptoPay-Accounts",
    });
    User = table.getModel("User");
    Account = table.getModel("Account");
    Order = table.getModel("Order");
  };


  insert = async (accountId: string, data: any) => {
    try {
      const account = await Account.get({ id: data.accountId });
      table.setContext({ accountId: data.accountId });

      data.accountId = accountId;

      return Order.create(data).then(async (order: any) => {
        return order;
      })
    } catch (error) {
      throw new Error(`Error during add new order ${error}`);
    }
  };

  findById = async (id: string) => {
    return Order.get({ id: id }, { index: "gs2", follow: true });
  };

  findPublicById = async (id: string) => {
    let order = await Order.get({ id: id }, { index: "gs2", follow: true });


    ///////delete project.hmacPassword;
    ///////delete project.apiKey;
    ///////delete project.accountId;
    ///////delete project.status;
    ///////delete project.created;
    ///////delete project.updated;

    return order;
  };

  getById = async (id: string) => {
    return Order.get({ id: id }, { index: "gs1", follow: true });
  };

  list = async (accountId: string, query: any) => {
    let key = {};
    if (accountId) key = { pk: `account#${accountId}` };
    return Order.find(key, { index: "gs1", follow: true }, query);
  };

  patchById = async (id: string, data: any) => {
    let order = await Order.get({ id: id }, { index: "gs2", follow: true });
    table.setContext({ accountId: order.accountId });
    data.id = id;
    return Order.update(data);
  };

  emoveById = async (id: string) => {
    let order = await Order.get({ id: id }, { index: "gs2", follow: true });
    if (!order) throw new Error(`Order not found`);
    return Order.remove({ sk: `order#${id}`, pk: `account#${order.accountId}` });
  };

}
export default Orders