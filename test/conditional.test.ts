// Conditional writes, on a real DynamoDB (DynamoDB Local): a payment link is turned into
// an order by one activation at a time, and a password is replaced only if nobody
// changed it since it was read.
//
// Needs DYNAMODB_ENDPOINT (e.g. http://localhost:8000); CI runs DynamoDB Local as a service.
import { CreateTableCommand, DeleteTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

const endpoint = process.env.DYNAMODB_ENDPOINT;
if (!endpoint) throw new Error("DYNAMODB_ENDPOINT is required for the conditional write tests (DynamoDB Local)");
const TABLE = `conditional-${Date.now()}`;
Object.assign(process.env, {
  TABLE_CRYPTOPAY_ACCOUNTS: TABLE,
  AWS_ENDPOINT_URL_DYNAMODB: endpoint,
  AWS_ACCESS_KEY_ID: "local",
  AWS_SECRET_ACCESS_KEY: "local",
  AWS_REGION: "eu-west-1",
});

jest.mock("../src/utils/retrieveSecrets", () => ({ __esModule: true, default: async () => ({ CryptoPrimaryPassword: "conditional" }) }));
jest.mock("../src/utils/ApiGatewayCryptoPayment", () => ({ importApiKey: async () => "key-id", configureUsagePlanKey: async () => {}, removeApiKey: async () => {} }));

import Schema from "../src/schema";
import { Accounts } from "../src/accounts.model";
import { Projects } from "../src/projects.model";
import { Users } from "../src/users.model";
import { PaymentLinks } from "../src/paymentLink.model";

jest.setTimeout(60000);

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
  await new DynamoDBClient({ endpoint, region: "eu-west-1" }).send(new CreateTableCommand({
    TableName: TABLE, BillingMode: "PAY_PER_REQUEST", KeySchema: primary, GlobalSecondaryIndexes: gsis,
    AttributeDefinitions: Array.from(attributes).map((attribute) => ({ AttributeName: attribute, AttributeType: "S" })),
  } as any));
};

let accountId: string;
let projectId: string;
let links: PaymentLinks;
let users: Users;

beforeAll(async () => {
  await createTable();
  const accounts = await Accounts.init();
  const projects = await Projects.init();
  links = await PaymentLinks.init();
  users = await Users.init();
  accountId = (await accounts.insert({ name: "Account" })).id;
  projectId = (await projects.insert({ accountId, name: "Project", status: "active", codeProject: "links", typeProject: "cryptoPayment", parameters: {} } as any)).id;
});

afterAll(async () => {
  await new DynamoDBClient({ endpoint, region: "eu-west-1" }).send(new DeleteTableCommand({ TableName: TABLE }));
});

const at = (seconds: number) => new Date(Date.UTC(2026, 10, 11, 10, 0, seconds)).toISOString();
const newLink = async () => links.insert(projectId, { type: "cryptoOrder", internalRef: "ref", expiresAt: new Date("2999-01-01T00:00:00.000Z") }, false);

describe("payment link activation", () => {
  test("one claim at a time; an expired claim is taken over; a link no longer pending is not claimed", async () => {
    const link = await newLink();
    const claims = await Promise.all([1, 2, 3].map(() => links.claimActivation(link.id, at(0), at(120))));
    expect(claims.filter(Boolean)).toHaveLength(1);
    expect(await links.claimActivation(link.id, at(60), at(180))).toBeNull();
    expect((await links.claimActivation(link.id, at(121), at(241)))?.activationClaimedUntil).toBe(at(241));

    await links.patchById(link.id, { statusPaymentLink: "activated", orderId: "order-1" });
    expect(await links.claimActivation(link.id, at(999), at(1119))).toBeNull();
  });

  test("a released claim lets the payer try again; a claim taken since is not released", async () => {
    const link = await newLink();
    expect(await links.claimActivation(link.id, at(0), at(120))).not.toBeNull();
    expect(await links.releaseActivation(link.id, at(120))).not.toBeNull();
    expect((await links.getById(link.id)).activationClaimedUntil).toBeUndefined();
    expect(await links.claimActivation(link.id, at(1), at(121))).not.toBeNull();

    expect(await links.claimActivation(link.id, at(122), at(242))).not.toBeNull();
    expect(await links.releaseActivation(link.id, at(121))).toBeNull();
    expect((await links.getById(link.id)).activationClaimedUntil).toBe(at(242));
  });
});

