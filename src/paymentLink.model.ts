import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Table } from "dynamodb-onetable";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new Dynamo({ client: new DynamoDBClient({ region: "eu-west-1" }) });
import Schema from './schema'
import encryptionSettings from "./utils/encryptionSettings";
import { paginateModel } from './utils/paginateModel';
import { withoutKeys } from "./utils/callerData";

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
    const secretsString = await encryptionSettings()
    return new PaymentLinks(secretsString)
  }

  insert = async (projectId: string, data: any, incrementCount: boolean) => {
    try {
      data = withoutKeys(data, ["id"]);
      const project = await this.Project.get({ id: projectId }, { index: "gs2", follow: true });
      data.accountId = project.accountId;
      data.projectId = projectId;
      return await this.PaymentLink.create(data, { context: { accountId: project.accountId } });
    } catch (error) {
      console.error(error)
      throw new Error(`Error during add or update new PaymentLink ${error}`);
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
      data = withoutKeys(data);
      let paymentLink = await this.PaymentLink.get({ id: id }, { index: "gs1", follow: true });
      if (!paymentLink) throw new Error(`no PaymentLink fund for id: ${id}`)
      data.id = id;
      const currentDate = new Date();
      data.dateLastUpdated = currentDate.getTime();
      return await this.PaymentLink.update(data, { return: 'get', context: { accountId: paymentLink.accountId } });
    } catch (err) {
      throw new Error(`Error during update PaymentLink ${err}`);
    }
  };

  // Writes a merchant's change to a link still pending that no payer holds at `now` (ISO).
  // Returns null when refused.
  patchIfFree = async (id: string, data: any, now: string) =>
    await this.conditionally(id, withoutKeys(data), {},
      "${statusPaymentLink} = {pending} and (attribute_not_exists(${activationClaimedUntil}) or ${activationClaimedUntil} < @{now})", { now });

  // Claims a pending, unexpired link until `until`, unless another claim runs past `now`
  // (both ISO dates): two payers, on any task, never both turn the link into an order.
  // Returns null when refused.
  claimActivation = async (id: string, now: string, until: string) =>
    await this.conditionally(id, { activationClaimedUntil: until }, {},
      "${statusPaymentLink} = {pending} and ${expiresAt} > @{now} and (attribute_not_exists(${activationClaimedUntil}) or ${activationClaimedUntil} < @{now})", { now });

  // Turns the link claimed until `until` into the order created meanwhile. Refused, and
  // null, when that claim lapsed and another was taken since.
  completeActivation = async (id: string, until: string, orderId: string, params: any) =>
    await this.conditionally(id, { statusPaymentLink: "activated", orderId, params }, { remove: ["activationClaimedUntil"] },
      "${statusPaymentLink} = {pending} and ${activationClaimedUntil} = @{until}", { until });

  // Gives up the claim made until `until`, so that the payer can try again at once. A
  // claim taken since is kept. Returns null when there was nothing to give up.
  releaseActivation = async (id: string, until: string) =>
    await this.conditionally(id, {}, { remove: ["activationClaimedUntil"] }, "${activationClaimedUntil} = @{until}", { until });

  // The link as last written, which an index read may not show yet.
  getCurrent = async (id: string) => {
    const link = await this.PaymentLink.get({ id: id }, { index: "gs1" });
    return link && (await this.PaymentLink.get({ pk: `account#${link.accountId}`, sk: `paymentLink#${id}` }, { consistent: true }));
  };

  // The changed fields go in the properties, so that the index keys built from them
  // (gs2sk from orderId) are written too.
  private conditionally = async (id: string, fields: any, options: any, where: string, substitutions: any) => {
    const link = await this.PaymentLink.get({ id: id }, { index: "gs1", follow: true });
    if (!link) throw new Error(`no PaymentLink found for id: ${id}`);
    try {
      return await this.PaymentLink.update({ ...fields, id }, { ...options, where, substitutions, return: "get", context: { accountId: link.accountId } });
    } catch (err: any) {
      if (err?.code === "ConditionalCheckFailedException") return null;
      throw err;
    }
  };

  removeById = async (id: string) => {
    let paymentLink = await this.PaymentLink.get({ id: id }, { index: "gs1", follow: true });
    if (!paymentLink) throw new Error(`PaymentLink not found`);
    return await this.PaymentLink.remove({ sk: `paymentLink#${id}`, pk: `account#${paymentLink.accountId}` });
  };

}
export default PaymentLinks