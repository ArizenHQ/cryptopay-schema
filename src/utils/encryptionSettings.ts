import retrieveSecrets from "./retrieveSecrets";

// The key the models encrypt their crypt:true attributes with (user passwords, project
// HMAC secrets). CRYPTO_PRIMARY_PASSWORD, set by the service from its own secret, is
// read first; without it, the key is read from the CardPayment configuration secret.
const encryptionSettings = async (): Promise<{ CryptoPrimaryPassword: string }> =>
	process.env.CRYPTO_PRIMARY_PASSWORD
		? { CryptoPrimaryPassword: process.env.CRYPTO_PRIMARY_PASSWORD }
		: retrieveSecrets("/coinhouse-solution/CardPayment-configuration");

export default encryptionSettings;
