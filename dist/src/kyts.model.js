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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Kyts = void 0;
var Dynamo_1 = require("dynamodb-onetable/Dynamo");
var dynamodb_onetable_1 = require("dynamodb-onetable");
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var client = new Dynamo_1.Dynamo({ client: new client_dynamodb_1.DynamoDBClient({ region: "eu-west-1" }) });
var schema_1 = require("./schema");
var retrieveSecrets_1 = require("./utils/retrieveSecrets");
var Kyts = /** @class */ (function () {
    function Kyts(secretsString) {
        var _this = this;
        this.insert = function (projectId, data, incrementCount) { return __awaiter(_this, void 0, void 0, function () {
            var project, kyt, param, error_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.Project.get({ id: projectId }, { index: "gs2", follow: true })];
                    case 1:
                        project = _b.sent();
                        this.table.setContext({ accountId: project.accountId });
                        data.accountId = project.accountId;
                        data.projectId = projectId;
                        return [4 /*yield*/, this.Kyt.get({ address: data.address }, { index: "gs2", follow: true })];
                    case 2:
                        kyt = _b.sent();
                        param = {};
                        if (incrementCount)
                            param = { add: { calls: 1 } };
                        if (kyt) {
                            data.id = kyt.id;
                            return [2 /*return*/, this.Kyt.update(data, param).then(function (_kyt) { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_b) {
                                        return [2 /*return*/, _kyt];
                                    });
                                }); })];
                        }
                        else {
                            return [2 /*return*/, this.Kyt.create(data).then(function (_kyt) { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_b) {
                                        return [2 /*return*/, _kyt];
                                    });
                                }); })];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        console.error(error_1);
                        throw new Error("Error during add or update new kyt ".concat(error_1));
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        this.findById = function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.Kyt.get({ id: id }, { index: "gs2", follow: true })];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.findPublicById = function (id) { return __awaiter(_this, void 0, void 0, function () {
            var order;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.Kyt.get({ id: id }, { index: "gs2", follow: true })];
                    case 1:
                        order = _b.sent();
                        return [2 /*return*/, order];
                }
            });
        }); };
        this.scan = function (params, query) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.Kyt.scan(params, query)];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.getById = function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.Kyt.get({ id: id }, { index: "gs1", follow: true })];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.list = function (accountId, query) { return __awaiter(_this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        key = {};
                        if (accountId)
                            key = { pk: "account#".concat(accountId) };
                        return [4 /*yield*/, this.Kyt.find(key, { index: "gs1", follow: true }, query)];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.patchById = function (id, data) { return __awaiter(_this, void 0, void 0, function () {
            var kyt, currentDate, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.Kyt.get({ id: id }, { index: "gs1", follow: true })];
                    case 1:
                        kyt = _b.sent();
                        if (!kyt)
                            throw new Error("no kyt fund for id: ".concat(id));
                        this.table.setContext({ accountId: kyt.accountId });
                        data.id = id;
                        currentDate = new Date();
                        data.dateLastUpdated = currentDate.getTime();
                        return [4 /*yield*/, this.Kyt.update(data, { return: 'get' })];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        err_1 = _b.sent();
                        throw new Error("Error during update kyt ".concat(err_1));
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        this.removeById = function (id) { return __awaiter(_this, void 0, void 0, function () {
            var kyt;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.Kyt.get({ id: id }, { index: "gs1", follow: true })];
                    case 1:
                        kyt = _b.sent();
                        if (!kyt)
                            throw new Error("Kyt not found");
                        return [4 /*yield*/, this.Kyt.remove({ sk: "kyt#".concat(id), pk: "account#".concat(kyt.accountId) })];
                    case 2: return [2 /*return*/, _b.sent()];
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
    _a = Kyts;
    Kyts.init = function () { return __awaiter(void 0, void 0, void 0, function () {
        var secretsString;
        return __generator(_a, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, retrieveSecrets_1.default)("/coinhouse-solution/CardPayment-configuration")];
                case 1:
                    secretsString = _b.sent();
                    return [2 /*return*/, new Kyts(secretsString)];
            }
        });
    }); };
    return Kyts;
}());
exports.Kyts = Kyts;
exports.default = Kyts;
//# sourceMappingURL=kyts.model.js.map