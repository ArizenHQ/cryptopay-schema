"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Accounts = void 0;
var Dynamo_1 = require("dynamodb-onetable/Dynamo");
var dynamodb_onetable_1 = require("dynamodb-onetable");
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var client = new Dynamo_1.Dynamo({
    client: new client_dynamodb_1.DynamoDBClient({ region: "eu-west-1" }),
});
var schema_1 = require("./schema");
var retrieveSecrets_1 = require("./utils/retrieveSecrets");
var paginateModel_1 = require("./utils/paginateModel");
var Accounts = /** @class */ (function () {
    function Accounts(secretsString) {
        var _this = this;
        this.insert = function (data) { return __awaiter(_this, void 0, void 0, function () {
            var accountData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        accountData = {
                            name: data.name,
                            isReseller: data.isReseller || false,
                            parentAccountId: data.parentAccountId || null
                        };
                        return [4 /*yield*/, this.Account.create(accountData)];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.findById = function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.Account.get({ pk: "account#".concat(id) })];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.getAccount = function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.Account.get({ pk: "account#".concat(id) })];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.getFullAccount = function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.table.setContext({ id: id });
                        return [4 /*yield*/, this.table.fetch(["Account", "User", "Project"], {
                                pk: "account#".concat(id),
                            })];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.list = function () {
            var args_1 = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args_1[_i] = arguments[_i];
            }
            return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (query) {
                if (query === void 0) { query = {}; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, (0, paginateModel_1.paginateModel)(this.Account, 'find', { gs1pk: 'account#' }, query, {
                                index: 'gs1',
                                follow: true,
                            })];
                        case 1: return [2 /*return*/, _b.sent()];
                    }
                });
            });
        };
        this.scan = function () {
            var args_1 = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args_1[_i] = arguments[_i];
            }
            return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (query) {
                if (query === void 0) { query = {}; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, (0, paginateModel_1.paginateModel)(this.Account, 'scan', {}, query)];
                        case 1: return [2 /*return*/, _b.sent()];
                    }
                });
            });
        };
        this.patchById = function (id, data) { return __awaiter(_this, void 0, void 0, function () {
            var currentAccount, updatedAccount;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.Account.get({ id: id })];
                    case 1:
                        currentAccount = _b.sent();
                        if (!currentAccount) {
                            throw new Error("Account not found with id: ".concat(id));
                        }
                        // Si parentAccountId a été modifié, mettre à jour gs5pk
                        if (data.parentAccountId !== undefined && data.parentAccountId !== currentAccount.parentAccountId) {
                            data.gs5pk = "reseller#".concat(data.parentAccountId);
                        }
                        return [4 /*yield*/, this.Account.update(data, { return: "get" })];
                    case 2:
                        updatedAccount = _b.sent();
                        return [2 /*return*/, updatedAccount];
                }
            });
        }); };
        this.removeById = function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.Account.remove({ id: id })];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.createReseller = function (data) { return __awaiter(_this, void 0, void 0, function () {
            var accountData, account;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        accountData = {
                            name: data.name,
                            isReseller: true
                        };
                        return [4 /*yield*/, this.Account.create(accountData)];
                    case 1:
                        account = _b.sent();
                        return [4 /*yield*/, this.Partner.create({
                                id: account.id,
                                name: data.name,
                                type: data.partnerType || "reseller"
                            })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, account];
                }
            });
        }); };
        this.createClientAccount = function (resellerAccountId, data) { return __awaiter(_this, void 0, void 0, function () {
            var reseller, clientAccount;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getAccount(resellerAccountId)];
                    case 1:
                        reseller = _b.sent();
                        if (!reseller || !reseller.isReseller) {
                            throw new Error("Invalid reseller account");
                        }
                        return [4 /*yield*/, this.Account.create({
                                name: data.name,
                                isReseller: false,
                                parentAccountId: resellerAccountId,
                                gs5pk: "reseller#".concat(resellerAccountId) // Écraser la valeur par défaut
                            })];
                    case 2:
                        clientAccount = _b.sent();
                        return [2 /*return*/, clientAccount];
                }
            });
        }); };
        this.hasAccessToAccount = function (accessorId, targetId) { return __awaiter(_this, void 0, void 0, function () {
            var targetAccount;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Si c'est le même compte, accès autorisé
                        if (accessorId === targetId)
                            return [2 /*return*/, true];
                        return [4 /*yield*/, this.getAccount(targetId)];
                    case 1:
                        targetAccount = _b.sent();
                        if (!targetAccount)
                            return [2 /*return*/, false];
                        // Si le compte cible a comme parentAccountId l'accessorId, alors l'accès est autorisé
                        return [2 /*return*/, targetAccount.parentAccountId === accessorId];
                }
            });
        }); };
        this.listClientsOfReseller = function (resellerAccountId_1) {
            var args_1 = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args_1[_i - 1] = arguments[_i];
            }
            return __awaiter(_this, __spreadArray([resellerAccountId_1], args_1, true), void 0, function (resellerAccountId, query) {
                var resellerAccount;
                if (query === void 0) { query = {}; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.getAccount(resellerAccountId)];
                        case 1:
                            resellerAccount = _b.sent();
                            if (!resellerAccount || !resellerAccount.isReseller) {
                                throw new Error("Account is not a reseller");
                            }
                            return [4 /*yield*/, (0, paginateModel_1.paginateModel)(this.Account, 'find', { gs5pk: "reseller#".concat(resellerAccountId) }, query, { index: 'gs5', follow: true })];
                        case 2: 
                        // Utiliser la clé gs5pk pour récupérer tous les clients de ce revendeur
                        return [2 /*return*/, _b.sent()];
                    }
                });
            });
        };
        this.updateAccountsWithDefaultGs5pk = function () { return __awaiter(_this, void 0, void 0, function () {
            var accounts, updatedCount, errorCount, _i, accounts_1, account, hasClients, error_1, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 18, , 19]);
                        return [4 /*yield*/, this.Account.scan()];
                    case 1:
                        accounts = _b.sent();
                        console.log("Found ".concat(accounts.length, " accounts to check."));
                        updatedCount = 0;
                        errorCount = 0;
                        _i = 0, accounts_1 = accounts;
                        _b.label = 2;
                    case 2:
                        if (!(_i < accounts_1.length)) return [3 /*break*/, 17];
                        account = accounts_1[_i];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 15, , 16]);
                        if (!account.parentAccountId) return [3 /*break*/, 6];
                        if (!(account.gs5pk !== "reseller#".concat(account.parentAccountId))) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.Account.update({
                                id: account.id,
                                gs5pk: "reseller#".concat(account.parentAccountId),
                                gs5sk: "account#".concat(account.id)
                            })];
                    case 4:
                        _b.sent();
                        updatedCount++;
                        _b.label = 5;
                    case 5: return [3 /*break*/, 14];
                    case 6:
                        if (!account.isReseller) return [3 /*break*/, 12];
                        return [4 /*yield*/, this.hasClients(account.id)];
                    case 7:
                        hasClients = _b.sent();
                        if (!(hasClients && account.gs5pk !== "reseller#".concat(account.id))) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.Account.update({
                                id: account.id,
                                gs5pk: "reseller#".concat(account.id),
                                gs5sk: "account#".concat(account.id)
                            })];
                    case 8:
                        _b.sent();
                        updatedCount++;
                        return [3 /*break*/, 11];
                    case 9:
                        if (!(!hasClients && account.gs5pk !== "standard#account")) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.Account.update({
                                id: account.id,
                                gs5pk: "standard#account",
                                gs5sk: "account#".concat(account.id)
                            })];
                    case 10:
                        _b.sent();
                        updatedCount++;
                        _b.label = 11;
                    case 11: return [3 /*break*/, 14];
                    case 12:
                        if (!(account.gs5pk !== "standard#account")) return [3 /*break*/, 14];
                        return [4 /*yield*/, this.Account.update({
                                id: account.id,
                                gs5pk: "standard#account",
                                gs5sk: "account#".concat(account.id)
                            })];
                    case 13:
                        _b.sent();
                        updatedCount++;
                        _b.label = 14;
                    case 14: return [3 /*break*/, 16];
                    case 15:
                        error_1 = _b.sent();
                        console.error("Error updating account ".concat(account.id, ":"), error_1);
                        errorCount++;
                        return [3 /*break*/, 16];
                    case 16:
                        _i++;
                        return [3 /*break*/, 2];
                    case 17:
                        console.log("Update completed: ".concat(updatedCount, " accounts updated, ").concat(errorCount, " errors."));
                        return [2 /*return*/, {
                                total: accounts.length,
                                updated: updatedCount,
                                errors: errorCount
                            }];
                    case 18:
                        error_2 = _b.sent();
                        console.error("Update error:", error_2);
                        throw error_2;
                    case 19: return [2 /*return*/];
                }
            });
        }); };
        this.hasClients = function (resellerAccountId) { return __awaiter(_this, void 0, void 0, function () {
            var clients;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.Account.find({
                            parentAccountId: resellerAccountId
                        }, { limit: 1 })];
                    case 1:
                        clients = _b.sent();
                        return [2 /*return*/, clients.length > 0];
                }
            });
        }); };
        this.secretsString = secretsString;
        this.Crypto = {
            primary: {
                cipher: "aes-256-gcm",
                password: this.secretsString.CryptoPrimaryPassword,
            },
        };
        this.table = new dynamodb_onetable_1.Table({
            client: client,
            schema: schema_1.default,
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
    var _a;
    _a = Accounts;
    Accounts.init = function () { return __awaiter(void 0, void 0, void 0, function () {
        var secretsString;
        return __generator(_a, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, retrieveSecrets_1.default)("/coinhouse-solution/CardPayment-configuration")];
                case 1:
                    secretsString = _b.sent();
                    return [2 /*return*/, new _a(secretsString)];
            }
        });
    }); };
    return Accounts;
}());
exports.Accounts = Accounts;
exports.default = Accounts;
//# sourceMappingURL=accounts.model.js.map