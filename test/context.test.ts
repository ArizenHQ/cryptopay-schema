// Every model method scopes its reads and writes to an account through the context of
// the call itself: nothing is left on the shared table for the next request, whatever
// account it is for. The DynamoDB client is replaced by one that records each command
// and answers with the items the test gives it.
import { marshall } from "@aws-sdk/util-dynamodb";

process.env.TABLE_CRYPTOPAY_ACCOUNTS = "test-table";

const sent: { name: string; input: any }[] = [];
let answer: (name: string, input: any) => any = () => ({});

jest.mock("@aws-sdk/client-dynamodb", () => {
  const actual = jest.requireActual("@aws-sdk/client-dynamodb");
  class DynamoDBClient {
    config = {};
    async send(command: any) {
      sent.push({ name: command.constructor.name, input: command.input });
      return answer(command.constructor.name, command.input);
    }
  }
  return { ...actual, DynamoDBClient };
});
jest.mock("../src/utils/retrieveSecrets", () => ({ __esModule: true, default: async () => ({ CryptoPrimaryPassword: "test" }) }));
jest.mock("../src/utils/ApiGatewayCryptoPayment", () => ({ importApiKey: async () => "key-id", configureUsagePlanKey: async () => {}, removeApiKey: async () => {} }));

import { GasStations } from "../src/gasStations.model";
import { Orders } from "../src/orders.model";
import { AuditLogs } from "../src/auditLogs.model";

const A = "aaaaaaaa-0000-4000-8000-000000000001";
const B = "bbbbbbbb-0000-4000-8000-000000000002";

const project = {
  pk: `account#${A}`, sk: "project#33333333-3333-4333-8333-333333333333", id: "33333333-3333-4333-8333-333333333333", accountId: A, codeProject: "c-1", name: "P", typeProject: "gasStation",
  status: "active", parameters: { gasStation: { currency: "ETH", limitPer24H: 100 } },
};
const transfer = (accountId: string) => ({
  pk: `account#${accountId}`, sk: "gasStation#11111111-1111-4111-8111-111111111111", id: "11111111-1111-4111-8111-111111111111", accountId, projectId: "33333333-3333-4333-8333-333333333333", internalRef: "r", amount: "1", statusOrder: "CREATED",
});
const order = (accountId: string) => ({
  pk: `account#${accountId}`, sk: "order#22222222-2222-4222-8222-222222222222", id: "22222222-2222-4222-8222-222222222222", orderId: "22222222-2222-4222-8222-222222222222", accountId, typeOrder: "crypto", amount: 1, statusOrder: "CREATED",
});

// A query answers `items`, a get answers the first one; writes answer nothing.
const serve = (items: any[]) => {
  answer = (name) => {
    if (name === "QueryCommand" || name === "ScanCommand") return { Items: items.map((i) => marshall(i, { removeUndefinedValues: true })), Count: items.length };
    if (name === "GetItemCommand") return items[0] ? { Item: marshall(items[0], { removeUndefinedValues: true }) } : {};
    if (name === "UpdateItemCommand" || name === "PutItemCommand") return { Attributes: items[0] ? marshall(items[0], { removeUndefinedValues: true }) : undefined };
    return {};
  };
};
const last = (name: string) => {
  const found = [...sent].reverse().find((c) => c.name === name);
  if (!found) throw new Error(`no ${name} sent; sent: ${sent.map((c) => c.name).join(", ")}`);
  return found.input;
};
const filterOf = (input: any) => {
  const names = input.ExpressionAttributeNames || {};
  return Object.values(names).includes("accountId") ? input.ExpressionAttributeValues : null;
};
const accountOfWrite = (input: any) => input.Item?.accountId?.S ?? input.Key?.pk?.S;

beforeEach(() => { sent.length = 0; });

test("a GasStation insert writes under the project's account and leaves no filter on later lists", async () => {
  const model = await GasStations.init();
  serve([project]);
  await model.insert({ amount: "1", currency: "ETH", internalRef: "r" }, "33333333-3333-4333-8333-333333333333").catch(() => {});
  expect(accountOfWrite(last("PutItemCommand"))).toBe(A);

  serve([]);
  await model.list(null as any, null as any, { limit: 50, page: 0 });
  expect(filterOf(last("QueryCommand"))).toBeNull();
  await model.findByBillingMonth("2026-09");
  expect(filterOf(last("QueryCommand"))).toBeNull();
});

test("a GasStation patch keeps the stored account whatever the data says", async () => {
  const model = await GasStations.init();
  serve([transfer(A)]);
  const err: any = await model.patchById("11111111-1111-4111-8111-111111111111", { accountId: B, statusOrder: "SENDING" }).then(() => null, (e: any) => e);
  if (!sent.some((c) => c.name === "UpdateItemCommand")) throw new Error("patch failed: " + err?.message);
  const update = last("UpdateItemCommand");
  expect(update.Key.pk.S).toBe(`account#${A}`);
  expect(JSON.stringify(update.ExpressionAttributeValues || {})).not.toContain(B);

  serve([]);
  await model.list(null as any, null as any, { limit: 50, page: 0 });
  expect(filterOf(last("QueryCommand"))).toBeNull();
});

test("an Order patch or quote hold keeps the stored account and leaves no filter on later lists", async () => {
  const model = await Orders.init();
  serve([order(A)]);
  await model.patchById("22222222-2222-4222-8222-222222222222", { accountId: B, statusOrder: "CANCELLED" }).catch(() => {});
  expect(last("UpdateItemCommand").Key.pk.S).toBe(`account#${A}`);
  await model.holdQuote("22222222-2222-4222-8222-222222222222", "2026-09-30T00:00:00.000Z").catch(() => {});
  expect(last("UpdateItemCommand").Key.pk.S).toBe(`account#${A}`);

  serve([]);
  await model.list(null as any, { limit: 50, page: 0 });
  expect(filterOf(last("QueryCommand"))).toBeNull();
});

