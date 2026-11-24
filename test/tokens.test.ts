// The token models: what they write and delete. revokeAll runs over a fake model;
// deleteExpired over the real table with a client whose send is replaced, so its
// condition is built and marshalled as it is sent.
process.env.TABLE_CRYPTOPAY_ACCOUNTS = "t";
process.env.CRYPTO_PRIMARY_PASSWORD = "x";
import { RefreshToken } from "../src/refresh.token.model";
import { PasswordResetToken } from "../src/password.reset.token.model";

test("revokeAll writes each of the user's live tokens back whole, revoked", async () => {
  const tokens = await RefreshToken.init();
  const update = jest.fn(async (item: any) => item);
  tokens.RefreshToken = { find: async () => [{ userId: "u", tokenId: "t", tokenRefresh: "jwt", revoked: false }, { userId: "u", tokenId: "old", tokenRefresh: "jwt0", revoked: true }], update };
  await tokens.revokeAll("u");
  expect(update.mock.calls).toEqual([[{ userId: "u", tokenId: "t", tokenRefresh: "jwt", revoked: true }]]);
});

test.each([
  ["RefreshToken", RefreshToken, "refreshToken#"],
  ["PasswordResetToken", PasswordResetToken, "resetToken#"],
])("%s.deleteExpired deletes the tokens that expired before the given time", async (name, Model: any, sortPrefix) => {
  const tokens = await Model.init();
  const sent: any[] = [];
  const expired = { pk: { S: "user#u" }, sk: { S: `${sortPrefix}t` }, _type: { S: name }, userId: { S: "u" }, tokenId: { S: "t" } };
  tokens[name].table.client.send = async (command: any) => {
    sent.push([command.constructor.name, command.input]);
    return command.constructor.name === "QueryCommand" ? { Items: [expired] } : {};
  };
  await tokens.deleteExpired(new Date("2026-01-01T00:00:00Z"));
  const [[, query], [deleted, removal]] = sent;
  expect(query.FilterExpression).toMatch(/< :_\d+/);
  expect(Object.values(query.ExpressionAttributeValues)).toContainEqual({ S: "2026-01-01T00:00:00.000Z" });
  expect(deleted).toBe("DeleteItemCommand");
  expect(removal.Key).toEqual({ pk: { S: "user#u" }, sk: { S: `${sortPrefix}t` } });
});

test("RefreshToken.create stores expiresAt as the epoch-seconds ttl DynamoDB expires the token on", async () => {
  const tokens = await RefreshToken.init();
  const sent: any[] = [];
  tokens.RefreshToken.table.client.send = async (command: any) => {
    sent.push(command.input);
    return {};
  };
  await tokens.create({ userId: "u", tokenRefresh: "jwt", expiresAt: new Date("2026-01-01T00:00:00Z") });
  expect(sent[0].Item.ttl).toEqual({ N: "1767225600" });
});

test("RefreshToken alone carries the table's TTL attribute: DynamoDB deletes any item whose ttl has passed", async () => {
  const { default: Schema } = await import("../src/schema");
  const ttlModels = Object.entries(Schema.models as Record<string, Record<string, any>>)
    .filter(([, fields]) => Object.entries(fields).some(([name, field]) => name === "ttl" || field?.ttl || field?.map === "ttl"))
    .map(([model]) => model);
  expect(ttlModels).toEqual(["RefreshToken"]);
});
