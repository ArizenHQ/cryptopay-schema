import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Table } from "dynamodb-onetable";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new Dynamo({ client: new DynamoDBClient({ region: "eu-west-1" }) });
import Schema from "./schema";
import retrieveSecrets from "./utils/retrieveSecrets";
import { paginateModel } from "./utils/paginateModel";

export class AuditLogs {
  table: Table;
  AuditLog: any;
  Crypto: any;
  secretsString: any;

  private constructor(secretsString: any) {
    this.secretsString = secretsString;
    this.Crypto = {
      primary: {
        cipher: "aes-256-gcm",
        password: this.secretsString.CryptoPrimaryPassword,
      },
    };
    this.table = new Table({
      client,
      schema: Schema,
      partial: false,
      crypto: this.Crypto,
      name: process.env.TABLE_CRYPTOPAY_ACCOUNTS,
    });
    this.AuditLog = this.table.getModel("AuditLog");
  }

  static init = async () => {
    const secretsString = await retrieveSecrets("/coinhouse-solution/CardPayment-configuration");
    return new AuditLogs(secretsString);
  };

  log = async (params: {
    accountId: string;
    entityType: string;
    entityId: string;
    action: string;
    by?: object;
    meta?: object;
  }) => {
    this.table.setContext({ accountId: params.accountId });
    return await this.AuditLog.create({
      accountId: params.accountId,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      by: params.by || { system: "temporal" },
      at: new Date().toISOString(),
      meta: params.meta || {},
    });
  };

  findByEntity = async (entityType: string, entityId: string, accountId: string, query: any = {}) => {
    this.table.setContext({ accountId });
    return await paginateModel(
      this.AuditLog,
      "find",
      {
        gs5pk: `auditLog#${entityType}#${entityId}`,
        gs5sk: { begins: "auditLog#" },
      },
      query,
      { index: "gs5", follow: true }
    );
  };

  findByAccount = async (accountId: string, query: any = {}) => {
    this.table.setContext({ accountId });
    return await paginateModel(
      this.AuditLog,
      "find",
      { gs1pk: "auditLog#" },
      query,
      { index: "gs1", follow: true }
    );
  };
}

export default AuditLogs;
