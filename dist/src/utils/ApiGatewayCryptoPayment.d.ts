declare const importApiKey: (obj: any) => Promise<unknown>;
declare const removeApiKey: (apiKeyId: string) => Promise<unknown>;
declare const configureUsagePlanKey: (keyId: string) => Promise<unknown>;
declare const getKeyRoute: (apiKey: string) => Promise<unknown>;
declare const getApiKeyId: (apiKey: string) => Promise<unknown>;
export { getApiKeyId, getKeyRoute, configureUsagePlanKey, removeApiKey, importApiKey };
