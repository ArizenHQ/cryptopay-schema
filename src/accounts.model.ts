import { Dynamo } from 'dynamodb-onetable/Dynamo'
import { Table } from 'dynamodb-onetable'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
const client = new Dynamo({ client: new DynamoDBClient({ region: "eu-west-1" }) });
import Schema from './schema';
import retrieveSecrets from "./utils/retrieveSecrets";

export class Accounts {
  Crypto: any;
  table: Table;
  User: any;
  Project: any;
  Account: any;
  Order: any;
  Payment: any;
  Kyt: any;  
  secretsString: any;
 
  private constructor(secretsString: any) {

    this.secretsString = secretsString

    this.Crypto = {
      primary: {
        cipher: "aes-256-gcm",
        password: this.secretsString.CryptoPrimaryPassword,
      },
    };

    this.table = new Table({
      client: client,
      schema: Schema,
      partial: false,
      crypto: this.Crypto,
      name: process.env.TABLE_CRYPTOPAY_ACCOUNTS,
    });

    this.User = this.table.getModel("User");
    this.Project = this.table.getModel("Project");
    this.Account = this.table.getModel("Account");
    this.Order = this.table.getModel("Order");
    this.Payment = this.table.getModel("Payment");
    this.Kyt = this.table.getModel("Kyt");

  }

  static init = async () => {
    const secretsString = await retrieveSecrets("/coinhouse-solution/CardPayment-configuration")
    return new Accounts(secretsString)
  }

  insert = async (data: any) => {
    return this.Account.create({ name: data.name })
  }

  findById = async (id: string) => {
    return this.Account.get({ pk: `account#${id}` });
  }
  getAccount = async (id: string) => {
    return this.Account.get({ pk: `account#${id}` });
  }

  getFullAccount = async (id: string) => {
    this.table.setContext({ id: id })
    return this.table.fetch(['Account', 'User', 'Project'], { pk: `account#${id}` });
  }


  list = async (query: any) => {
    return this.Account.scan({}, query)
  }

  patchById = async (id: string, data: any) => {
    let account = this.Account.find({ id: id });
    return account.update(data)
  }

  removeById = async (id: string) => {
    return this.Account.remove({ id: id })
  }

}

export default Accounts