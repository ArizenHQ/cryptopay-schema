import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Model, Table } from "dynamodb-onetable";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new Dynamo({
  client: new DynamoDBClient({ region: "eu-west-1" }),
});
import Schema from "./schema";
import retrieveSecrets from "./utils/retrieveSecrets";
import { paginateModel } from "./utils/paginateModel";
import { createHash } from "crypto";

export class Users {
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
  }

  static init = async () => {
    const secretsString = await retrieveSecrets(
      "/coinhouse-solution/CardPayment-configuration"
    );
    return new Users(secretsString);
  };
  generateApiKey = () => {
    return createHash("sha256").update(Math.random().toString()).digest("hex");
  };
  insert = async (data: any) => {

    const account = await this.Account.get({ pk: `account#${data.accountId}` });
    if (!account) throw new Error("Account not found");
    
    let resellerAccountId = null;
    let gs5pk = null;
    if (account.parentAccountId) {
      resellerAccountId = account.parentAccountId;
      gs5pk = `reseller#${resellerAccountId}`;
    }

    this.table.setContext({ accountId: data.accountId });
    
    return await this.User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      permissionLevel: data.permissionLevel,
      resellerAccountId: resellerAccountId,
      apiKey: this.generateApiKey(),
      gs5pk: gs5pk,
    });
  };

  findById = async (id: string) => {
    return await this.User.get({ id: id }, { index: "gs4", follow: true });
  };

  findByApiKey = async (apiKey: string) => {
    return await this.User.find(
      { apiKey: apiKey },
      { index: "gs1", follow: true }
    );
  };

  getByEmail = async (email: string) => {
    return await this.User.get({ email: email });
  };

  findByEmail = async (email: string) => {
    return await this.User.find(
      { email: email },
      { index: "gs1", follow: true }
    );
  };

  patchById = async (id: string, data: any) => {
    let user = await this.User.get({ id: id }, { index: "gs4", follow: true });
    this.table.setContext({ accountId: user.accountId });
    
    const account = await this.Account.get({ pk: `account#${user.accountId}` });
    if (!account) throw new Error("Account not found");
    
    // Déterminer le nouveau resellerAccountId
    let resellerAccountId = null;
    if (account.parentAccountId) {
      resellerAccountId = account.parentAccountId;
    } else if (account.isReseller) {
      resellerAccountId = account.id;
    }
    
    // Ajouter le resellerAccountId aux données de mise à jour
    data.resellerAccountId = resellerAccountId;
    data.gs5pk = resellerAccountId ? `reseller#${resellerAccountId}` : "standard#user";

    if (data.password) {
      delete data.password;
    }

    return await this.User.update(data, { return: "get" });
  };


  updatePassword = async (id: string, password: string) => {
    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    let user = await this.User.get({ id: id }, { index: "gs4" });
    if (!user) {
      throw new Error("User not found");
    }
    const encryptedPassword = await (this.table as any).encrypt(password);
    return await this.User.update(user, {
      set: { password: encryptedPassword },
      return: "get",
    });
  };

  scan = async (query: any = {}) => {
    return await paginateModel(this.User, "scan", query, {
      index: "gs4",
      follow: true,
    });
  };

  list = async (accountId: string, query: any = {}) => {
    const key: any = {};
    if (accountId) key.pk = `account#${accountId}`;
    return await paginateModel(this.User, "find", key, query, {
      index: "gs4",
      follow: true,
    });
  };

  listUsersForReseller = async (resellerAccountId: string, query: any = {}) => {
    return await paginateModel(
      this.User,
      'find',
      { gs5pk: `reseller#${resellerAccountId}` },
      query,
      { index: 'gs5', follow: true }
    );
  };

  removeById = async (id: string) => {
    let user = await this.User.get(
      { id: id },
      { index: "gs1", follow: true, decrypt: true }
    );
    return await this.User.remove(
      { id: id, email: undefined },
      { index: "gs4", follow: true }
    );
  };

  updateUsersWithCorrectGs5pk = async () => {
    try {
      const allUsers = await this.User.scan();
      console.log(`Found ${allUsers.length} users to check.`);
      
      let updatedCount = 0;
      let errorCount = 0;
      
      for (const user of allUsers) {
        try {
          // Récupérer le compte associé
          console.log(user);
          const account = await this.Account.get({ pk: `account#${user.accountId}` });
          if (!account) {
            console.warn(`Account not found for user ${user.id}`);
            continue;
          }
          
          // Déterminer le resellerAccountId et gs5pk correct
          let resellerAccountId = null;
          let correctGs5pk = "standard#user";
          if (account.parentAccountId) {
            resellerAccountId = account.parentAccountId;
            correctGs5pk = `reseller#${resellerAccountId}`;
          } else if (account.isReseller) {
            resellerAccountId = account.id;
            correctGs5pk = `reseller#${resellerAccountId}`;
          }
          // Mettre à jour l'utilisateur si nécessaire
          if (user.resellerAccountId !== resellerAccountId || user.gs5pk !== correctGs5pk) {
           await this.patchById(user.id, user);
            /* this.table.setContext({ accountId: user.accountId });
            await this.User.update({
              id: user.id,
              accountId: user.accountId,
              resellerAccountId: resellerAccountId,
              gs5pk: correctGs5pk
            }); */
            updatedCount++;
          }
        } catch (error) {
          console.error(`Error updating user ${user.id}:`, error);
          errorCount++;
        }
      }
      
      console.log(`Update completed: ${updatedCount} users updated, ${errorCount} errors.`);
      
      return {
        total: allUsers.length,
        updated: updatedCount,
        errors: errorCount
      };
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  };
}
export default Users;
