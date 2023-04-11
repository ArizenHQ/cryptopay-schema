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


  insert = async (projectId: string, data: any, incrementCount: boolean) => {
    try {
      const project = await this.Project.get({ id: projectId }, { index: "gs2", follow: true });
      this.table.setContext({ accountId: project.accountId });
      data.accountId = project.accountId;
      data.projectId = projectId;

      const kyt = await this.Kyt.get({ address: data.address }, { index: "gs2", follow: true })
      let param = {}
      if(incrementCount) param = { add: { calls: 1 } };

      if (kyt) {
        data.id = kyt.id
        return this.Kyt.update(data, param).then(async (_kyt: any) => {
          return _kyt;
        })
      } else {
        return this.Kyt.create(data).then(async (_kyt: any) => {
          return _kyt;
        })
      }
    } catch (error) {
      console.error(error)
      throw new Error(`Error during add or update new kyt ${error}`);
    }
  };

  findById = async (id: string) => {
    return await this.Kyt.get({ id: id }, { index: "gs2", follow: true });
  };

  findPublicById = async (id: string) => {
    let order = await this.Kyt.get({ id: id }, { index: "gs2", follow: true });
    return order;
  };

  scan = async (params: any, query: any) => {
    return await this.Kyt.scan(params, query)
  }

  getById = async (id: string) => {
    return await this.Kyt.get({ id: id }, { index: "gs1", follow: true });
  };


  list = async (accountId: string, query: any) => {
    let key = {};
    if (accountId) key = { pk: `account#${accountId}` };
    return await this.Kyt.find(key, { index: "gs1", follow: true }, query);
  };

  patchById = async (id: string, data: any) => {
    try {
      let kyt = await this.Kyt.get({ id: id }, { index: "gs1", follow: true });
      if (!kyt) throw new Error(`no kyt fund for id: ${id}`)
      this.table.setContext({ accountId: kyt.accountId });
      data.id = id;
      const currentDate = new Date();
      data.dateLastUpdated = currentDate.getTime();
      return await this.Kyt.update(data, {return: 'get'});
    } catch (err) {
      throw new Error(`Error during update kyt ${err}`);
    }
  };

  removeById = async (id: string) => {
    let kyt = await this.Kyt.get({ id: id }, { index: "gs1", follow: true });
    if (!kyt) throw new Error(`Kyt not found`);
    return await this.Kyt.remove({ sk: `kyt#${id}`, pk: `account#${kyt.accountId}` });
  };

}
export default Kyts