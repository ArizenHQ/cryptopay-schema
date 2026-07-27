import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Table } from "dynamodb-onetable";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new Dynamo({ client: new DynamoDBClient({ region: "eu-west-1" }) });
import Schema from "./schema";
import retrieveSecrets from "./utils/retrieveSecrets";
import { paginateModel } from "./utils/paginateModel";

export class GasStationStatements {
  Crypto: any;
  table: Table;
  Project: any;
  Account: any;
  GasStationStatement: any;
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
      client: client,
      schema: Schema,
      partial: false,
      crypto: this.Crypto,
      name: process.env.TABLE_CRYPTOPAY_ACCOUNTS,
    });
    this.Project = this.table.getModel("Project");
    this.Account = this.table.getModel("Account");
    this.GasStationStatement = this.table.getModel("GasStationStatement");
  }

  static init = async () => {
    const secretsString = await retrieveSecrets("/coinhouse-solution/CardPayment-configuration");
    return new GasStationStatements(secretsString);
  };

  insert = async (data: any) => {
    try {
      const project = await this.Project.get({ id: data.projectId }, { index: "gs2", follow: true });
      if (!project) throw new Error(`Project not found: ${data.projectId}`);
      this.table.setContext({ accountId: project.accountId });
      const safe = {
        projectId: data.projectId,
        accountId: project.accountId,
        month: data.month,
        lineItems: data.lineItems || [],
        totalFeeEur: data.totalFeeEur,
        status: "DRAFT" as const,
      };
      return await this.GasStationStatement.create(safe);
    } catch (error) {
      throw new Error(`Error during insert GasStationStatement: ${error}`);
    }
  };

  findById = async (id: string) => {
    return await this.GasStationStatement.get({ id }, { index: "gs1", follow: true });
  };

  findByProjectAndMonth = async (projectId: string, month: string) => {
    return await this.GasStationStatement.get(
      { gs3sk: `gasStationStatement#${month}#${projectId}` },
      { index: "gs3", follow: true }
    );
  };

  listByProject = async (projectId: string, query: any = {}) => {
    return await paginateModel(
      this.GasStationStatement,
      "find",
      { gs2sk: `gasStationStatement#${projectId}` },
      query,
      { index: "gs2", follow: true }
    );
  };

  listByMonth = async (month: string, query: any = {}) => {
    return await paginateModel(
      this.GasStationStatement,
      "find",
      { gs3sk: { begins: `gasStationStatement#${month}` } },
      query,
      { index: "gs3", follow: true }
    );
  };

  deleteById = async (id: string) => {
    try {
      const statement = await this.GasStationStatement.get({ id }, { index: "gs1", follow: true });
      if (!statement) throw new Error(`GasStationStatement not found: ${id}`);
      this.table.setContext({ accountId: statement.accountId });
      return await this.GasStationStatement.remove({ pk: `account#${statement.accountId}`, sk: `gasStationStatement#${id}` });
    } catch (err) {
      throw new Error(`Error during delete GasStationStatement: ${err}`);
    }
  };

  patchById = async (id: string, data: any) => {
    try {
      const statement = await this.GasStationStatement.get({ id }, { index: "gs1", follow: true });
      if (!statement) throw new Error(`GasStationStatement not found: ${id}`);
      this.table.setContext({ accountId: statement.accountId });
      data.id = id;
      return await this.GasStationStatement.update(data, { return: "get" });
    } catch (err) {
      throw new Error(`Error during update GasStationStatement: ${err}`);
    }
  };
}

export default GasStationStatements;
