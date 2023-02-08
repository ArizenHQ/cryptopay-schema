const AWS = require("aws-sdk");

module.exports = (secret="/cardpayment-service/adyen") => {
	//configure AWS SDK
	const region = "eu-west-1";
	const client = new AWS.SecretsManager({ region });

	const SecretId = secret;
	return new Promise((resolve, reject) => {
		//retrieving secrets from secrets manager
		client.getSecretValue({ SecretId }, (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(JSON.parse(data.SecretString));
			}
		});
	});
};