test("audit reads stay scoped to the account asked for, and only that call", async () => {
  const model = await AuditLogs.init();
  serve([]);
  await model.findByAccount(A, { limit: 10, page: 0 });
  expect(Object.values(filterOf(last("QueryCommand")) || {})).toContainEqual({ S: A });
  await model.findByEntity("Order", "o-1", B, { limit: 10, page: 0 });
  const scoped = Object.values(filterOf(last("QueryCommand")) || {});
  expect(scoped).toContainEqual({ S: B });
  expect(scoped).not.toContainEqual({ S: A });

  await model.log({ accountId: B, entityType: "Order", entityId: "o-1", action: "CREATED" });
  expect(accountOfWrite(last("PutItemCommand"))).toBe(B);
});

import { Accounts } from "../src/accounts.model";
import { Projects } from "../src/projects.model";
import { Kyts } from "../src/kyts.model";
import { PasswordResetToken } from "../src/password.reset.token.model";

const P = "33333333-3333-4333-8333-333333333333";
const OTHER_P = "44444444-4444-4444-8444-444444444444";

test("an account patch writes the account asked for, whatever id or keys the data carries", async () => {
  const model = await Accounts.init();
  serve([{ pk: `account#${A}`, sk: "account#", id: A, name: "A" }]);
  await model.patchById(A, { id: B, pk: `account#${B}`, gs5pk: `reseller#${B}`, name: "renamed" });
  // A unique field (name) makes OneTable write through a transaction.
  const update = last("TransactWriteItemsCommand").TransactItems.map((t: any) => t.Update).find(Boolean);
  expect(update.Key.pk.S).toBe(`account#${A}`);
  expect(JSON.stringify(update.ExpressionAttributeValues || {})).not.toContain(B);
});

test("a project patch keeps its own keys and refuses another account", async () => {
  const model = await Projects.init();
  serve([project]);
  await model.patchById(P, { pk: `account#${B}`, sk: `project#${OTHER_P}`, name: "x" }).catch(() => {});
  const update = last("UpdateItemCommand");
  expect(update.Key.pk.S).toBe(`account#${A}`);
  expect(update.Key.sk.S).toBe(`project#${P}`);
  await expect(model.patchById(P, { accountId: B })).rejects.toThrow(/cannot change account/);
  serve([project]);
  await model.patchById(P, { resellerAccountId: B, name: "y" }).catch(() => {});
  expect(JSON.stringify(last("UpdateItemCommand").ExpressionAttributeValues || {})).not.toContain(B);
});

test("an order created with foreign keys in its data is written in its own account", async () => {
  const model = await Orders.init();
  serve([project]);
  await model.insert(A, { pk: `account#${B}`, sk: "order#x", id: "55555555-5555-4555-8555-555555555555", amount: 1, internalRef: "r", codeProject: "c-1", typeOrder: "crypto", currency: "ETH" }).catch(() => {});
  const put = last("PutItemCommand");
  expect(put.Item.pk.S).toBe(`account#${A}`);
  // The id is the caller's to set (the API ties the order to its wallet by it); the keys follow it.
  expect(put.Item.id.S).toBe("55555555-5555-4555-8555-555555555555");
  expect(put.Item.sk.S).toBe("order#55555555-5555-4555-8555-555555555555");
});

test("a query cannot lift the account filter of an audit read", async () => {
  const model = await AuditLogs.init();
  serve([]);
  await model.findByAccount(A, { limit: 10, page: 0, context: {} });
  expect(Object.values(filterOf(last("QueryCommand")) || {})).toContainEqual({ S: A });
});

test("the 24h limit of a project reads that project's account only", async () => {
  const model = await GasStations.init();
  serve([project]);
  await model.isGasStationAvailable(A, P, "1", "ETH");
  const query = sent.find((c) => c.name === "QueryCommand" && JSON.stringify(c.input).includes("gasStation#"))!.input;
  expect(Object.values(filterOf(query) || {})).toContainEqual({ S: A });
});

test("a KYT insert looks up the existing KYT in the project's account only", async () => {
  const model = await Kyts.init();
  serve([project]);
  await model.insert(P, { address: "0xabc" }, false).catch(() => {});
  const lookups = sent.filter((c) => c.name === "QueryCommand" && JSON.stringify(c.input).includes("0xabc"));
  expect(lookups.length).toBeGreaterThan(0);
  for (const q of lookups) expect(Object.values(filterOf(q.input) || {})).toContainEqual({ S: A });
});

test("a project's API key is stored on the project's own item", async () => {
  const model = await Projects.init();
  serve([]);
  await model.createApiKey({ accountName: "A", project: { ...project, typeProject: "gasStation" } });
  expect(last("UpdateItemCommand").Key.pk.S).toBe(`account#${A}`);
});

test("a reset token created for one user leaves the next lookup unfiltered", async () => {
  const model = await PasswordResetToken.init();
  serve([]);
  await model.create({ userId: "user-1", token: "t1", expiresAt: new Date(Date.now() + 60000) }).catch(() => {});
  await model.findByToken("t2");
  const query = last("QueryCommand");
  expect(JSON.stringify(query.ExpressionAttributeNames || {})).not.toContain("userId");
});
