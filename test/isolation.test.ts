// Tenant isolation of every listable model, on a real DynamoDB (DynamoDB Local): data
// is written through the models' own methods for accounts A, A2 (clients of reseller
// R) and B, interleaved, on one instance per model as the API and the worker keep it.
// Then each list must return exactly its scope: one account when an account is asked,
// every account when none is, the reseller's clients for a reseller read.
//
// Needs DYNAMODB_ENDPOINT (e.g. http://localhost:8000); CI runs DynamoDB Local as a service.
import { CreateTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

const endpoint = process.env.DYNAMODB_ENDPOINT;
if (!endpoint) throw new Error("DYNAMODB_ENDPOINT is required for the isolation tests (DynamoDB Local)");
const TABLE = `isolation-${Date.now()}`;
Object.assign(process.env, {
  TABLE_CRYPTOPAY_ACCOUNTS: TABLE,
  AWS_ENDPOINT_URL_DYNAMODB: endpoint,
  AWS_ACCESS_KEY_ID: "local",
  AWS_SECRET_ACCESS_KEY: "local",
  AWS_REGION: "eu-west-1",
});

jest.mock("../src/utils/retrieveSecrets", () => ({ __esModule: true, default: async () => ({ CryptoPrimaryPassword: "isolation" }) }));
jest.mock("../src/utils/ApiGatewayCryptoPayment", () => ({ importApiKey: async () => "key-id", configureUsagePlanKey: async () => {}, removeApiKey: async () => {} }));

import Schema from "../src/schema";
import { Accounts } from "../src/accounts.model";
import { Projects } from "../src/projects.model";
import { Users } from "../src/users.model";
import { GasStations } from "../src/gasStations.model";
import { Orders } from "../src/orders.model";
import { PaymentLinks } from "../src/paymentLink.model";
import { Kyts } from "../src/kyts.model";
import { AuditLogs } from "../src/auditLogs.model";
import { GasStationStatements } from "../src/gasStationStatements.model";

jest.setTimeout(60000);

// The table as deployed: primary pk/sk and the gs1..gs6 indexes of the schema.
const createTable = async () => {
  const indexes: any = (Schema as any).indexes;
  const attributes = new Set<string>();
  const keySchema = (index: any) => {
    attributes.add(index.hash);
    const keys: any[] = [{ AttributeName: index.hash, KeyType: "HASH" }];
    if (index.sort) { attributes.add(index.sort); keys.push({ AttributeName: index.sort, KeyType: "RANGE" }); }
    return keys;
  };
  const primary = keySchema(indexes.primary);
  const gsis = Object.entries(indexes).filter(([name]) => name !== "primary").map(([name, index]: any) => ({
    IndexName: name, KeySchema: keySchema(index), Projection: { ProjectionType: "ALL" },
  }));
  const input: any = {
    TableName: TABLE, BillingMode: "PAY_PER_REQUEST", KeySchema: primary, GlobalSecondaryIndexes: gsis,
    AttributeDefinitions: Array.from(attributes).map((attribute) => ({ AttributeName: attribute, AttributeType: "S" })),
  };
  await new DynamoDBClient({ endpoint, region: "eu-west-1" }).send(new CreateTableCommand(input));
};

let m: any = {};
const acc: Record<string, string> = {};
const name: Record<string, string> = {};
const project: Record<string, any> = {};
const itemsOf = (result: any) => (Array.isArray(result) ? result : result?.items || []);
const scope = (result: any) => Array.from(new Set<string>(itemsOf(result).map((i: any) => name[i.accountId] || "?"))).sort();
const page = { limit: 100, page: 0 };

beforeAll(async () => {
  await createTable();
  m = {
    accounts: await Accounts.init(), projects: await Projects.init(), users: await Users.init(),
    gasStations: await GasStations.init(), orders: await Orders.init(), links: await PaymentLinks.init(),
    kyts: await Kyts.init(), audit: await AuditLogs.init(), statements: await GasStationStatements.init(),
  };
  const R = await m.accounts.createReseller({ name: "Reseller R" });
  const A = await m.accounts.createClientAccount(R.id, { name: "Client A" });
  const A2 = await m.accounts.createClientAccount(R.id, { name: "Client A2" });
  const B = await m.accounts.insert({ name: "Account B" });
  Object.assign(acc, { R: R.id, A: A.id, A2: A2.id, B: B.id });
  for (const [k, v] of Object.entries(acc)) name[v] = k;

  // Interleaved: every model is written for B last, so a context left by a write for B
  // would scope the lists below to B.
  for (const k of ["A", "A2", "B"]) {
    project[k] = await m.projects.insert({
      accountId: acc[k], name: `GS ${k}`, status: "active", codeProject: `gs-${k}`, typeProject: "gasStation",
      parameters: { gasStation: { currency: "ETH", limitPer24H: 100, commissionRate: 0.01 } },
    });
    await m.users.insert({ accountId: acc[k], name: `User ${k}`, email: `user-${k}@test.local`, password: "a-long-password", permissionLevel: 16 });
  }
  for (const k of ["A", "A2", "B"]) {
    for (let i = 0; i < 2; i++) {
      await m.gasStations.insert({ amount: "1", currency: "ETH", internalRef: `t-${k}-${i}` }, project[k].id);
      const order = await m.orders.insert(acc[k], { amount: 10, currency: "ETH", internalRef: `o-${k}-${i}`, codeProject: project[k].codeProject, typeOrder: "crypto" });
      await m.audit.log({ accountId: acc[k], entityType: "Order", entityId: order.id, action: "CREATED" });
    }
    await m.links.insert(project[k].id, { type: "cryptoOrder", internalRef: `l-${k}`, expiresAt: "2030-01-01T00:00:00.000Z" });
    await m.kyts.insert(project[k].id, { address: `0x${k}` }, false);
    await m.statements.insert({ projectId: project[k].id, month: "2026-09", lineItems: [], totalFeeEur: 0 });
  }
  // Billed as the workflow does on success, account B last.
  for (const k of ["A", "A2", "B"]) {
    for (const t of itemsOf(await m.gasStations.list(acc[k], null, page))) {
      await m.gasStations.patchById(t.id, { statusOrder: "SUCCESS", billingMonth: "2026-09", projectId: t.projectId });
    }
  }
  // More account B work: patches and scoped reads.
  const bTransfer = itemsOf(await m.gasStations.list(acc.B, null, page))[0];
  await m.gasStations.patchById(bTransfer.id, { internalRef: "patched" });
  const bOrder = itemsOf(await m.orders.list(acc.B, page))[0];
  await m.orders.patchById(bOrder.id, { internalRef: "patched" });
  await m.audit.findByEntity("Order", bOrder.id, acc.B);
  await m.projects.patchById(project.B.id, { description: "patched" });
});

const listable: [string, (accountId: string | null) => Promise<any>][] = [
  ["GasStations.list", (a) => m.gasStations.list(a, null, page)],
  ["Orders.list", (a) => m.orders.list(a, page)],
  ["PaymentLinks.list", (a) => m.links.list(a, page)],
  ["Kyts.list", (a) => m.kyts.list(a, page)],
  ["Projects.list", (a) => m.projects.list(a, page)],
  ["Users.list", (a) => m.users.list(a, page)],
];

describe.each(listable)("%s", (label, list) => {
  test("an account asked for returns that account only", async () => {
    for (const k of ["A", "A2", "B"]) expect(scope(await list(acc[k]))).toEqual([k]);
  });
  test("no account asked for returns every account", async () => {
    expect(scope(await list(null))).toEqual(["A", "A2", "B"]);
  });
});

test("GasStations.findByBillingMonth and findById see every account", async () => {
  expect(scope(await m.gasStations.findByBillingMonth("2026-09", page))).toEqual(["A", "A2", "B"]);
  const aTransfer = itemsOf(await m.gasStations.list(acc.A, null, page))[0];
  expect((await m.gasStations.findById(aTransfer.id))?.accountId).toBe(acc.A);
});

test("audit logs are read for the account asked for only", async () => {
  expect(scope(await m.audit.findByAccount(acc.A, page))).toEqual(["A"]);
  const aOrder = itemsOf(await m.orders.list(acc.A, page))[0];
  expect(scope(await m.audit.findByEntity("Order", aOrder.id, acc.A))).toEqual(["A"]);
  expect(itemsOf(await m.audit.findByEntity("Order", aOrder.id, acc.B))).toHaveLength(0);
});

test("a reseller reads its clients' accounts, projects and users, never another account", async () => {
  const clients = itemsOf(await m.accounts.listClientsOfReseller(acc.R, page)).map((a: any) => name[a.id]).sort();
  expect(clients).toEqual(["A", "A2"]);
  expect(scope(await m.projects.listProjectsForReseller(acc.R, page))).toEqual(["A", "A2"]);
  expect(scope(await m.users.listUsersForReseller(acc.R, page))).toEqual(["A", "A2"]);
});

test("statements are listed per project, whatever account was written last", async () => {
  for (const k of ["A", "A2", "B"]) expect(scope(await m.statements.listByProject(project[k].id, page))).toEqual([k]);
  expect(scope(await m.statements.listByMonth("2026-09", page))).toEqual(["A", "A2", "B"]);
});
