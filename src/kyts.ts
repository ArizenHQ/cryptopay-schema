import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Table } from "dynamodb-onetable";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new Dynamo({ client: new DynamoDBClient({ region: "eu-west-1" }) });
import Schema from './schema'
import retrieveSecrets from "./utils/retrieveSecrets";

export class Kyts {
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
    return new Kyts(secretsString)
  }


  insert = async (accountId: string, data: any) => {
    try {
      const account = await this.Account.get({ id: data.accountId });
      this.table.setContext({ accountId: data.accountId });
      data.accountId = accountId;
      return this.Kyt.create(data).then(async (kyt: any) => {
        return kyt;
      })
    } catch (error) {
      throw new Error(`Error during add new kyt ${error}`);
    }
  };

  findById = async (id: string) => {
    return this.Kyt.get({ id: id }, { index: "gs2", follow: true });
  };

  findPublicById = async (id: string) => {
    let order = await this.Kyt.get({ id: id }, { index: "gs2", follow: true });
    return order;
  };

  scan = async (params: any, query: any) => {
    return this.Kyt.scan(params, query)
  }

  getById = async (id: string) => {
    return this.Kyt.get({ id: id }, { index: "gs1", follow: true });
  };


  list = async (accountId: string, query: any) => {
    let key = {};
    if (accountId) key = { pk: `account#${accountId}` };
    return this.Kyt.find(key, { index: "gs1", follow: true }, query);
  };

  patchById = async (id: string, data: any) => {
    try {
      let kyt = await this.Kyt.get({ id: id }, { index: "gs1", follow: true });
      if (!kyt) throw new Error(`no kyt fund for id: ${id}`)
      this.table.setContext({ accountId: kyt.accountId });
      data.id = id;
      const currentDate = new Date();
      data.dateLastUpdated = currentDate.getTime();
      return this.Kyt.update(data);
    } catch (err) {
      throw new Error(`Error during update kyt ${err}`);
    }
  };

  removeById = async (id: string) => {
    let kyt = await this.Kyt.get({ id: id }, { index: "gs1", follow: true });
    if (!kyt) throw new Error(`Kyt not found`);
    return this.Kyt.remove({ sk: `kyt#${id}`, pk: `account#${kyt.accountId}` });
  };

}
export default Kyts