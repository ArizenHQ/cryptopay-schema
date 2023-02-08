import { Dynamo } from 'dynamodb-onetable/Dynamo'
import { Model, Table, OneSchema } from 'dynamodb-onetable'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
const clientAccount = new Dynamo({ client: new DynamoDBClient({ region: "eu-west-1" }) })
import Schema from './schema';
import retrieveSecrets from "./utils/retrieveSecrets";

let Crypto: {};
let table: Table;
let User: any;
let Project: any;
let Account: any;

export class Accounts {
  constructor() {
    this.init()
  }

  insert = async (data) => {
    return Account.create({ name: data.name })
  }

  findById = async (id) => {
    return Account.get({ pk: `account#${id}` });
  }
  getAccount = async (id) => {
    return Account.get({ pk: `account#${id}` });
  }

  getFullAccount = async (id) => {
    table.setContext({ id: id })
    return table.fetch(['Account', 'User', 'Project'], { pk: `account#${id}` });
  }


  list = async (query) => {
    return Account.scan({}, query)
  }

  patchById = async (id, data) => {
    let account = Account.find({ id: id });
    return account.update(data)
  }

  removeById = async (id) => {
    return Account.remove({ id: id })
  }
  init = async () => {
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

}


export default Accounts