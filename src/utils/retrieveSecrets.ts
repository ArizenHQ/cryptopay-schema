import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

// One client for the process; a stalled call fails instead of holding its caller.
const client = new SecretsManagerClient({
	region: "eu-west-1",
	requestHandler: { requestTimeout: 30_000, connectionTimeout: 5_000 },
});

// The secret's JSON value, parsed.
const retrieveSecrets = async (secret = "/cardpayment-service/adyen") => {
	const { SecretString } = await client.send(new GetSecretValueCommand({ SecretId: secret }));
	if (typeof SecretString !== "string") throw new Error(`Secret ${secret} has no text value`);
	return JSON.parse(SecretString);
};

export default retrieveSecrets;
