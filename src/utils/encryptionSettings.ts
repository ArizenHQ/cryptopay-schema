// The key the models encrypt their crypt:true attributes with (user passwords, project
// HMAC secrets), set by the service from its own secret.
const encryptionSettings = async (): Promise<{ CryptoPrimaryPassword: string }> => {
	const key = process.env.CRYPTO_PRIMARY_PASSWORD;
	if (!key) throw new Error("CRYPTO_PRIMARY_PASSWORD is not set: encrypted attributes can be neither read nor written");
	return { CryptoPrimaryPassword: key };
};

export default encryptionSettings;
