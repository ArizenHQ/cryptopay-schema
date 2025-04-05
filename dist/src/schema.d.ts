declare const Schema: {
    readonly format: "onetable:1.1.0";
    readonly version: "0.0.1";
    readonly indexes: {
        readonly primary: {
            readonly hash: "pk";
            readonly sort: "sk";
        };
        readonly gs1: {
            readonly hash: "gs1pk";
            readonly sort: "gs1sk";
            readonly project: "all";
        };
        readonly gs2: {
            readonly hash: "gs1pk";
            readonly sort: "gs2sk";
            readonly project: "all";
        };
        readonly gs3: {
            readonly hash: "gs1pk";
            readonly sort: "gs3sk";
            readonly project: "all";
        };
        readonly gs4: {
            readonly hash: "gs1pk";
            readonly sort: "gs4sk";
            readonly project: "all";
        };
    };
    readonly models: {
        readonly Account: {
            readonly pk: {
                readonly type: StringConstructor;
                readonly value: "account#${id}";
            };
            readonly sk: {
                readonly type: StringConstructor;
                readonly value: "account#";
            };
            readonly id: {
                readonly type: StringConstructor;
                readonly generate: "uuid";
            };
            readonly name: {
                readonly type: StringConstructor;
                readonly required: true;
                readonly unique: true;
                readonly validate: RegExp;
            };
            readonly gs1pk: {
                readonly type: StringConstructor;
                readonly value: "account#";
            };
            readonly gs1sk: {
                readonly type: StringConstructor;
                readonly value: "account#${name}${id}";
            };
        };
        readonly User: {
            readonly pk: {
                readonly type: StringConstructor;
                readonly value: "account#${accountId}";
            };
            readonly sk: {
                readonly type: StringConstructor;
                readonly value: "user#${email}";
            };
            readonly accountId: {
                readonly type: StringConstructor;
                readonly required: true;
            };
            readonly id: {
                readonly type: StringConstructor;
                readonly generate: "uuid";
                readonly validate: RegExp;
            };
            readonly name: {
                readonly type: StringConstructor;
                readonly required: true;
                readonly validate: RegExp;
            };
            readonly email: {
                readonly type: StringConstructor;
                readonly required: true;
                readonly validate: RegExp;
                readonly unique: true;
            };
            readonly password: {
                readonly type: StringConstructor;
                readonly required: true;
                readonly crypt: true;
            };
            readonly status: {
                readonly type: StringConstructor;
                readonly required: true;
                readonly default: "active";
                readonly enum: readonly ["active", "inactive"];
            };
            readonly permissionLevel: {
                readonly type: NumberConstructor;
                readonly required: true;
                readonly validate: RegExp;
            };
            readonly apiKey: {
                readonly type: StringConstructor;
                readonly hidden: true;
            };
            readonly gs1pk: {
                readonly type: StringConstructor;
                readonly value: "user#";
            };
            readonly gs1sk: {
                readonly type: StringConstructor;
                readonly value: "user#${email}#${id}";
            };
            readonly gs2sk: {
                readonly type: StringConstructor;
                readonly value: "user#${status}#${id}";
            };
            readonly gs3sk: {
                readonly type: StringConstructor;
                readonly value: "user#${permissionLevel}#${id}";
            };
            readonly gs4sk: {
                readonly type: StringConstructor;
                readonly value: "user#${name}#${id}#${email}#${status}#${permissionLevel}";
            };
        };
        readonly Project: {
            readonly pk: {
                readonly type: StringConstructor;
                readonly value: "account#${accountId}";
            };
            readonly sk: {
                readonly type: StringConstructor;
                readonly value: "project#${id}";
            };
            readonly id: {
                readonly type: StringConstructor;
                readonly generate: "uuid";
                readonly validate: RegExp;
            };
            readonly accountId: {
                readonly type: StringConstructor;
                readonly required: true;
            };
            readonly name: {
                readonly type: StringConstructor;
                readonly required: true;
            };
            readonly status: {
                readonly type: StringConstructor;
                readonly required: true;
                readonly default: "active";
                readonly enum: readonly ["active", "inactive"];
            };
            readonly codeProject: {
                readonly type: StringConstructor;
                readonly required: true;
                readonly unique: true;
            };
            readonly typeProject: {
                readonly type: StringConstructor;
                readonly required: true;
                readonly enum: readonly ["cardPayment", "cryptoPayment", "gasStation"];
            };
            readonly apiKey: {
                readonly type: StringConstructor;
            };
            readonly apiKeyId: {
                readonly type: StringConstructor;
            };
            readonly hmacPassword: {
                readonly type: StringConstructor;
                readonly crypt: true;
            };
            readonly description: {
                readonly type: StringConstructor;
                readonly required: false;
            };
            readonly autorizedByCNHS: {
                readonly type: BooleanConstructor;
                readonly default: false;
            };
            readonly autoConvert: {
                readonly type: BooleanConstructor;
                readonly default: false;
            };
            readonly userIdCNHS: {
                readonly type: StringConstructor;
            };
            readonly parameters: {
                readonly type: ObjectConstructor;
                readonly default: {};
                readonly schema: {
                    readonly physicalPayment: {
                        readonly type: ObjectConstructor;
                        readonly default: {};
                        readonly schema: {
                            readonly logo: {
                                readonly type: StringConstructor;
                            };
                            readonly logoInverse: {
                                readonly type: StringConstructor;
                            };
                            readonly name: {
                                readonly type: StringConstructor;
                            };
                            readonly description: {
                                readonly type: StringConstructor;
                            };
                            readonly address: {
                                readonly type: StringConstructor;
                            };
                            readonly phone: {
                                readonly type: StringConstructor;
                            };
                            readonly email: {
                                readonly type: StringConstructor;
                            };
                            readonly backgroundColor: {
                                readonly type: StringConstructor;
                            };
                            readonly fontColor: {
                                readonly type: StringConstructor;
                            };
                        };
                    };
                    readonly urlRedirectSuccess: {
                        readonly type: StringConstructor;
                        readonly validate: RegExp;
                    };
                    readonly urlRedirectPending: {
                        readonly type: StringConstructor;
                        readonly validate: RegExp;
                    };
                    readonly urlRedirectFailed: {
                        readonly type: StringConstructor;
                        readonly validate: RegExp;
                    };
                    readonly urlRedirectError: {
                        readonly type: StringConstructor;
                        readonly validate: RegExp;
                    };
                    readonly webhookUrl: {
                        readonly type: StringConstructor;
                        readonly validate: RegExp;
                    };
                    readonly smartContractAddress: {
                        readonly type: StringConstructor;
                        readonly validate: RegExp;
                    };
                    readonly walletAddress: {
                        readonly type: StringConstructor;
                    };
                    readonly smartContractMethod: {
                        readonly type: StringConstructor;
                    };
                    readonly smartContractAbi: {
                        readonly type: StringConstructor;
                    };
                    readonly network: {
                        readonly type: StringConstructor;
                        readonly enum: readonly ["mainnet", "mumbai", "goerli", "ghost", "sepolia"];
                    };
                    readonly blockchain: {
                        readonly type: StringConstructor;
                        readonly enum: readonly ["ethereum", "polygon", "tezos"];
                    };
                    readonly gasStation: {
                        readonly type: ObjectConstructor;
                        readonly default: {};
                        readonly schema: {
                            readonly currency: {
                                readonly type: StringConstructor;
                                readonly enum: readonly ["ETH", "POL", "MATIC", "XTZ"];
                            };
                            readonly limitPer24H: {
                                readonly type: NumberConstructor;
                            };
                        };
                    };
                };
            };
            readonly ulid: {
                readonly type: StringConstructor;
                readonly generate: "ulid";
            };
            readonly gs1pk: {
                readonly type: StringConstructor;
                readonly value: "project#";
            };
            readonly gs1sk: {
                readonly type: StringConstructor;
                readonly value: "project#${codeProject}";
            };
            readonly gs2sk: {
                readonly type: StringConstructor;
                readonly value: "project#${id}";
            };
            readonly gs3sk: {
                readonly type: StringConstructor;
                readonly value: "project#${apiKey}";
            };
            readonly gs4sk: {
                readonly type: StringConstructor;
                readonly value: "project#${ulid}";
            };
        };
        readonly Order: {
            readonly pk: {
                readonly type: StringConstructor;
                readonly value: "account#${accountId}";
            };
            readonly sk: {
                readonly type: StringConstructor;
                readonly value: "order#${id}";
            };
            readonly id: {
                readonly type: StringConstructor;
                readonly generate: "uuid";
                readonly validate: RegExp;
            };
            readonly orderId: {
                readonly type: StringConstructor;
                readonly value: "${id}";
                readonly hidden: false;
            };
            readonly OrderId: {
                readonly type: StringConstructor;
                readonly value: "${id}";
                readonly hidden: false;
            };
            readonly accountId: {
                readonly type: StringConstructor;
                readonly required: true;
            };
            readonly typeOrder: {
                readonly type: StringConstructor;
                readonly required: true;
                readonly enum: readonly ["card", "crypto"];
            };
            readonly currency: {
                readonly type: StringConstructor;
                readonly enum: readonly ["ETH", "POL", "MATIC", "EUR", "USDT", "USDC"];
            };
            readonly amount: {
                readonly type: NumberConstructor;
                readonly required: true;
            };
            readonly euroAmount: {
                readonly type: NumberConstructor;
            };
            readonly amountToClaim: {
                readonly type: NumberConstructor;
            };
            readonly quoteId: {
                readonly type: StringConstructor;
            };
            readonly dateQuote: {
                readonly type: StringConstructor;
            };
            readonly physicalPaymentParams: {
                readonly type: ObjectConstructor;
                readonly default: {};
                readonly schema: {
                    readonly logo: {
                        readonly type: StringConstructor;
                    };
                    readonly logoInverse: {
                        readonly type: StringConstructor;
                    };
                    readonly name: {
                        readonly type: StringConstructor;
                    };
                    readonly description: {
                        readonly type: StringConstructor;
                    };
                    readonly address: {
                        readonly type: StringConstructor;
                    };
                    readonly phone: {
                        readonly type: StringConstructor;
                    };
                    readonly email: {
                        readonly type: StringConstructor;
                    };
                    readonly backgroundColor: {
                        readonly type: StringConstructor;
                    };
                    readonly fontColor: {
                        readonly type: StringConstructor;
                    };
                };
            };
            readonly applicationInfo: {
                readonly type: ObjectConstructor;
                readonly default: {};
                readonly schema: {
                    readonly externalPlatform: {
                        readonly type: ObjectConstructor;
                        readonly default: {};
                        readonly schema: {
                            readonly integrator: {
                                readonly type: StringConstructor;
                            };
                            readonly name: {
                                readonly type: StringConstructor;
                            };
                            readonly version: {
                                readonly type: NumberConstructor;
                            };
                        };
                    };
                    readonly merchantApplication: {
                        readonly type: ObjectConstructor;
                        readonly default: {};
                        readonly schema: {
                            readonly name: {
                                readonly type: StringConstructor;
                            };
                            readonly version: {
                                readonly type: NumberConstructor;
                            };
                        };
                    };
                };
            };
            readonly audit: {
                readonly type: ArrayConstructor;
                readonly default: readonly [];
            };
            readonly countryCode: {
                readonly type: StringConstructor;
            };
            readonly customerAddress: {
                readonly type: StringConstructor;
                readonly validate: RegExp;
            };
            readonly publicAddressDest: {
                readonly type: StringConstructor;
                readonly validate: RegExp;
            };
            readonly customer: {
                readonly type: ObjectConstructor;
                readonly default: {};
                readonly schema: {
                    readonly email: {
                        readonly type: StringConstructor;
                        readonly validate: RegExp;
                    };
                    readonly firstname: {
                        readonly type: StringConstructor;
                    };
                    readonly lastname: {
                        readonly type: StringConstructor;
                    };
                    readonly company: {
                        readonly type: StringConstructor;
                    };
                };
            };
            readonly internalRef: {
                readonly type: StringConstructor;
                readonly required: true;
            };
            readonly paymentId: {
                readonly type: StringConstructor;
            };
            readonly conversionId: {
                readonly type: StringConstructor;
            };
            readonly codeProject: {
                readonly type: StringConstructor;
                readonly required: true;
            };
            readonly eventCode: {
                readonly type: StringConstructor;
            };
            readonly eventDate: {
                readonly type: StringConstructor;
            };
            readonly statusDetail: {
                readonly type: StringConstructor;
            };
            readonly statusOrder: {
                readonly type: StringConstructor;
                readonly default: "CREATED";
            };
            readonly success: {
                readonly type: BooleanConstructor;
            };
            readonly tokenId: {
                readonly type: NumberConstructor;
            };
            readonly tx_date: {
                readonly type: StringConstructor;
            };
            readonly tx_hash: {
                readonly type: StringConstructor;
            };
            readonly notificationFromAdyen: {
                readonly type: ObjectConstructor;
                readonly default: {};
            };
            readonly session: {
                readonly type: ObjectConstructor;
                readonly default: {};
            };
            readonly urlsRedirect: {
                readonly type: ObjectConstructor;
                readonly default: {};
                readonly schema: {
                    readonly urlRedirectSuccess: {
                        readonly type: StringConstructor;
                        readonly validate: RegExp;
                    };
                    readonly urlRedirectPending: {
                        readonly type: StringConstructor;
                        readonly validate: RegExp;
                    };
                    readonly urlRedirectFailed: {
                        readonly type: StringConstructor;
                        readonly validate: RegExp;
                    };
                    readonly urlRedirectError: {
                        readonly type: StringConstructor;
                        readonly validate: RegExp;
                    };
                };
            };
            readonly walletAddress: {
                readonly type: StringConstructor;
                readonly validate: RegExp;
            };
            readonly webhookUrl: {
                readonly type: StringConstructor;
                readonly validate: RegExp;
            };
            readonly dateExpiration: {
                readonly type: StringConstructor;
            };
            readonly autoConvert: {
                readonly type: StringConstructor;
                readonly enum: readonly ["disabled", "enabled", "pending", "done"];
                readonly default: "disabled";
                readonly required: true;
            };
            readonly ulid: {
                readonly type: StringConstructor;
                readonly generate: "ulid";
            };
            readonly gs1pk: {
                readonly type: StringConstructor;
                readonly value: "order#";
            };
            readonly gs1sk: {
                readonly type: StringConstructor;
                readonly value: "order#${id}";
            };
            readonly gs2sk: {
                readonly type: StringConstructor;
                readonly value: "order#${typeOrder}#${codeProject}";
            };
            readonly gs3sk: {
                readonly type: StringConstructor;
                readonly value: "order#${ulid}";
            };
            readonly gs4sk: {
                readonly type: StringConstructor;
                readonly value: "order#${id}#${typeOrder}#${codeProject}#${success}#${tx_hash}";
            };
        };
        readonly Conversion: {
            readonly pk: {
                readonly type: StringConstructor;
                readonly value: "account#${accountId}";
            };
            readonly sk: {
                readonly type: StringConstructor;
                readonly value: "conversion#${id}";
            };
            readonly id: {
                readonly type: StringConstructor;
                readonly generate: "uuid";
                readonly validate: RegExp;
            };
            readonly accountId: {
                readonly type: StringConstructor;
                readonly required: true;
            };
            readonly codeProject: {
                readonly type: StringConstructor;
                readonly required: true;
            };
            readonly orderId: {
                readonly type: StringConstructor;
                readonly required: true;
            };
            readonly quoteId: {
                readonly type: StringConstructor;
            };
            readonly depositId: {
                readonly type: StringConstructor;
            };
            readonly quote: {
                readonly type: NumberConstructor;
            };
            readonly quoteCurrency: {
                readonly type: StringConstructor;
            };
            readonly base: {
                readonly type: NumberConstructor;
            };
            readonly baseCurrency: {
                readonly type: StringConstructor;
            };
            readonly fees: {
                readonly type: NumberConstructor;
            };
            readonly dateConversion: {
                readonly type: StringConstructor;
            };
            readonly status: {
                readonly type: StringConstructor;
                readonly enum: readonly ["pending", "done", "failed"];
                readonly default: "pending";
                readonly required: true;
            };
            readonly ulid: {
                readonly type: StringConstructor;
                readonly generate: "ulid";
            };
            readonly gs1pk: {
                readonly type: StringConstructor;
                readonly value: "conversion#";
            };
            readonly gs1sk: {
                readonly type: StringConstructor;
                readonly value: "conversion#${id}";
            };
            readonly gs2sk: {
                readonly type: StringConstructor;
                readonly value: "conversion#${orderId}";
            };
            readonly gs3sk: {
                readonly type: StringConstructor;
                readonly value: "conversion#${quoteId}";
            };
            readonly gs4sk: {
                readonly type: StringConstructor;
                readonly value: "conversion#${ulid}";
            };
        };
        readonly Payment: {
            readonly pk: {
                readonly type: StringConstructor;
                readonly value: "account#${accountId}";
            };
            readonly sk: {
                readonly type: StringConstructor;
                readonly value: "payment#${id}";
            };
            readonly id: {
                readonly type: StringConstructor;
                readonly generate: "uuid";
                readonly validate: RegExp;
            };
            readonly address: {
                readonly type: StringConstructor;
            };
            readonly dateTime: {
                readonly type: NumberConstructor;
            };
            readonly txId: {
                readonly type: StringConstructor;
            };
            readonly amount: {
                readonly type: NumberConstructor;
            };
            readonly fees: {
                readonly type: NumberConstructor;
            };
            readonly currency: {
                readonly type: StringConstructor;
            };
            readonly from: {
                readonly type: StringConstructor;
            };
            readonly to: {
                readonly type: StringConstructor;
            };
            readonly type: {
                readonly type: StringConstructor;
            };
            readonly credit: {
                readonly type: NumberConstructor;
            };
            readonly debit: {
                readonly type: NumberConstructor;
            };
            readonly context: {
                readonly type: ObjectConstructor;
                readonly default: {};
            };
            readonly orderId: {
                readonly type: StringConstructor;
            };
            readonly audit: {
                readonly type: ObjectConstructor;
                readonly default: readonly [];
            };
            readonly ulid: {
                readonly type: StringConstructor;
                readonly generate: "ulid";
            };
            readonly gs1pk: {
                readonly type: StringConstructor;
                readonly value: "payment#";
            };
            readonly gs1sk: {
                readonly type: StringConstructor;
                readonly value: "payment#${id}";
            };
            readonly gs2sk: {
                readonly type: StringConstructor;
                readonly value: "payment#${orderId}";
            };
            readonly gs3sk: {
                readonly type: StringConstructor;
                readonly value: "payment#${type}";
            };
            readonly gs4sk: {
                readonly type: StringConstructor;
                readonly value: "payment#${ulid}";
            };
        };
        readonly Kyt: {
            readonly pk: {
                readonly type: StringConstructor;
                readonly value: "account#${accountId}";
            };
            readonly sk: {
                readonly type: StringConstructor;
                readonly value: "kyt#${id}";
            };
            readonly id: {
                readonly type: StringConstructor;
                readonly generate: "uuid";
                readonly validate: RegExp;
            };
            readonly address: {
                readonly type: StringConstructor;
            };
            readonly asset: {
                readonly type: StringConstructor;
            };
            readonly type: {
                readonly type: StringConstructor;
                readonly enum: readonly ["address", "transfert"];
            };
            readonly txHash: {
                readonly type: StringConstructor;
            };
            readonly network: {
                readonly type: StringConstructor;
            };
            readonly direction: {
                readonly type: StringConstructor;
                readonly enum: readonly ["received", "sent"];
            };
            readonly userIdChaina: {
                readonly type: StringConstructor;
            };
            readonly datetime: {
                readonly type: StringConstructor;
            };
            readonly rating: {
                readonly type: StringConstructor;
            };
            readonly calls: {
                readonly type: NumberConstructor;
                readonly default: 0;
            };
            readonly accountId: {
                readonly type: StringConstructor;
                readonly required: true;
            };
            readonly projectId: {
                readonly type: StringConstructor;
                readonly required: true;
            };
            readonly ulid: {
                readonly type: StringConstructor;
                readonly generate: "ulid";
            };
            readonly gs1pk: {
                readonly type: StringConstructor;
                readonly value: "kyt#";
            };
            readonly gs1sk: {
                readonly type: StringConstructor;
                readonly value: "kyt#${id}";
            };
            readonly gs2sk: {
                readonly type: StringConstructor;
                readonly value: "kyt#${address}";
            };
            readonly gs3sk: {
                readonly type: StringConstructor;
                readonly value: "kyt#${type}";
            };
            readonly gs4sk: {
                readonly type: StringConstructor;
                readonly value: "kyt#${ulid}";
            };
        };
        readonly GasStation: {
            readonly pk: {
                readonly type: StringConstructor;
                readonly value: "account#${accountId}";
            };
            readonly sk: {
                readonly type: StringConstructor;
                readonly value: "gasStation#${id}";
            };
            readonly id: {
                readonly type: StringConstructor;
                readonly generate: "uuid";
                readonly validate: RegExp;
            };
            readonly accountId: {
                readonly type: StringConstructor;
                readonly required: true;
            };
            readonly projectId: {
                readonly type: StringConstructor;
                readonly required: true;
            };
            readonly address: {
                readonly type: StringConstructor;
            };
            readonly currency: {
                readonly type: StringConstructor;
                readonly enum: readonly ["ETH", "POL", "MATIC", "XTZ"];
            };
            readonly network: {
                readonly type: StringConstructor;
                readonly enum: readonly ["mainnet", "mumbai", "goerli", "ghost", "sepolia"];
            };
            readonly blockchain: {
                readonly type: StringConstructor;
                readonly enum: readonly ["ethereum", "polygon", "tezos"];
            };
            readonly tx_date: {
                readonly type: StringConstructor;
            };
            readonly tx_hash: {
                readonly type: StringConstructor;
            };
            readonly statusOrder: {
                readonly type: StringConstructor;
                readonly default: "CREATED";
            };
            readonly success: {
                readonly type: BooleanConstructor;
            };
            readonly paymentId: {
                readonly type: StringConstructor;
            };
            readonly internalRef: {
                readonly type: StringConstructor;
                readonly required: true;
            };
            readonly webhookUrl: {
                readonly type: StringConstructor;
                readonly validate: RegExp;
            };
            readonly amount: {
                readonly type: NumberConstructor;
                readonly required: true;
            };
            readonly audit: {
                readonly type: ArrayConstructor;
                readonly default: readonly [];
            };
            readonly fees: {
                readonly type: NumberConstructor;
            };
            readonly ulid: {
                readonly type: StringConstructor;
                readonly generate: "ulid";
            };
            readonly gs1pk: {
                readonly type: StringConstructor;
                readonly value: "getStation#";
            };
            readonly gs1sk: {
                readonly type: StringConstructor;
                readonly value: "getStation#${id}";
            };
            readonly gs2sk: {
                readonly type: StringConstructor;
                readonly value: "getStation#${codeProject}";
            };
            readonly gs3sk: {
                readonly type: StringConstructor;
                readonly value: "order#${statusOrder}";
            };
            readonly gs4sk: {
                readonly type: StringConstructor;
                readonly value: "getStation#${ulid}";
            };
        };
        readonly RefreshToken: {
            readonly pk: {
                readonly type: StringConstructor;
                readonly value: "user#${userId}";
            };
            readonly sk: {
                readonly type: StringConstructor;
                readonly value: "refreshToken#${tokenId}";
            };
            readonly tokenId: {
                readonly type: StringConstructor;
                readonly generate: "uuid";
            };
            readonly userId: {
                readonly type: StringConstructor;
                readonly required: true;
            };
            readonly token: {
                readonly type: StringConstructor;
                readonly required: true;
            };
            readonly expiresAt: {
                readonly type: DateConstructor;
                readonly required: true;
            };
            readonly revoked: {
                readonly type: BooleanConstructor;
                readonly default: false;
            };
            readonly replacedByToken: {
                readonly type: StringConstructor;
            };
            readonly ip: {
                readonly type: StringConstructor;
            };
            readonly userAgent: {
                readonly type: StringConstructor;
            };
            readonly ulid: {
                readonly type: StringConstructor;
                readonly generate: "ulid";
            };
            readonly gs1pk: {
                readonly type: StringConstructor;
                readonly value: "refreshToken#";
            };
            readonly gs1sk: {
                readonly type: StringConstructor;
                readonly value: "refreshToken#${token}";
            };
            readonly gs2sk: {
                readonly type: StringConstructor;
                readonly value: "refreshToken#${ulid}";
            };
            readonly gs3sk: {
                readonly type: StringConstructor;
                readonly value: "refreshToken#${userId}#${ulid}";
            };
        };
    };
    readonly params: {
        readonly isoDates: true;
        readonly timestamps: true;
        readonly createdField: "dateCreated";
        readonly updatedField: "dateLastUpdated";
    };
};
export default Schema;
