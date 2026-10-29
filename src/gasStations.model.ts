import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Table } from "dynamodb-onetable";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new Dynamo({
  client: new DynamoDBClient({ region: "eu-west-1" }),
});
import Schema from "./schema";
import retrieveSecrets from "./utils/retrieveSecrets";
import { paginateModel } from './utils/paginateModel';
import { withoutKeys } from "./utils/callerData";
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
      // Written by recordSent once the transfer is sent, never by the creator: transfer
      // events are routed by them.
      gasStation = withoutKeys(gasStation, ["transferId", "tx_hash"]);
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

  // The GasStation transfer sent as this DFNS transfer. A DFNS id names one transfer: two
  // records under it are an inconsistency, never resolved by picking one.
  findByTransferId = async (transferId: string) => {
    if (!transferId) throw new Error("findByTransferId: a DFNS transfer id is required");
    const result: any = await this.GasStation.find(
      { gs6pk: "gasStation#transferId", gs6sk: `gasStation#${transferId}` },
      { index: "gs6", follow: true }
    );
    const items = Array.isArray(result) ? result : result?.items || [];
    if (items.length > 1) throw new Error(`${items.length} GasStation transfers under DFNS transfer ${transferId}`);
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
      // The DFNS transfer id is written once, by recordSent.
      data = withoutKeys(data, ["transferId"]);
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

  findByBillingMonth = async (billingMonth: string, query: any = {}) => {
    return await paginateModel(
      this.GasStation,
      'find',
      { gs5pk: "gasStation#billing", gs5sk: { begins: `gasStation#${billingMonth}` } },
      query,
      { index: 'gs5', follow: true }
    );
  };

  // Atomic, condition-checked transition used right before sending the on-chain
  // transfer. Only succeeds if statusOrder is still CREATED, PENDING_APPROVAL or
  // APPROVED — a concurrent caller that already reserved (or moved past) this GasStation
  // gets a rejection instead of silently re-sending the transfer. This is independent
  // from any Temporal workflowId uniqueness, so it also protects against callers outside
  // the normal workflow path.
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

  // The transfer is sent: SENDING → PENDING with its DFNS transfer id, written once, and
  // its network hash when DFNS already has it. One conditional write; a retry of the same
  // send (same transfer id) gets the record back, any other caller a rejection.
  recordSent = async (id: string, { transferId, txHash }: { transferId: string; txHash?: string | null }) => {
    if (!transferId) throw new Error("recordSent: a DFNS transfer id is required");
    const gasStation = await this.GasStation.get({ id }, { index: "gs1", follow: true });
    if (!gasStation) throw new Error(`no gasStation found for id: ${id}`);
    if (gasStation.transferId === transferId) return gasStation;
    try {
      return await this.GasStation.update(
        { id, statusOrder: "PENDING", transferId, tx_date: new Date().toISOString(), ...(txHash ? { tx_hash: txHash } : {}) },
        {
          where: "${statusOrder} = {SENDING} and attribute_not_exists(${transferId})",
          return: "get",
          context: { accountId: gasStation.accountId },
        }
      );
    } catch (err: any) {
      if (err?.code === "ConditionalCheckFailedException") {
        const refused: any = new Error(`GasStation ${id} cannot record transfer ${transferId}: it is not SENDING, or already has a transfer id.`);
        refused.name = "GasStationNotSendableError";
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
