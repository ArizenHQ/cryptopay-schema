import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Table } from "dynamodb-onetable";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import Schema from "./schema";
import retrieveSecrets from "./utils/retrieveSecrets";

const client = new Dynamo({
  client: new DynamoDBClient({ region: "eu-west-1" }),
});

export class PasswordResetToken {
  table: Table;
  PasswordResetToken: any;
  secretsString: any;

  private constructor(secretsString: any) {
    this.secretsString = secretsString;

    this.table = new Table({
      client: client,
      schema: Schema,
      partial: false,
      name: process.env.TABLE_CRYPTOPAY_ACCOUNTS,
    });

    this.PasswordResetToken = this.table.getModel("PasswordResetToken");
  }

  static init = async () => {
    const secretsString = await retrieveSecrets("/coinhouse-solution/CardPayment-configuration");
    return new PasswordResetToken(secretsString);
  };

  create = async ({
    userId,
    token,
    expiresAt,
    ip,
    userAgent
  }: {
    userId: string;
    token: string;
    expiresAt: Date;
    ip?: string;
    userAgent?: string;
  }) => {
    this.table.setContext({ userId: userId });
    return await this.PasswordResetToken.create({
      userId,
      token,
      expiresAt,
      ip,
      userAgent
    });
  };

  findByToken = async (token: string) => {
    return await this.PasswordResetToken.get({ token }, { index: "gs1", follow: true });
  };

  markUsed = async (token: string) => {
    const item = await this.findByToken(token);
    if (!item || item.used) return null;
    item.used = true;
    return await this.PasswordResetToken.update(item, { return: "get" });
  };

  deleteExpired = async (now: Date = new Date()) => {
    const expired = await this.PasswordResetToken.find(
      { gs1pk: "resetToken#" },
      {
        where: "expiresAt < :now",
        values: { now },
        index: "gs1",
      }
    );

    return Promise.all(expired.map((t: any) => t.remove()));
  };
}

export default PasswordResetToken;
