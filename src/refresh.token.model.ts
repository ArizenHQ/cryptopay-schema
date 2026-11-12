import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Model, Table } from "dynamodb-onetable";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new Dynamo({
  client: new DynamoDBClient({ region: "eu-west-1" }),
});
import Schema from "./schema";
import encryptionSettings from "./utils/encryptionSettings";
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
    const secretsString = await encryptionSettings();
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
    return  await this.RefreshToken.get({ tokenRefresh: tokenRefresh }, { index: "gs1", follow: true });
  };

  revoke = async (tokenRefresh: string, replacedByToken?: string) => {
    try {
      const existing = await this.findByToken(tokenRefresh);
      if (!existing) return null;
      existing.revoked = true;
      existing.replacedByToken = replacedByToken;
      return await this.RefreshToken.update(existing, { return: "get" });
    } catch(err) {
      console.log("err",err)
      throw new Error(`Error during revoke refresh token ${err}`);
    }
  };
  
  // Revokes a live token in favour of `replacedByToken`: of two refreshes presenting the
  // same token, one only gets it. Returns null when the token is unknown or already revoked.
  rotate = async (tokenRefresh: string, replacedByToken: string) => {
    const existing = await this.findByToken(tokenRefresh);
    if (!existing) return null;
    try {
      return await this.RefreshToken.update({ ...existing, revoked: true, replacedByToken }, {
        where: "${revoked} = @{live}",
        substitutions: { live: false },
        return: "get",
      });
    } catch (err: any) {
      if (err?.code === "ConditionalCheckFailedException") return null;
      throw err;
    }
  };

  findValid = async (userId: string, tokenRefresh: string) => {
    return await this.RefreshToken.get({ userId: userId, tokenRefresh: tokenRefresh, revoked: false }, { index: "gs3", follow: true });
  };

  revokeAll = async (userId: string) => {
    const tokens = await this.RefreshToken.find({ userId });
    // The whole token is written back: gs3sk, which finds a valid token, is built from
    // userId, tokenRefresh and revoked.
    return Promise.all(tokens.filter((t: any) => !t.revoked).map((t: any) => this.RefreshToken.update({ ...t, revoked: true })));
  };

  deleteExpired = async (now: Date = new Date()) => {
    const expired = await this.RefreshToken.find(
      { gs1pk: "refreshToken#" },
      {
        where: "${expiresAt} < @{now}",
        substitutions: { now: now.toISOString() },
        index: "gs1",
      }
    );

    return Promise.all(expired.map((t: any) => this.RefreshToken.remove(t)));
  };
}
export default RefreshToken;
