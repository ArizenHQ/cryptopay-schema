import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Table } from "dynamodb-onetable";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new Dynamo({
  client: new DynamoDBClient({ region: "eu-west-1" }),
});
import Schema from "./schema";
import retrieveSecrets from "./utils/retrieveSecrets";
import { paginateModel, PaginatedResult } from './utils/paginateModel';

export class Accounts {
  Crypto: any;
  table: Table;
  User: any;
  Project: any;
  Account: any;
  Order: any;
  Payment: any;
  Kyt: any;
  Partner: any;
  secretsString: any;

  private constructor(secretsString: any) {
    this.secretsString = secretsString;

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
    this.Partner = this.table.getModel("Partner");
  }

  static init = async () => {
    const secretsString = await retrieveSecrets(
      "/coinhouse-solution/CardPayment-configuration"
    );
    return new Accounts(secretsString);
  };

  insert = async (data: any) => {
    const accountData = {
      name: data.name,
      isReseller: data.isReseller || false,
      parentAccountId: data.parentAccountId || null
    };
    return await this.Account.create(accountData);
  };

  findById = async (id: string) => {
    return await this.Account.get({ pk: `account#${id}` });
  };
  getAccount = async (id: string) => {
    return await this.Account.get({ pk: `account#${id}` });
  };

  getFullAccount = async (id: string) => {
    this.table.setContext({ id: id });
    return await this.table.fetch(["Account", "User", "Project"], {
      pk: `account#${id}`,
    });
  };

  list = async (query: any = {}) => {
    return await paginateModel(this.Account, 'find', { gs1pk: 'account#' }, query, {
      index: 'gs1',
      follow: true,
    });
  };

  scan = async (query: any = {}) => {
    return await paginateModel(this.Account, 'scan', {}, query);
  };

  patchById = async (id: string, data: any) => {
    let account = this.Account.find({ id: id });
    return await account.update(data, { return: "get" });
  };

  removeById = async (id: string) => {
    return await this.Account.remove({ id: id });
  };

  createReseller = async (data: any) => {
    const accountData = {
      name: data.name,
      isReseller: true
    };
    const account = await this.Account.create(accountData);
    
    await this.Partner.create({
      id: account.id,
      name: data.name,
      type: data.partnerType || "reseller"
    });
    
    return account;
  };

  createClientAccount = async (resellerAccountId: string, data: any) => {
    const reseller = await this.getAccount(resellerAccountId);
    if (!reseller || !reseller.isReseller) {
      throw new Error("Invalid reseller account");
    }
    
    return await this.Account.create({
      name: data.name,
      isReseller: false,
      parentAccountId: resellerAccountId
    });
  };

  hasAccessToAccount = async (accessorId: string, targetId: string) => {
    // Si c'est le même compte, accès autorisé
    if (accessorId === targetId) return true;
    
    // Récupérer le compte cible
    const targetAccount = await this.getAccount(targetId);
    if (!targetAccount) return false;
    
    // Si le compte cible a comme parentAccountId l'accessorId, alors l'accès est autorisé
    return targetAccount.parentAccountId === accessorId;
  };

  listClientsOfReseller = async (resellerAccountId: string, query: any = {}) => {
    
    const resellerAccount = await this.getAccount(resellerAccountId);
    if (!resellerAccount || !resellerAccount.isReseller) {
      throw new Error("Account is not a reseller");
    }

    return await paginateModel(this.Account, 'find', 
      { gs5pk: `reseller#${resellerAccountId}` }, 
      query,
      { index: 'gs5', follow: true }
    );
  };
}

export default Accounts;
