import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Table } from "dynamodb-onetable";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new Dynamo({ client: new DynamoDBClient({ region: "eu-west-1" }) });
import Schema from "./schema.js";
import { importApiKey, removeApiKey, configureUsagePlanKey } from "./utils/ApiGatewayCryptoPayment.js";
import retrieveSecrets from "./utils/retrieveSecrets";
let Crypto;
let table;
let User;
let Project;
let Account;
export class Projects {
    constructor() {
        this.init();
    }
    init = async () => {
        const secretsString = await retrieveSecrets("/coinhouse-solution/CardPayment-configuration");
        Crypto = {
            primary: {
                cipher: "aes-256-gcm",
                password: secretsString.CryptoPrimaryPassword,
            },
        };
        table = new Table({
            client: client,
            schema: Schema,
            partial: false,
            crypto: Crypto,
            name: "CryptoPay-Accounts",
        });
        User = table.getModel("User");
        Project = table.getModel("Project");
        Account = table.getModel("Account");
    };
    insert = async (data) => {
        try {
            const account = await Account.get({ id: data.accountId });
            table.setContext({ accountId: data.accountId });
            return Project.create({
                name: data.name,
                accountId: data.accountId,
                codeProject: data.codeProject,
                typeProject: data.typeProject,
                description: data.description,
                status: data.status,
                parameters: data.parameters,
            }).then(async (project) => {
                this.createApiKey({ accountName: account.name, project: project });
                return project;
            });
        }
        catch (error) {
            throw new Error(`Error during add new project ${error}`);
        }
    };
    findById = async (id) => {
        return Project.get({ id: id }, { index: "gs2", follow: true });
    };
    findPublicById = async (id) => {
        let project = await Project.get({ id: id }, { index: "gs2", follow: true });
        delete project.hmacPassword;
        delete project.apiKey;
        delete project.accountId;
        delete project.status;
        delete project.created;
        delete project.updated;
        return project;
    };
    findByApiKey = async (apiKey) => {
        return Project.get({ apiKey: apiKey }, { index: "gs3", follow: true });
    };
    getById = async (id) => {
        return Project.get({ id: id }, { index: "gs1", follow: true });
    };
    list = async (accountId, query) => {
        let key = {};
        if (accountId)
            key = { pk: `account#${accountId}` };
        return Project.find(key, { index: "gs1", follow: true }, query);
    };
    patchById = async (id, data) => {
        let project = await Project.get({ id: id }, { index: "gs2", follow: true });
        table.setContext({ accountId: project.accountId });
        data.id = id;
        this.createApiKey(data);
        return Project.update(data);
    };
    removeById = async (id) => {
        let project = await Project.get({ id: id }, { index: "gs2", follow: true });
        if (!project)
            throw new Error(`Project not found`);
        if (project.typeProject === "cryptoPayment")
            await removeApiKey(project.apiKeyId);
        return Project.remove({ sk: `project#${id}`, pk: `account#${project.accountId}` });
    };
    createApiKey = async (obj) => {
        if (obj.project.typeProject === "cryptoPayment") {
            await importApiKey(obj)
                .then(async (keyId) => {
                await configureUsagePlanKey(keyId).catch((error) => {
                    console.error(error);
                    throw new Error(`Error during configure usage plan key ${error}`);
                });
                await Project.update({ id: obj.project.id, apiKeyId: keyId });
            })
                .catch((error) => {
                console.error(error);
                throw new Error(`Error during import key ${error}`);
            });
        }
    };
}
export default Projects;
//# sourceMappingURL=projects.model.js.map