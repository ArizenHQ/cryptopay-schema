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
export class RefreshToken {
  Crypto: any;
  table: Table;
  User: any;
  Project: any;
  Account: any;
  Order: any;
  Payment: any;
  Kyt: any;
  RefreshToken: any;
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
    this.RefreshToken = this.table.getModel("RefreshToken");
  }

  static init = async () => {
    const secretsString = await retrieveSecrets(
      "/coinhouse-solution/CardPayment-configuration"
    );
    return new RefreshToken(secretsString);
  };

  create = async ({
    userId,
    tokenRefresh,
    expiresAt,
    ip,
    userAgent,
  }: {
    userId: string;
    tokenRefresh: string;
    expiresAt: Date;
    ip?: string;
    userAgent?: string;
  }) => {
    return this.RefreshToken.create({
      userId,
      tokenRefresh,
      expiresAt,
      ip,
      userAgent,
    });
  };


  findByToken = async (tokenRefresh: string) => {
    const result = await this.RefreshToken.get({ tokenRefresh: tokenRefresh }, { index: "gs1", follow: true });
    return result?.[0] || null;
  };

  revoke = async (tokenRefresh: string, replacedByToken?: string) => {
    const existing = await this.findByToken(tokenRefresh);
    if (!existing) return null;
    return existing.update({
      revoked: true,
      replacedByToken,
    });
  };

  findValid = async (userId: string, tokenRefresh: string) => {
    return await this.RefreshToken.get({ userId: userId, tokenRefresh: tokenRefresh, revoked: false }, { index: "gs3", follow: true });
  };

  revokeAll = async (userId: string) => {
    const tokens = await this.RefreshToken.find({ userId });
    return Promise.all(tokens.map((t: any) => t.update({ revoked: true })));
  };

  deleteExpired = async (now: Date = new Date()) => {
    const expired = await this.RefreshToken.find(
      { gs1pk: "refreshToken#" },
      {
        where: "expiresAt < :now",
        values: { now },
        index: "gs1",
      }
    );

    return Promise.all(expired.map((t: any) => t.remove()));
  };
}
export default RefreshToken;
