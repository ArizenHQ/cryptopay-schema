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
            readonly project: readonly ["gs1pk", "gs1sk"];
        };
        readonly gs2: {
            readonly hash: "gs1pk";
            readonly sort: "gs2sk";
            readonly project: readonly ["gs1pk", "gs2sk"];
        };
        readonly gs3: {
            readonly hash: "gs1pk";
            readonly sort: "gs3sk";
            readonly project: readonly ["gs1pk", "gs3sk"];
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
                readonly crypt: true;
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
                readonly default: () => string;
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
                readonly default: () => string;
            };
            readonly apiKeyId: {
                readonly type: StringConstructor;
            };
            readonly hmacPassword: {
                readonly type: StringConstructor;
                readonly default: () => string;
                readonly crypt: true;
            };
            readonly description: {
                readonly type: StringConstructor;
                readonly required: false;
            };
            readonly parameters: {
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
                        readonly validate: RegExp;
                    };
                    readonly network: {
                        readonly type: StringConstructor;
                        readonly enum: readonly ["mainnet", "munbai", "goerli"];
                    };
                    readonly blockchain: {
                        readonly type: StringConstructor;
                        readonly enum: readonly ["ethereum", "polygon", "tezos"];
                    };
                    readonly coinhouseCustomerId: {
                        readonly type: StringConstructor;
                    };
                    readonly gasStation: {
                        readonly type: ObjectConstructor;
                        readonly default: {};
                        readonly schema: {
                            readonly currency: {
                                readonly type: StringConstructor;
                                readonly enum: readonly ["ETH", "MATIC", "XTZ"];
                            };
                            readonly limitPer24H: {
                                readonly type: NumberConstructor;
                            };
                        };
                    };
                };
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
                readonly value: "project#${name}#${id}#${codeProject}";
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
            readonly amount: {
                readonly type: NumberConstructor;
                readonly required: true;
            };
            readonly amountToClaim: {
                readonly type: NumberConstructor;
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
            readonly currency: {
                readonly type: StringConstructor;
                readonly enum: readonly ["ETH", "MATIC", "EUR"];
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
                };
            };
            readonly internalRef: {
                readonly type: StringConstructor;
                readonly required: true;
            };
            readonly paymentId: {
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
                readonly value: "order#${success}";
            };
            readonly gs4sk: {
                readonly type: StringConstructor;
                readonly value: "order#${id}#${typeOrder}#${codeProject}#${success}#${tx_hash}";
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
                readonly validate: RegExp;
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
                readonly value: "payment#${id}#${orderId}#${address}#${txId}#${currency}";
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
                readonly value: "kyt#${address}#${asset}#${type}#${network}#${userIdChaina}";
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
                readonly enum: readonly ["ETH", "MATIC", "XTZ"];
            };
            readonly network: {
                readonly type: StringConstructor;
                readonly enum: readonly ["mainnet", "munbai", "goerli"];
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
            readonly codeProject: {
                readonly type: StringConstructor;
                readonly required: true;
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
            readonly fees: {
                readonly type: NumberConstructor;
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
                readonly value: "order#${id}#${codeProject}#${statusOrder}#${success}#${paymentId}#${tx_hash}";
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
