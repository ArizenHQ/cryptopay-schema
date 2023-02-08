import { APIGatewayClient, CreateApiKeyCommand, CreateUsagePlanKeyCommand, DeleteApiKeyCommand, GetApiKeyCommand } from '@aws-sdk/client-api-gateway'

const clientUtils = new APIGatewayClient({ region: "eu-west-1" });
import retrieveSecrets from "./retrieveSecrets";

const importApiKey = async (obj: any) => {
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
        const data = await clientUtils.send(command);
        resolve(data.id)
      } catch (error) {
        reject(error);
      } 
  });
};

const removeApiKey = async (apiKeyId: string) => {
    const params = {
        apiKey: apiKeyId
    }
        const command = new DeleteApiKeyCommand(params);

  return new Promise(async (resolve, reject) => {

    try {
        const data = await clientUtils.send(command);
        resolve(data)
      } catch (error) {
        reject(error);
      }
  });
};

const configureUsagePlanKey = async (keyId: string) => {
    const secretsString: any = await retrieveSecrets("/coinhouse-solution/CardPayment-configuration");
    const inputUsagePlanKey = {
        keyId: keyId,
        keyType: "API_KEY",
        usagePlanId: secretsString.usagePlanIdPublicApi,
    }
    const command = new CreateUsagePlanKeyCommand(inputUsagePlanKey);

  return new Promise(async (resolve, reject) => {

    try {
        const data = await clientUtils.send(command);
        resolve(data.value)

      } catch (error) {
        reject(error);
      } 
  });
};

const getKeyRoute = async (apiKey: string) => {
    return new Promise((resolve, reject) => {});
}


const getApiKeyId = async (apiKey: string) => {
  const command = new GetApiKeyCommand({apiKey: apiKey});
    return new Promise((resolve, reject) => {});
}
export {getApiKeyId, getKeyRoute, configureUsagePlanKey, removeApiKey, importApiKey} 
