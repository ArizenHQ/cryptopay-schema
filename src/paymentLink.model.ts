import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Table } from "dynamodb-onetable";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new Dynamo({ client: new DynamoDBClient({ region: "eu-west-1" }) });
import Schema from './schema'
import retrieveSecrets from "./utils/retrieveSecrets";
import { paginateModel } from './utils/paginateModel';

export class PaymentLinks {
  Crypto: any;
  table: Table;
  User: any;
  Project: any;
  Account: any;
  Order: any;
  Payment: any;
  Kyt: any;
  PaymentLink: any;
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
    this.PaymentLink = this.table.getModel("PaymentLink");
  }

  static init = async () => {
    const secretsString = await retrieveSecrets("/coinhouse-solution/CardPayment-configuration")
    return new PaymentLinks(secretsString)
  }

  insert = async (projectId: string, data: any, incrementCount: boolean) => {
    try {
      const project = await this.Project.get({ id: projectId }, { index: "gs2", follow: true });
      this.table.setContext({ accountId: project.accountId });
      data.accountId = project.accountId;
      data.projectId = projectId;
      return await this.PaymentLink.create(data);
    } catch (error) {
      console.error(error)
      throw new Error(`Error during add or update new kyt ${error}`);
    }
  };

  scan = async (params: any = {}, query: any = {}) => {
    return await paginateModel(this.Kyt, 'scan', params, query);
  }

  getById = async (id: string) => {
    return await this.PaymentLink.get({ id: id }, { index: "gs1", follow: true });
  };

  findByOrderId = async (orderId: string) => {
    return await this.PaymentLink.find({ orderId: orderId }, { index: "gs2", follow: true });
  };

  list = async (accountId: string, query: any = {}) => {
    const key: any = {};
    if (accountId) key.pk = `account#${accountId}`;
  
    return await paginateModel(this.PaymentLink, 'find', key, query, {
      index: 'gs3',
      follow: true,
    });
  };
  
  patchById = async (id: string, data: any) => {
    try {
      let kyt = await this.PaymentLink.get({ id: id }, { index: "gs1", follow: true });
      if (!kyt) throw new Error(`no kyt fund for id: ${id}`)
      this.table.setContext({ accountId: kyt.accountId });
      data.id = id;
      const currentDate = new Date();
      data.dateLastUpdated = currentDate.getTime();
      return await this.PaymentLink.update(data, {return: 'get'});
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
export default PaymentLinks