import {Dynamo} from 'dynamodb-onetable/Dynamo'
import {Model, Table, OneSchema} from 'dynamodb-onetable' 
import {DynamoDBClient} from '@aws-sdk/client-dynamodb' 
const clientAccount = new Dynamo({client: new DynamoDBClient({ region: "eu-west-1" })})
import Schema from './schema';
import retrieveSecrets from "./utils/retrieveSecrets";

let Crypto: {};
let table: Table;
let User: any;
let Project: any;
let Account: any;

const init = async () => {
  const secretsString: any = await retrieveSecrets("/coinhouse-solution/CardPayment-configuration");

  Crypto = {
    primary: {
      cipher: "aes-256-gcm",
      password: secretsString.CryptoPrimaryPassword,
    },
  };

  table = new Table({
    client: clientAccount,
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


exports.insert = async (data)=> {
    return Account.create({name: data.name})
}

exports.findById = async (id) => {
    return Account.get({pk: `account#${id}`});
}

exports.getAccount = async (id) => {
    return Account.get({pk: `account#${id}`});
}

exports.getFullAccount = async (id) => {
    table.setContext({id: id})
    return table.fetch(['Account', 'User', 'Project'], {pk: `account#${id}`});
}


exports.list = async (query) => {
    return Account.scan({},query)
}

exports.patchById = async (id, data) => {
    let account = Account.find({id: id});
    return account.update(data)
}

exports.removeById = async (id) => {
    return Account.remove({id:id})
}

export default init