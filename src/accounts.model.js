const {Dynamo} = require('dynamodb-onetable/Dynamo')
const {Model, Table} = require ( 'dynamodb-onetable' )
const {DynamoDBClient} = require ( '@aws-sdk/client-dynamodb' )
const client = new Dynamo({client: new DynamoDBClient({ region: "eu-west-1" })})
const schema = require("./shema.js")
const retrieveSecrets = require("./utils/retrieveSecrets");
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
    name: "Accounts",
    schema: schema,
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