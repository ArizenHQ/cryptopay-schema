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
exports.Users = void 0;
var Dynamo_1 = require("dynamodb-onetable/Dynamo");
var dynamodb_onetable_1 = require("dynamodb-onetable");
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var client = new Dynamo_1.Dynamo({
    client: new client_dynamodb_1.DynamoDBClient({ region: "eu-west-1" }),
});
var schema_1 = require("./schema");
var retrieveSecrets_1 = require("./utils/retrieveSecrets");
var paginateModel_1 = require("./utils/paginateModel");
var crypto_1 = require("crypto");
var Users = /** @class */ (function () {
    function Users(secretsString) {
        var _this = this;
        this.generateApiKey = function () {
            return (0, crypto_1.createHash)("sha256").update(Math.random().toString()).digest("hex");
        };
        this.insert = function (data) { return __awaiter(_this, void 0, void 0, function () {
            var account, resellerAccountId, gs5pk;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.Account.get({ pk: "account#".concat(data.accountId) })];
                    case 1:
                        account = _b.sent();
                        if (!account)
                            throw new Error("Account not found");
                        resellerAccountId = null;
                        gs5pk = null;
                        if (account.parentAccountId) {
                            resellerAccountId = account.parentAccountId;
                            gs5pk = "reseller#".concat(resellerAccountId);
                        }
                        this.table.setContext({ accountId: data.accountId });
                        return [4 /*yield*/, this.User.create({
                                name: data.name,
                                email: data.email,
                                password: data.password,
                                permissionLevel: data.permissionLevel,
                                resellerAccountId: resellerAccountId,
                                apiKey: this.generateApiKey(),
                                gs5pk: gs5pk,
                            })];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.findById = function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.User.get({ id: id }, { index: "gs4", follow: true })];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.findByApiKey = function (apiKey) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.User.find({ apiKey: apiKey }, { index: "gs1", follow: true })];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.getByEmail = function (email) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.User.get({ email: email })];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.findByEmail = function (email) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.User.find({ email: email }, { index: "gs1", follow: true })];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.patchById = function (id, data) { return __awaiter(_this, void 0, void 0, function () {
            var user, account, resellerAccountId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.User.get({ id: id }, { index: "gs4" })];
                    case 1:
                        user = _b.sent();
                        this.table.setContext({ accountId: user.accountId });
                        if (data.password) {
                            delete data.password;
                        }
                        return [4 /*yield*/, this.Account.get({ pk: "account#".concat(data.accountId) })];
                    case 2:
                        account = _b.sent();
                        if (!account)
                            throw new Error("Account not found");
                        resellerAccountId = null;
                        if (account.parentAccountId) {
                            resellerAccountId = account.parentAccountId;
                        }
                        else if (account.isReseller) {
                            resellerAccountId = account.id;
                        }
                        // Ajouter le resellerAccountId aux données de mise à jour
                        data.resellerAccountId = resellerAccountId;
                        data.gs5pk = resellerAccountId ? "reseller#".concat(resellerAccountId) : "standard#user";
                        return [4 /*yield*/, this.User.update(data, { return: "get" })];
                    case 3: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.updatePassword = function (id, password) { return __awaiter(_this, void 0, void 0, function () {
            var user, encryptedPassword;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!password || password.length < 8) {
                            throw new Error("Password must be at least 8 characters long");
                        }
                        return [4 /*yield*/, this.User.get({ id: id }, { index: "gs4" })];
                    case 1:
                        user = _b.sent();
                        if (!user) {
                            throw new Error("User not found");
                        }
                        return [4 /*yield*/, this.table.encrypt(password)];
                    case 2:
                        encryptedPassword = _b.sent();
                        return [4 /*yield*/, this.User.update(user, {
                                set: { password: encryptedPassword },
                                return: "get",
                            })];
                    case 3: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.scan = function () {
            var args_1 = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args_1[_i] = arguments[_i];
            }
            return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (query) {
                if (query === void 0) { query = {}; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, (0, paginateModel_1.paginateModel)(this.User, "scan", query, {
                                index: "gs4",
                                follow: true,
                            })];
                        case 1: return [2 /*return*/, _b.sent()];
                    }
                });
            });
        };
        this.list = function (accountId_1) {
            var args_1 = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args_1[_i - 1] = arguments[_i];
            }
            return __awaiter(_this, __spreadArray([accountId_1], args_1, true), void 0, function (accountId, query) {
                var key;
                if (query === void 0) { query = {}; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            key = {};
                            if (accountId)
                                key.pk = "account#".concat(accountId);
                            return [4 /*yield*/, (0, paginateModel_1.paginateModel)(this.User, "find", key, query, {
                                    index: "gs4",
                                    follow: true,
                                })];
                        case 1: return [2 /*return*/, _b.sent()];
                    }
                });
            });
        };
        this.listUsersForReseller = function (resellerAccountId_1) {
            var args_1 = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args_1[_i - 1] = arguments[_i];
            }
            return __awaiter(_this, __spreadArray([resellerAccountId_1], args_1, true), void 0, function (resellerAccountId, query) {
                if (query === void 0) { query = {}; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, (0, paginateModel_1.paginateModel)(this.User, 'find', { gs5pk: "reseller#".concat(resellerAccountId) }, query, { index: 'gs5', follow: true })];
                        case 1: return [2 /*return*/, _b.sent()];
                    }
                });
            });
        };
        this.removeById = function (id) { return __awaiter(_this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.User.get({ id: id }, { index: "gs1", follow: true, decrypt: true })];
                    case 1:
                        user = _b.sent();
                        return [4 /*yield*/, this.User.remove({ id: id, email: undefined }, { index: "gs4", follow: true })];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.updateUsersWithCorrectGs5pk = function () { return __awaiter(_this, void 0, void 0, function () {
            var allUsers, updatedCount, errorCount, _i, allUsers_1, user, account, resellerAccountId, correctGs5pk, error_1, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 10, , 11]);
                        return [4 /*yield*/, this.User.scan()];
                    case 1:
                        allUsers = _b.sent();
                        console.log("Found ".concat(allUsers.length, " users to check."));
                        updatedCount = 0;
                        errorCount = 0;
                        _i = 0, allUsers_1 = allUsers;
                        _b.label = 2;
                    case 2:
                        if (!(_i < allUsers_1.length)) return [3 /*break*/, 9];
                        user = allUsers_1[_i];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 7, , 8]);
                        return [4 /*yield*/, this.Account.get({ pk: "account#".concat(user.accountId) })];
                    case 4:
                        account = _b.sent();
                        if (!account) {
                            console.warn("Account not found for user ".concat(user.id));
                            return [3 /*break*/, 8];
                        }
                        resellerAccountId = null;
                        correctGs5pk = "standard#user";
                        if (account.parentAccountId) {
                            resellerAccountId = account.parentAccountId;
                            correctGs5pk = "reseller#".concat(resellerAccountId);
                        }
                        else if (account.isReseller) {
                            resellerAccountId = account.id;
                            correctGs5pk = "reseller#".concat(resellerAccountId);
                        }
                        if (!(user.resellerAccountId !== resellerAccountId || user.gs5pk !== correctGs5pk)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.User.update({
                                id: user.id,
                                pk: "account#".concat(user.accountId),
                                resellerAccountId: resellerAccountId,
                                gs5pk: correctGs5pk
                            })];
                    case 5:
                        _b.sent();
                        updatedCount++;
                        _b.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_1 = _b.sent();
                        console.error("Error updating user ".concat(user.id, ":"), error_1);
                        errorCount++;
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 2];
                    case 9:
                        console.log("Update completed: ".concat(updatedCount, " users updated, ").concat(errorCount, " errors."));
                        return [2 /*return*/, {
                                total: allUsers.length,
                                updated: updatedCount,
                                errors: errorCount
                            }];
                    case 10:
                        error_2 = _b.sent();
                        console.error("Update error:", error_2);
                        throw error_2;
                    case 11: return [2 /*return*/];
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
    }
    var _a;
    _a = Users;
    Users.init = function () { return __awaiter(void 0, void 0, void 0, function () {
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
    return Users;
}());
exports.Users = Users;
exports.default = Users;
//# sourceMappingURL=users.model.js.map