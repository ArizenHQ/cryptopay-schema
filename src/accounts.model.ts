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
  // Récupérer le compte actuel
  const currentAccount = await this.Account.get({ id: id });
  if (!currentAccount) {
    throw new Error(`Account not found with id: ${id}`);
  }
  
  // Mettre à jour le compte
  const updatedAccount = await this.Account.update(data, { return: "get" });
  
  // Si parentAccountId a été modifié, mettre à jour gs5pk
  if (data.parentAccountId !== undefined && data.parentAccountId !== currentAccount.parentAccountId) {
    await this.updateGs5pk(id, data.parentAccountId);
    
    // Récupérer à nouveau le compte après la mise à jour de gs5pk
    return await this.Account.get({ id: id });
  }
  
  return updatedAccount;
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

  updateGs5pk = async (id: string, parentAccountId: string | null) => {
    try {
      if (parentAccountId) {
        await this.Account.update({
          id: id,
          gs5pk: `reseller#${parentAccountId}`
        });
      } else {
        // Si null ou undefined, supprimer l'attribut ou le définir à null
        await this.Account.update({
          id: id,
          gs5pk: null
        });
      }
      return true;
    } catch (error) {
      console.error("Error updating gs5pk:", error);
      return false;
    }
  };

  createClientAccount = async (resellerAccountId: string, data: any) => {
    // Vérifier que le revendeur existe et est valide
    const reseller = await this.getAccount(resellerAccountId);
    if (!reseller || !reseller.isReseller) {
      throw new Error("Invalid reseller account");
    }
    
    // Étape 1: Créer le compte client de base
    const clientAccount = await this.Account.create({
      name: data.name,
      isReseller: false,
      parentAccountId: resellerAccountId
    });
    
    // Étape 2: Mettre à jour explicitement le champ gs5pk
    await this.updateGs5pk(clientAccount.id, resellerAccountId);
    
    // Récupérer et retourner le compte mis à jour
    return await this.Account.get({ id: clientAccount.id });
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
    // Vérifier que le compte est un revendeur
    const resellerAccount = await this.getAccount(resellerAccountId);
    if (!resellerAccount || !resellerAccount.isReseller) {
      throw new Error("Account is not a reseller");
    }
    
    // Utiliser la clé gs5pk pour récupérer tous les clients de ce revendeur
    return await paginateModel(
      this.Account, 
      'find', 
      { gs5pk: `reseller#${resellerAccountId}` }, 
      query,
      { index: 'gs5', follow: true }
    );
  };
}

export default Accounts;