describe("payment link completion", () => {
  test("the claim that holds the link completes it; a lapsed claim taken over does not", async () => {
    const link = await newLink();
    expect(await links.claimActivation(link.id, at(0), at(120))).not.toBeNull();
    expect(await links.claimActivation(link.id, at(121), at(241))).not.toBeNull();
    expect(await links.completeActivation(link.id, at(120), "order-late", {})).toBeNull();
    expect((await links.getById(link.id)).statusPaymentLink).toBe("pending");

    const done = await links.completeActivation(link.id, at(241), "order-done", { euroAmount: 5 });
    expect(done).toMatchObject({ statusPaymentLink: "activated", orderId: "order-done", params: { euroAmount: 5 } });
    expect(done.activationClaimedUntil).toBeUndefined();
    expect((await links.findByOrderId("order-done")).map((l: any) => l.id)).toEqual([link.id]);
    expect((await links.getCurrent(link.id)).statusPaymentLink).toBe("activated");
    expect(await links.completeActivation(link.id, at(241), "order-2", {})).toBeNull();
  });

  test("a link removed meanwhile is neither claimed nor completed", async () => {
    const link = await newLink();
    const claimed = await links.claimActivation(link.id, at(0), at(120));
    expect(claimed).not.toBeNull();
    const model = (links as any).PaymentLink;
    await model.remove({ pk: `account#${accountId}`, sk: `paymentLink#${link.id}` });
    await expect(links.completeActivation(link.id, at(120), "order-1", {})).rejects.toThrow(/no PaymentLink/);
    expect(await links.getCurrent(link.id)).toBeFalsy();
  });

  test("an expired link is not claimed", async () => {
    const link = await links.insert(projectId, { type: "cryptoOrder", internalRef: "ref", expiresAt: new Date(Date.UTC(2026, 10, 11, 10, 0, 30)) }, false);
    expect(await links.claimActivation(link.id, at(31), at(151))).toBeNull();
    expect(await links.claimActivation(link.id, at(29), at(149))).not.toBeNull();
  });
});

describe("password replacement", () => {
  test("only the password is written: a change of another field made after the read is kept", async () => {
    const user = await users.insert({ accountId, email: "other@test.local", name: "User", password: "Typed!Passw0rd", permissionLevel: 4 } as any);
    const read = await users.findById(user.id);
    await (users as any).User.update({ pk: `account#${accountId}`, sk: "user#other@test.local" }, { set: { permissionLevel: 1, status: "inactive" } });
    const replaced = await users.replacePassword(user.id, "scrypt$derived-5", read.passwordLastUpdatedAt);
    expect(replaced).not.toBeNull();
    expect(replaced.apiKey).toBeUndefined();
    const after = await users.findById(user.id);
    expect(after).toMatchObject({ password: "scrypt$derived-5", permissionLevel: 1, status: "inactive", email: "other@test.local", name: "User" });
  });

  const newUser = async (email: string, more: any = {}) => users.insert({ accountId, email, name: "User", password: "Typed!Passw0rd", permissionLevel: 4, ...more } as any);
  const passwordOf = async (id: string) => (await users.findById(id)).password;

  test("a record never given a password date is replaced; mustResetPassword is kept", async () => {
    const user = await newUser("never@test.local", { mustResetPassword: true });
    const read = await users.findById(user.id);
    expect(read.passwordLastUpdatedAt).toBeUndefined();
    expect(await users.replacePassword(user.id, "scrypt$derived-1", read.passwordLastUpdatedAt)).not.toBeNull();
    expect(await passwordOf(user.id)).toBe("scrypt$derived-1");
    expect((await users.findById(user.id)).mustResetPassword).toBe(true);
  });

  test("a password changed after the read is kept", async () => {
    const user = await newUser("changed@test.local");
    await users.updatePassword(user.id, "First!Passw0rd");
    const read = await users.findById(user.id);
    expect(read.passwordLastUpdatedAt).toBeDefined();
    await new Promise((resolve) => setTimeout(resolve, 5));
    await users.updatePassword(user.id, "Changed!Passw0rd");
    expect(await users.replacePassword(user.id, "scrypt$derived-2", read.passwordLastUpdatedAt)).toBeNull();
    expect(await passwordOf(user.id)).toBe("Changed!Passw0rd");

    const fresh = await users.findById(user.id);
    expect(await users.replacePassword(user.id, "scrypt$derived-3", fresh.passwordLastUpdatedAt)).not.toBeNull();
    expect(await passwordOf(user.id)).toBe("scrypt$derived-3");
  });

  test("a read made before the first password date does not replace a password set since", async () => {
    const user = await newUser("first@test.local");
    const read = await users.findById(user.id);
    await users.updatePassword(user.id, "Reset!Passw0rd");
    expect(await users.replacePassword(user.id, "scrypt$derived-4", read.passwordLastUpdatedAt)).toBeNull();
    expect(await passwordOf(user.id)).toBe("Reset!Passw0rd");
  });
});
