import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Table } from "dynamodb-onetable";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new Dynamo({ client: new DynamoDBClient({ region: "eu-west-1" }) });
import Schema from "./schema.js";
import retrieveSecrets from "./utils/retrieveSecrets";
let Crypto;
let table;
let User;
let Project;
let Account;
const init = async () => {
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
init();
exports.insert = async (data) => {
    table.setContext({ accountId: data.accountId });
    return User.create({ name: data.name, email: data.email, password: data.password, permissionLevel: data.permissionLevel });
};
exports.findById = async (id) => {
    return User.get({ id: id }, { index: "gs4", follow: true });
};
exports.findByApiKey = async (apiKey) => {
    return User.find({ apiKey: apiKey }, { index: "gs1", follow: true });
};
exports.getByEmail = async (email) => {
    return User.get({ email: email });
};
exports.findByEmail = async (email) => {
    return User.find({ email: email }, { index: "gs1", follow: true });
};
exports.list = async (accountId, query) => {
    let key = {};
    if (accountId)
        key = { pk: `account#${accountId}` };
    return User.find(key, { index: "gs1", follow: true }, query);
};
exports.removeById = async (id) => {
    return User.remove({ id: id }, { index: "gs4", follow: true });
};
export default init;
//# sourceMappingURL=users.model.js.map