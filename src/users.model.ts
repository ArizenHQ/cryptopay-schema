import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Model, Table } from "dynamodb-onetable";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new Dynamo({ client: new DynamoDBClient({ region: "eu-west-1" }) });
import Schema from "./schema";
import retrieveSecrets from "./utils/retrieveSecrets";

export class Users {

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
    return new Users(secretsString)
  }

  insert = async (data: any) => {
    this.table.setContext({ accountId: data.accountId });
    return await this.User.create({ name: data.name, email: data.email, password: data.password, permissionLevel: data.permissionLevel });
  };

  findById = async (id: string) => {
    return await this.User.get({ id: id }, { index: "gs4", follow: true });
  };

  findByApiKey = async (apiKey: string) => {
    return await this.User.find({ apiKey: apiKey }, { index: "gs1", follow: true });
  };

  getByEmail = async (email: string) => {
    return await this.User.get({ email: email });
  };

  findByEmail = async (email: string) => {
    return await this.User.find({ email: email }, { index: "gs1", follow: true });
  };

  patchById = async (id: string, data: any) => {
    let user = await this.Project.get({ id: id }, { index: "gs4", follow: true });
    this.table.setContext({ accountId: user.accountId });
    data.id = id;
    return await this.User.update(data);
  };

  list = async (accountId: string, query: any) => {
    let key = {};
    if (accountId) key = { pk: `account#${accountId}` };
    return await this.User.find(key, { index: "gs1", follow: true }, query);
  };

  removeById = async (id: string) => {
    return await this.User.remove({ id: id }, { index: "gs4", follow: true });
  };

}
export default Users