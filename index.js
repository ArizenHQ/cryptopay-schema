/**
 * Overview schema
 * ATTENTION: this schema is used by the cryptopay-nftTransfert project
 * have to be updated in another project as well
 * 
 * 
 */

const crypto = require("crypto");

const Match = {
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  email:
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  name: /^[a-z0-9 ,.'-]+$/i,
  address: /[a-z0-9 ,.-]+$/,
  cryptoAddress: /^(0x)?[0-9a-f]{40}$/i,
  zip: /^\d{5}(?:[-\s]\d{4})?$/,
  phone: /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/,
  url: /^((http|https):\/\/)?([a-zA-Z0-9]+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,5})(:[0-9]{1,5})?(\/.*)?$/,
};

// function to generate a random string with 10 characters
const randomString = () => {
  return crypto.randomBytes(5).toString("hex");
}

const schema = {
  format: 'onetable:1.1.0',
  version: '0.0.1',
  indexes: {
    primary: { hash: 'pk', sort: 'sk' },
    gs1: { hash: 'gs1pk', sort: 'gs1sk', project: ['gs1pk', 'gs1sk'] },
    gs2: { hash: 'gs1pk', sort: 'gs2sk', project: ['gs1pk', 'gs2sk'] },
    gs3: { hash: 'gs1pk', sort: 'gs3sk', project: ['gs1pk', 'gs3sk'] },
    gs4: { hash: 'gs1pk', sort: 'gs4sk', project: 'all' },
  },
  models: {
    Account: {
      pk: { type: String, value: 'account#${id}' },
      sk: { type: String, value: 'account#' },
      id: { type: String, generate: 'uuid' },
      name: { type: String, required: true, unique: true, validate: Match.name },
      //  Search by account name or by type
      gs1pk: { type: String, value: 'account#' },
      gs1sk: { type: String, value: 'account#${name}${id}' },
    },

    User: {
      pk: { type: String, value: 'account#${accountId}' },
      sk: { type: String, value: 'user#${email}' },
      accountId: { type: String, required: true },
      id: { type: String, generate: 'uuid', validate: Match.uuid },
      name: { type: String, required: true, validate: Match.name },
      email: { type: String, required: true, validate: Match.email, crypt: true, unique: true },
      password: { type: String, required: true, crypt: true },
      status: { type: String, required: true, default: "active", enum: ["active", "inactive"] },
      permissionLevel: { type: Number, enum: [1, 4, 16, 2048], required: true },
      apiKey: { type: String, default: () => crypto.createHash("sha256").update(Math.random().toString()).digest("hex") },

      //  Search by user name or by type
      gs1pk: { type: String, value: 'user#' },
      gs1sk: { type: String, value: 'user#${email}#${id}' },
      gs2sk: { type: String, value: 'user#${status}#${id}' },
      gs3sk: { type: String, value: 'user#${permissionLevel}#${id}' },
      gs4sk: { type: String, value: 'user#${name}#${id}#${email}#${status}#${permissionLevel}' },
    },

    Project: {
      pk: { type: String, value: 'account#${accountId}' },
      sk: { type: String, value: 'project#${id}' },
      id: { type: String, generate: 'uuid', validate: Match.uuid },
      accountId: { type: String, required: true },
      name: { type: String, required: true },

      status: { type: String, required: true, default: 'active', enum: ['active', 'inactive'] },
      codeProject: { type: String, required: true, unique: true },
      typeProject: { type: String, required: true, enum: ['cardPayment', 'cryptoPayment'] },
      apiKey: { type: String, default: () => crypto.createHash("sha256").update(Math.random().toString()).digest("hex") },
      apiKeyId: { type: String },
      hmacPassword: { type: String, default: () => randomString(), crypt: true },
      description: { type: String, required: false },
      parameters: {
        type: Object,
        default: {},
        schema: {
          urlRedirectSuccess: { type: String, validate: Match.url },
          urlRedirectPending: { type: String, validate: Match.url },
          urlRedirectFailed: { type: String, validate: Match.url },
          urlRedirectError: { type: String, validate: Match.url },
          webhookUrl: { type: String, validate: Match.url },
          smartContractAddress: { type: String, validate: Match.cryptoAddress },
          walletAddress: { type: String, validate: Match.cryptoAddress },
          network: { type: String, enum: ["mainnet", "munbai", "goerli"] },
          blockchain: { type: String, enum: ["ethereum", "polygon"] },
        },
      },
      //  Search by product code or by type
      gs1pk: { type: String, value: 'project#' },
      gs1sk: { type: String, value: 'project#${codeProject}' },
      gs2sk: { type: String, value: 'project#${id}' },
      gs3sk: { type: String, value: 'project#${apiKey}' },
      gs4sk: { type: String, value: 'project#${name}#${id}#${codeProject}' },
    },
    Order: {
      pk: { type: String, value: 'account#${accountId}' },
      sk: { type: String, value: 'order#${id}' },
      id: { type: String, generate: 'uuid', validate: Match.uuid },
      accountId: { type: String, required: true },
      typeOrder: { type: String, required: true, enum: ['card', 'crypto'] },
      amount: { type: Number, required: true },
      amountToClaim: { type: Number },
      applicationInfo: {
        type: Object,
        default: {},
        schema: {
          externalPlatform: {
            type: Object,
            default: {},
            schema: {
              integrator: { type: String },
              name: { type: String },
              version: { type: Number },
            }
          },
          merchantApplication: {
            type: Object,
            default: {},
            schema: {
              name: { type: String },
              version: { type: Number },
            },
          },
          audit: {
            type: Object,
            default: {}
          },
          countryCode: { type: String },
          currency: { type: String, enum: ["ETH", "MATIC", "EUR"] },
          customerAddress: { type: String, validate: Match.cryptoAddress },
          publicAddressDest: { type: String, validate: Match.cryptoAddress },
          customer: {
            type: Object,
            default: {},
            schema: {
              email: { type: String, validate: Match.email },
              firstname: { type: String },
              lastname: { type: String },
            }
          },
          dateCreated: { type: Number, default: () => new Date().getTime() },
          dateLastUpdated: { type: Number, default: () => new Date().getTime() },
          internalRef: { type: String },
          paymentId: { type: String },
          projectCode: { type: String, required: true },
          eventCode: { type: String },
          eventDate: { type: String },
          statusDetail: { type: String },
          statusOrder: { type: String },
          success: { type: Boolean },
          tokenId: { type: Number },
          tx_date: { type: String },
          tx_hash: { type: String },
          notificationFromAdyen: {type: Object, default: {}},
          session: {type: Object, default: {}},
          urlsRedirect: {
            type: Object,
            default: {},
            schema: {
              urlRedirectSuccess: { type: String, validate: Match.url },
              urlRedirectPending: { type: String, validate: Match.url },
              urlRedirectFailed: { type: String, validate: Match.url },
              urlRedirectError: { type: String, validate: Match.url }
            },
          },
          walletAddress: { type: String, validate: Match.cryptoAddress },
          webhookUrl: { type: String, validate: Match.url },
        }

      }
    }
  },
  params: {
    isoDates: true,
    timestamps: true,
  },
};
module.exports = schema;