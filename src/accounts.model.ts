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
    
    // Si parentAccountId a été fourni (défini ou null), mettre à jour gs5pk
    if (data.parentAccountId !== undefined) {
      if (data.parentAccountId) {
        // Si un nouveau parent est défini
        data.gs5pk = `reseller#${data.parentAccountId}`;
      } else {
        // Si parentAccountId est null (suppression du parent)
        data.gs5pk = "standard#account";
      }
    } else if (!currentAccount.gs5pk) {
      // Si gs5pk n'est pas défini sur le compte existant, ajouter une valeur par défaut
      if (currentAccount.parentAccountId) {
        data.gs5pk = `reseller#${currentAccount.parentAccountId}`;
      } else {
        data.gs5pk = "standard#account";
      }
    }
    
    // Traitement spécial pour les comptes revendeurs
    if ((data.isReseller === true || (currentAccount.isReseller && data.isReseller !== false)) 
        && !data.parentAccountId && !currentAccount.parentAccountId) {
      // Si c'est un compte revendeur (sans parent), utiliser son propre ID comme partie du gs5pk
      data.gs5pk = `reseller#${id}`;
    }
    
    // Mettre à jour le compte
    const updatedAccount = await this.Account.update(data, { return: "get" });
    
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


  createClientAccount = async (resellerAccountId: string, data: any) => {
    // Vérifier que le revendeur existe et est valide
    const reseller = await this.getAccount(resellerAccountId);
    if (!reseller || !reseller.isReseller) {
      throw new Error("Invalid reseller account");
    }
    
    // Créer le compte client avec la valeur gs5pk spécifique
    const clientAccount = await this.Account.create({
      name: data.name,
      isReseller: false,
      parentAccountId: resellerAccountId,
      gs5pk: `reseller#${resellerAccountId}` // Écraser la valeur par défaut
    });
    
    return clientAccount;
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

  updateAccountsWithDefaultGs5pk = async () => {
    try {
      // Récupérer tous les comptes sans gs5pk défini
      const accounts = await this.Account.scan();
      console.log(`Found ${accounts.length} accounts to check.`);
      
      let updatedCount = 0;
      let errorCount = 0;
      
      for (const account of accounts) {
        try {
          // Si c'est un compte client, gs5pk doit être "reseller#x"
          this.patchById(account.id, account);
          updatedCount++;
        } catch (error) {
          console.error(`Error updating account ${account.id}:`, error);
          errorCount++;
        }
      }
      
      console.log(`Update completed: ${updatedCount} accounts updated, ${errorCount} errors.`);
      
      return {
        total: accounts.length,
        updated: updatedCount,
        errors: errorCount
      };
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  };

  hasClients = async (resellerAccountId: string) => {
    const clients = await this.Account.find({
      parentAccountId: resellerAccountId
    }, { limit: 1 });
    return clients.length > 0;
  };
}

export default Accounts;
