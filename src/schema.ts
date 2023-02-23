import { randomBytes, createHash } from 'crypto'

const Match = {
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  email:
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  name: /^[a-z0-9 ,.'-]+$/i,
  address: /[a-z0-9 ,.-]+$/,
  cryptoAddress: /^(0x)?[0-9a-f]{40}$/i,
  zip: /^\d{5}(?:[-\s]\d{4})?$/,
  phone: /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/,
  url: /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/,
  permissionLevel: /^(1|4|16|128|2048)$/
};

const randomString = () => {
  return randomBytes(5).toString("hex");
}

const Schema = {
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
      permissionLevel: { type: Number, required: true, validate: Match.permissionLevel },
      apiKey: { type: String, default: () => createHash("sha256").update(Math.random().toString()).digest("hex") },
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
      apiKey: { type: String, default: () => createHash("sha256").update(Math.random().toString()).digest("hex") },
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
      orderId: {type: String, value: '${id}', hidden: false},
      OrderId: {type: String, value: '${id}', hidden: false},
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
          }
        }
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
      internalRef: { type: String, required: true },
      paymentId: { type: String },
      codeProject: { type: String, required: true },
      eventCode: { type: String },
      eventDate: { type: String },
      statusDetail: { type: String },
      statusOrder: { type: String, default: 'CREATED' },
      success: { type: Boolean },
      tokenId: { type: Number },
      tx_date: { type: String },
      tx_hash: { type: String },
      notificationFromAdyen: { type: Object, default: {} },
      session: { type: Object, default: {} },
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
      gs1pk: { type: String, value: 'order#' },
      gs1sk: { type: String, value: 'order#${id}' },
      gs2sk: { type: String, value: 'order#${typeOrder}#${codeProject}' },
      gs3sk: { type: String, value: 'order#${success}' },
      gs4sk: { type: String, value: 'order#${id}#${typeOrder}#${codeProject}#${success}#${tx_hash}' },
    },
    Payment: {
      pk: { type: String, value: 'account#${accountId}' },
      sk: { type: String, value: 'payment#${id}' },
      id: { type: String, generate: 'uuid', validate: Match.uuid },
      address: {type: String, validate: Match.cryptoAddress},
      dateTime: {type: Number},
      txId: {type: String},
      amount: { type: Number },
      fees: { type: Number },
      currency: { type: String },
      from: { type: String },
      to: { type: String },
      type: { type: String },
      credit: { type: Number },
      debit: { type: Number },
      context: {  type: Object, default: {}  },
      orderId: { type: String },
      audit: {  type: Object, default: [] },
      gs1pk: { type: String, value: 'payment#' },
      gs1sk: { type: String, value: 'payment#${id}' },
      gs2sk: { type: String, value: 'payment#${orderId}' },
      gs3sk: { type: String, value: 'payment#${type}' },
      gs4sk: { type: String, value: 'payment#${id}#${orderId}#${address}#${txId}#${currency}' },
    },
    Kyt: {
      pk: { type: String, value: 'account#${accountId}' },
      sk: { type: String, value: 'kyt#${id}' },
      id: { type: String, generate: 'uuid', validate: Match.uuid },
      address: {type: String},
      asset: {type: String},
      type: {type: String, enum: ["address", "transfert"]},
      txHash: {type: String},
      network: {type: String},
      direction: {type: String, enum: ["received", "sent"]},
      userIdChaina: {type: String},
      datetime: {type: String},
      rating: {type: String},
      calls: {type: Number, default: 0}, 
      accountId: { type: String, required: true },
      projectId: { type: String, required: true },
      gs1pk: { type: String, value: 'kyt#' },
      gs1sk: { type: String, value: 'kyt#${id}' },
      gs2sk: { type: String, value: 'kyt#${address}' },
      gs3sk: { type: String, value: 'kyt#${type}' },
      gs4sk: { type: String, value: 'kyt#${address}#${asset}#${type}#${network}#${userIdChaina}' },
    }
  } as const,
  params: {
    isoDates: true,
    timestamps: true,
    createdField: "dateCreated",
    updatedField: "dateLastUpdated"
  },
} as const

export default Schema