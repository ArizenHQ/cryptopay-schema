import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Table } from "dynamodb-onetable";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new Dynamo({
  client: new DynamoDBClient({ region: "eu-west-1" }),
});
import Schema from "./schema";
import retrieveSecrets from "./utils/retrieveSecrets";
import { paginateModel } from './utils/paginateModel';
// A transfer amount: a finite number above zero ("0.1", 0.1), never negative or text.
const isPositiveAmount = (amount: any): boolean => {
  const value = Number(amount);
  return amount !== null && amount !== "" && Number.isFinite(value) && value > 0;
};

export class GasStations {
  Crypto: any;
  table: Table;
  User: any;
  Project: any;
  Account: any;
  Order: any;
  GasStation: any;
  Payment: any;
  Kyt: any;
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
      /*logger: (level, message, context) => {
        console.log(`${new Date().toLocaleString()}: ${level}: ${message}`)
        console.log(JSON.stringify(context, null, 4) + '\n')
    }*/
    });

    this.User = this.table.getModel("User");
    this.Project = this.table.getModel("Project");
    this.Account = this.table.getModel("Account");
    this.Order = this.table.getModel("Order");
    this.Payment = this.table.getModel("Payment");
    this.Kyt = this.table.getModel("Kyt");
    this.GasStation = this.table.getModel("GasStation");
  }

  static init = async () => {
    const secretsString = await retrieveSecrets(
      "/coinhouse-solution/CardPayment-configuration"
    );
    return new GasStations(secretsString);
  };

  insert = async (gasStation: any, projectId: String) => {
    try {
      const project = await this.Project.get(
        { id: projectId },
        { index: "gs2", follow: true }
      );
      if (Object.keys(project).length > 0) {
        if (project.typeProject !== "gasStation")
          throw new Error(
            "That project is not configured for type gasStation. Please choose another one, create a new one or chnage this one for this kind of project. Be careful, if you change the project type, all your other instance could be impacted"
          );

        gasStation.accountId = project.accountId;
        gasStation.codeProject = project.codeProject;
        gasStation.projectId = project.id;

        if (
          !project.parameters.gasStation.currency ||
          !project.parameters.gasStation.limitPer24H
        )
          throw new Error(
            "That project is not fine configured. Please update your project with paramaeters for project type gasStation"
          );
        if (!isPositiveAmount(gasStation.amount))
          throw new Error(
            "Amount propertie is incorrect. Please enter a value > 0"
          );
        // The daily limit is in the project's currency: no other currency is sent.
        if (String(gasStation.currency).toUpperCase() !== String(project.parameters.gasStation.currency).toUpperCase())
          throw new Error(`Currency not allowed for this project: only ${project.parameters.gasStation.currency}`);
        if (
          !(await this.isGasStationAvailable(
            project.accountId,
            project.id,
            gasStation.amount,
            gasStation.currency
          ))
        )
          throw new Error(
            "The daily purchase limit has been exceeded. Please change amount"
          );
      } else {
        throw new Error(
          `Project not found! Please check your codeProject or API Key`
        );
      }
      return await this.GasStation.create(gasStation, { context: { accountId: gasStation.accountId } }).then(
        async (gasStation: any) => {
          delete gasStation.audit;
          return gasStation;
        }
      );
    } catch (error) {
      throw new Error(`Error during add new gasStation request ${error}`);
    }
  };

  /**
   * Whether a transfer keeps the project within its daily limit, in the project's
   * currency: the project's transfers of the last 24 hours in that currency, FAILED
   * ones excluded, plus this one, against parameters.gasStation.limitPer24H.
   * @param accountId - The project's account.
   * @param projectId - The project.
   * @param amount - The new transfer's amount.
   * @param currency - Its currency; all currencies when absent.
   * @returns Whether the transfer fits within the limit.
   * @throws When the transfers or the project cannot be read.
   */
  isGasStationAvailable = async (accountId: string, projectId: string, amount: any, currency?: string) => {
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const context = { accountId };
      // Every transfer of the project (gs2 = gasStation#<projectId>), all pages.
      const recent: any[] = await this.GasStation.find(
        { projectId },
        { index: "gs2", where: "${dateCreated} >= {" + since + "}", context }
      );
      const counted = (recent || []).filter((gas: any) =>
        gas.statusOrder !== "FAILED" && (!currency || String(gas.currency).toUpperCase() === String(currency).toUpperCase()));
      const sum = counted.reduce((total: number, gas: any) => total + (isPositiveAmount(gas.amount) ? Number(gas.amount) : 0), Number(amount));
      const project = await this.Project.get({ id: projectId }, { index: "gs2", follow: true, context });
      return Number(project.parameters.gasStation.limitPer24H) >= sum;
    } catch (e: any) {
      throw new Error(`Error during isGasStationAvailable: ${e.message}`);
    }
  };

  findById = async (id: string) => {
    return await this.GasStation.get(
      { id: id },
      { index: "gs2", follow: true }
    );
  };

  findPublicById = async (id: string) => {
    let order = await this.GasStation.get(
      { id: id },
      { index: "gs2", follow: true }
    );
    return order;
  };

  scan = async (params: any = {}, query: any = {}) => {
    return await paginateModel(this.GasStation, 'scan', params, query);
  };

  getById = async (id: string) => {
    return await this.GasStation.get(
      { id: id },
      { index: "gs1", follow: true }
    );
  };

  findByTxHash = async (txHash: string) => {
    const result: any = await this.GasStation.find(
      { gs6pk: "gasStation#txHash", gs6sk: `gasStation#${txHash}` },
      { index: "gs6", follow: true }
    );
    const items = Array.isArray(result) ? result : result?.items || [];
    return items[0] || null;
  };

  list = async (accountId: string, projectId: string, query: any) => {
    const key: Key = {};
    if (accountId) key.pk = `account#${accountId}`;
    if (projectId) key.projectId = projectId;
    return await paginateModel(this.GasStation, 'find', key, query, {
      index: 'gs4',
      follow: true,
    });
  };

  patchById = async (id: string, data: any) => {
    try {
      let gasStation = await this.GasStation.get(
        { id: id },
        { index: "gs1", follow: true }
      );
      if (!gasStation) throw new Error(`no gasStation fund for id: ${id}`);
      data.id = id;
      return await this.GasStation.update(data, { return: "get", context: { accountId: gasStation.accountId } });
    } catch (err) {
      throw new Error(`Error during update gasStation ${err}`);
    }
  };

  // Atomic, condition-checked transition used right before sending the on-chain
  // transfer. Only succeeds if statusOrder is still CREATED — a concurrent caller
  // that already reserved (or moved past) this GasStation gets a rejection instead
  // of silently re-sending the transfer. This is independent from any Temporal
  // workflowId uniqueness, so it also protects against callers outside the
  // normal workflow path.
  findByBillingMonth = async (billingMonth: string, query: any = {}) => {
    return await paginateModel(
      this.GasStation,
      'find',
      { gs5pk: "gasStation#billing", gs5sk: { begins: `gasStation#${billingMonth}` } },
      query,
      { index: 'gs5', follow: true }
    );
  };

  reserveForTransfer = async (id: string) => {
    let gasStation = await this.GasStation.get(
      { id: id },
      { index: "gs1", follow: true }
    );
    if (!gasStation) throw new Error(`no gasStation found for id: ${id}`);
    try {
      return await this.GasStation.update(
        { id, statusOrder: "SENDING" },
        {
          where: "${statusOrder} = {CREATED} or ${statusOrder} = {PENDING_APPROVAL} or ${statusOrder} = {APPROVED}",
          return: "get",
          context: { accountId: gasStation.accountId },
        }
      );
    } catch (err: any) {
      // Only a refused condition means "already reserved/sent". Callers treat that as
      // final and must be able to tell it from a throttle or a timeout, which they retry.
      if (err?.code === "ConditionalCheckFailedException") {
        const refused: any = new Error(`GasStation ${id} is not reservable for transfer: it is no longer in CREATED, PENDING_APPROVAL or APPROVED status (already reserved, sent, or otherwise moved on).`);
        refused.name = "GasStationNotReservableError";
        refused.code = err.code;
        throw refused;
      }
      throw err;
    }
  };

  removeById = async (id: string) => {
    let gasStation = await this.GasStation.get(
      { id: id },
      { index: "gs1", follow: true }
    );
    if (!gasStation) throw new Error(`gasStation not found`);
    return await this.Order.remove({
      sk: `gasStation#${id}`,
      pk: `account#${gasStation.accountId}`,
    });
  };
}
export default GasStations;

interface Key {
  [key: string]: any;
}

interface Params {
  [key: string]: any;
}
