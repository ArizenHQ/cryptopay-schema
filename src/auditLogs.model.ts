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

  /**
   * Writes one audit entry. A caller-chosen `id` makes the write idempotent: the entry
   * is created once, a second write with the same id fails its condition.
   * @param params.id - Optional entry id; a ULID by default.
   * @param params.at - Optional ISO time of the event; now by default.
   */
  log = async (params: {
    id?: string;
    at?: string;
    accountId: string;
    entityType: string;
    entityId: string;
    action: string;
    by?: object;
    meta?: object;
  }) => {
    return await this.AuditLog.create({
      ...(params.id ? { id: params.id } : {}),
      accountId: params.accountId,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      by: params.by || { system: "temporal" },
      at: params.at || new Date().toISOString(),
      meta: params.meta || {},
    }, { context: { accountId: params.accountId } });
  };

  findByEntity = async (entityType: string, entityId: string, accountId: string, query: any = {}) => {
    return await paginateModel(
      this.AuditLog,
      "find",
      {
        gs5pk: `auditLog#${entityType}#${entityId}`,
        gs5sk: { begins: "auditLog#" },
      },
      query,
      // gs5 projects every attribute: no follow-up read per entry. The account filter
      // keeps another account's entries out.
      { index: "gs5", context: { accountId } }
    );
  };

  findByAccount = async (accountId: string, query: any = {}) => {
    return await paginateModel(
      this.AuditLog,
      "find",
      { gs1pk: "auditLog#" },
      query,
      { index: "gs1", follow: true, context: { accountId } }
    );
  };
}

export default AuditLogs;
