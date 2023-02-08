import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Table } from "dynamodb-onetable";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new Dynamo({ client: new DynamoDBClient({ region: "eu-west-1" }) });
import Schema from './schema';
import retrieveSecrets from "./utils/retrieveSecrets";
let Crypto;
let table;
let User;
let Account;
let Order;
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
    Account = table.getModel("Account");
    Order = table.getModel("Order");
};
init();
exports.insert = async (accountId, data) => {
    try {
        const account = await Account.get({ id: data.accountId });
        table.setContext({ accountId: data.accountId });
        data.accountId = accountId;
        return Order.create(data).then(async (order) => {
            return order;
        });
    }
    catch (error) {
        throw new Error(`Error during add new order ${error}`);
    }
};
exports.findById = async (id) => {
    return Order.get({ id: id }, { index: "gs2", follow: true });
};
exports.findPublicById = async (id) => {
    let order = await Order.get({ id: id }, { index: "gs2", follow: true });
    ///////delete project.hmacPassword;
    ///////delete project.apiKey;
    ///////delete project.accountId;
    ///////delete project.status;
    ///////delete project.created;
    ///////delete project.updated;
    return order;
};
exports.getById = async (id) => {
    return Order.get({ id: id }, { index: "gs1", follow: true });
};
exports.list = async (accountId, query) => {
    let key = {};
    if (accountId)
        key = { pk: `account#${accountId}` };
    return Order.find(key, { index: "gs1", follow: true }, query);
};
exports.patchById = async (id, data) => {
    let order = await Order.get({ id: id }, { index: "gs2", follow: true });
    table.setContext({ accountId: order.accountId });
    data.id = id;
    return Order.update(data);
};
exports.removeById = async (id) => {
    let order = await Order.get({ id: id }, { index: "gs2", follow: true });
    if (!order)
        throw new Error(`Order not found`);
    return Order.remove({ sk: `order#${id}`, pk: `account#${order.accountId}` });
};
export default init;
//# sourceMappingURL=orders.model.js.map