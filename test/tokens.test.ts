// The token models over a fake OneTable model: what they write and delete.
process.env.TABLE_CRYPTOPAY_ACCOUNTS = "t";
jest.mock("../src/utils/retrieveSecrets", () => ({ __esModule: true, default: async () => ({ CryptoPrimaryPassword: "x" }) }));
import { RefreshToken } from "../src/refresh.token.model";
import { PasswordResetToken } from "../src/password.reset.token.model";

test("revokeAll writes each of the user's tokens back whole, revoked", async () => {
  const tokens = await RefreshToken.init();
  const update = jest.fn(async (item: any) => item);
  tokens.RefreshToken = { find: async () => [{ userId: "u", tokenId: "t", tokenRefresh: "jwt", revoked: false }], update };
  await tokens.revokeAll("u");
  expect(update).toHaveBeenCalledWith({ userId: "u", tokenId: "t", tokenRefresh: "jwt", revoked: true });
});

test.each([
  ["RefreshToken", RefreshToken],
  ["PasswordResetToken", PasswordResetToken],
])("%s.deleteExpired removes the tokens expired at the given time", async (name, Model: any) => {
  const tokens = await Model.init();
  const expired = { userId: "u", tokenId: "t" };
  const find = jest.fn(async (_key: any, _params: any) => [expired]);
  const remove = jest.fn(async () => undefined);
  tokens[name] = { find, remove };
  const now = new Date("2026-01-01T00:00:00Z");
  await tokens.deleteExpired(now);
  expect(find.mock.calls[0][1]).toMatchObject({ where: "${expiresAt} < @{now}", substitutions: { now } });
  expect(remove).toHaveBeenCalledWith(expired);
});
