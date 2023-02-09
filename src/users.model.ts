import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Model, Table } from "dynamodb-onetable";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new Dynamo({ client: new DynamoDBClient({ region: "eu-west-1" }) });
import Schema from "./schema.js";
import retrieveSecrets from "./utils/retrieveSecrets";

let Crypto: {};
let table: Table;
let User: any;
let Project: any;
let Account: any;

export class Users {
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
    Project = table.getModel("Project");
    Account = table.getModel("Account");
  };

  insert = async (data: any) => {
    table.setContext({ accountId: data.accountId });
    return User.create({ name: data.name, email: data.email, password: data.password, permissionLevel: data.permissionLevel });
  };

  findById = async (id: string) => {
    return User.get({ id: id }, { index: "gs4", follow: true });
  };

  findByApiKey = async (apiKey: string) => {
    return User.find({ apiKey: apiKey }, { index: "gs1", follow: true });
  };

  getByEmail = async (email: string) => {
    return User.get({ email: email });
  };

  findByEmail = async (email: string) => {
    return User.find({ email: email }, { index: "gs1", follow: true });
  };

  list = async (accountId: string, query: any) => {
    let key = {};
    if (accountId) key = { pk: `account#${accountId}` };
    return User.find(key, { index: "gs1", follow: true }, query);
  };

  removeById = async (id: string) => {
    return User.remove({ id: id }, { index: "gs4", follow: true });
  };

}
export default Users