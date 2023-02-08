const { APIGatewayClient, CreateApiKeyCommand, CreateUsagePlanKeyCommand, DeleteApiKeyCommand, GetApiKeyCommand } = require("@aws-sdk/client-api-gateway");
const client = new APIGatewayClient({ region: "eu-west-1" });
const retrieveSecrets = require("./retrieveSecrets");

exports.importApiKey = async (obj) => {
    const params = {
        customerId: obj.project.accountId,
        enabled: true,
        generateDistinctId: false,
        name: `${obj.accountName}-${obj.project.codeProject}`,
        value: obj.project.apiKey,
        description: `Created the ${new Date().toISOString()} for account ${obj.accountName}`,
    }
        const command = new CreateApiKeyCommand(params);

  return new Promise(async (resolve, reject) => {

    try {
        const data = await client.send(command);
        resolve(data.id)
      } catch (error) {
        reject(error);
      } 
  });
};

exports.removeApiKey = async (apiKeyId) => {
    const params = {
        apiKey: apiKeyId
    }
        const command = new DeleteApiKeyCommand(params);

  return new Promise(async (resolve, reject) => {

    try {
        const data = await client.send(command);
        resolve(data)
      } catch (error) {
        reject(error);
      }
  });
};

exports.configureUsagePlanKey = async (keyId) => {
    const secretsString = await retrieveSecrets("/coinhouse-solution/CardPayment-configuration");
    const inputUsagePlanKey = {
        keyId: keyId,
        keyType: "API_KEY",
        usagePlanId: secretsString.usagePlanIdPublicApi,
    }
    const command = new CreateUsagePlanKeyCommand(inputUsagePlanKey);

  return new Promise(async (resolve, reject) => {

    try {
        const data = await client.send(command);
        resolve(data.value)

      } catch (error) {
        reject(error);
      } 
  });
};

exports.getKeyRoute = async (apiKey) => {
    return new Promise((resolve, reject) => {});
}


exports.getApiKeyId = async (apiKey) => {
  const command = new GetApiKeyCommand({apiKey: apiKey});
    return new Promise((resolve, reject) => {});
}