// The encryption key comes from the service's environment, and only from there.
import encryptionSettings from "../src/utils/encryptionSettings";

afterEach(() => { delete process.env.CRYPTO_PRIMARY_PASSWORD; });

test("CRYPTO_PRIMARY_PASSWORD is the key", async () => {
  process.env.CRYPTO_PRIMARY_PASSWORD = "from-env";
  expect(await encryptionSettings()).toEqual({ CryptoPrimaryPassword: "from-env" });
});

test("without it, the models refuse to start rather than read another source", async () => {
  await expect(encryptionSettings()).rejects.toThrow(/CRYPTO_PRIMARY_PASSWORD is not set/);
  process.env.CRYPTO_PRIMARY_PASSWORD = "";
  await expect(encryptionSettings()).rejects.toThrow(/CRYPTO_PRIMARY_PASSWORD is not set/);
});
