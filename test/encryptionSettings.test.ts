// The encryption key comes from the service's environment when it sets it, and from
// the CardPayment configuration secret otherwise.
const retrieveSecrets = jest.fn(async () => ({ CryptoPrimaryPassword: "from-secret" }));
jest.mock("../src/utils/retrieveSecrets", () => ({ __esModule: true, default: retrieveSecrets }));

import encryptionSettings from "../src/utils/encryptionSettings";

afterEach(() => {
  delete process.env.CRYPTO_PRIMARY_PASSWORD;
  retrieveSecrets.mockClear();
});

test("CRYPTO_PRIMARY_PASSWORD is the key, without reading any secret", async () => {
  process.env.CRYPTO_PRIMARY_PASSWORD = "from-env";
  expect(await encryptionSettings()).toEqual({ CryptoPrimaryPassword: "from-env" });
  expect(retrieveSecrets).not.toHaveBeenCalled();
});

test("without it, the key is read from the CardPayment configuration secret", async () => {
  expect(await encryptionSettings()).toEqual({ CryptoPrimaryPassword: "from-secret" });
  expect(retrieveSecrets).toHaveBeenCalledWith("/coinhouse-solution/CardPayment-configuration");
});
