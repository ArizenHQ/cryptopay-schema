import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Table } from "dynamodb-onetable";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new Dynamo({ client: new DynamoDBClient({ region: "eu-west-1" }) });
import Schema from './schema'
import retrieveSecrets from "./utils/retrieveSecrets";
import { paginateModel } from './utils/paginateModel';

export class Conversions {
  Crypto: any;
  table: Table;
  User: any;
  Project: any;
  Account: any;
  Order: any;
  Payment: any;
  Kyt: any;
  Conversion: any;
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
    this.Conversion = this.table.getModel("Conversion");
  }

  static init = async () => {
    const secretsString = await retrieveSecrets("/coinhouse-solution/CardPayment-configuration")
    return new Conversions(secretsString)
  }


  insert = async (accountId: string, data: any) => {
    try {
      const account = await this.Account.get({ id: accountId });
      this.table.setContext({ accountId: accountId });
      data.accountId = accountId;
      return await this.Conversion.create(data).then(async (conversion: any) => {
        return conversion;
      })
    } catch (error) {
      throw new Error(`Error during add new conversion ${error}`);
    }
  };

  findById = async (id: string) => {
    return await this.Conversion.get({ id: id }, { index: "gs1", follow: true });
  };

  findPublicById = async (id: string) => {
    let order = await this.Conversion.get({ id: id }, { index: "gs1", follow: true });
    return order;
  };

  scan = async (params: any = {}, query: any = {}) => {
    return await paginateModel(this.Conversion, 'scan', params, query);
  };

  getById = async (id: string) => {
    return await this.Conversion.get({ id: id }, { index: "gs1", follow: true });
  };

  getByOrderId = async (orderId: string) => {
    return await this.scan({orderId: orderId}, {})
  }

  list = async (accountId: string, query: any = {}) => {
    const key: any = {};
    if (accountId) key.pk = `account#${accountId}`;
  
    return await paginateModel(this.Conversion, 'find', key, query, {
      index: 'gs1',
      follow: true,
    });
  };

  patchById = async (id: string, data: any) => {
    try {
      let conversion = await this.Conversion.get({ id: id }, { index: "gs1", follow: true });
      if (!conversion) throw new Error(`no order fund for id: ${id}`)
      this.table.setContext({ accountId: conversion.accountId });
      data.id = id;
      return await this.Conversion.update(data, {return: 'get'});
    } catch (err) {
      throw new Error(`Error during update order ${err}`);
    }
  };

  removeById = async (id: string) => {
    let conversion = await this.Conversion.get({ id: id }, { index: "gs1", follow: true });
    if (!conversion) throw new Error(`Order not found`);
    return this.Conversion.remove({ sk: `order#${id}`, pk: `account#${conversion.accountId}` });
  };


}
export default Conversions