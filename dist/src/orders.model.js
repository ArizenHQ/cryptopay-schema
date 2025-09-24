"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.Orders = void 0;
var Dynamo_1 = require("dynamodb-onetable/Dynamo");
var dynamodb_onetable_1 = require("dynamodb-onetable");
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var client = new Dynamo_1.Dynamo({
    client: new client_dynamodb_1.DynamoDBClient({ region: "eu-west-1" }),
});
var schema_1 = require("./schema");
var retrieveSecrets_1 = require("./utils/retrieveSecrets");
var paginateModel_1 = require("./utils/paginateModel");
var blockchains_1 = require("./blockchains");
var Orders = /** @class */ (function () {
    function Orders(secretsString) {
        var _this = this;
        this.insert = function (accountId, order) { return __awaiter(_this, void 0, void 0, function () {
            var project, account, orderData, createdOrder, fieldsToRemove, error_1;
            var _b, _c, _d, _e, _f, _g, _h, _j, _k;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        _l.trys.push([0, 4, , 5]);
                        // Normaliser le code du projet
                        order.codeProject = order.projectCode || order.codeProject;
                        return [4 /*yield*/, this.Project.get({ codeProject: order.codeProject }, { index: "gs1", follow: true })];
                    case 1:
                        project = _l.sent();
                        if (!Object.keys(project).length) {
                            throw new Error("Project not found! Please check your codeProject or API Key");
                        }
                        // Vérifier que le compte correspond au projet
                        if (accountId !== project.accountId) {
                            throw new Error("accountId and project do not match. Please check all information or contact administrator");
                        }
                        return [4 /*yield*/, this.Account.get({ pk: "account#".concat(accountId) })];
                    case 2:
                        account = _l.sent();
                        // Configurer le contexte et les propriétés de base de l'ordre
                        this.table.setContext({ accountId: accountId });
                        orderData = __assign(__assign({}, order), { accountId: accountId, codeProject: project.codeProject, autoConvert: project.autoConvert ? "enabled" : "disabled", urlsRedirect: order.urlsRedirect || project.parameters, webhookUrl: order.webhookUrl || ((_b = project.parameters) === null || _b === void 0 ? void 0 : _b.webhookUrl), currency: (_c = order.currency) === null || _c === void 0 ? void 0 : _c.toUpperCase(), customerAddress: (_d = order.customerAddress) === null || _d === void 0 ? void 0 : _d.toLowerCase(), 
                            // Backward-compatible defaulting for blockchain/network
                            blockchain: order.blockchain || ((_e = project === null || project === void 0 ? void 0 : project.parameters) === null || _e === void 0 ? void 0 : _e.blockchain) || (0, blockchains_1.resolveBlockchainForCurrency)(order.currency, ((_f = project === null || project === void 0 ? void 0 : project.parameters) === null || _f === void 0 ? void 0 : _f.network) || ((_g = project === null || project === void 0 ? void 0 : project.parameters) === null || _g === void 0 ? void 0 : _g.blockchain)), network: order.network || (0, blockchains_1.resolveNetworkForCurrency)(order.currency, ((_h = project === null || project === void 0 ? void 0 : project.parameters) === null || _h === void 0 ? void 0 : _h.network) || ((_j = project === null || project === void 0 ? void 0 : project.parameters) === null || _j === void 0 ? void 0 : _j.blockchain)), applicationInfo: {
                                externalPlatform: {
                                    integrator: account.name,
                                    name: project.name,
                                },
                                merchantApplication: {
                                    name: project.name,
                                },
                            } });
                        // Ajouter les paramètres de paiement physique si présents
                        if (Object.keys(((_k = project === null || project === void 0 ? void 0 : project.parameters) === null || _k === void 0 ? void 0 : _k.physicalPayment) || {}).length > 0) {
                            orderData.physicalPaymentParams = project.parameters.physicalPayment;
                        }
                        return [4 /*yield*/, this.Order.create(orderData)];
                    case 3:
                        createdOrder = _l.sent();
                        fieldsToRemove = [
                            'notificationFromAdyen', 'session', 'applicationInfo',
                            'audit', 'statusOrder', 'countryCode', 'typeOrder'
                        ];
                        // Supprimer les champs non nécessaires
                        return [2 /*return*/, fieldsToRemove.reduce(function (order, field) {
                                delete order[field];
                                return order;
                            }, createdOrder)];
                    case 4:
                        error_1 = _l.sent();
                        throw new Error("Error during add new order ".concat(error_1));
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        this.findById = function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.Order.get({ id: id }, { index: "gs2", follow: true })];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.findPublicById = function (id) { return __awaiter(_this, void 0, void 0, function () {
            var order;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.Order.get({ id: id }, { index: "gs2", follow: true })];
                    case 1:
                        order = _b.sent();
                        return [2 /*return*/, order];
                }
            });
        }); };
        this.scan = function () {
            var args_1 = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args_1[_i] = arguments[_i];
            }
            return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (params, query) {
                if (params === void 0) { params = {}; }
                if (query === void 0) { query = {}; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, (0, paginateModel_1.paginateModel)(this.Order, 'scan', params, query)];
                        case 1: return [2 /*return*/, _b.sent()];
                    }
                });
            });
        };
        this.getById = function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.Order.get({ id: id }, { index: "gs1", follow: true })];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
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
                            return [4 /*yield*/, (0, paginateModel_1.paginateModel)(this.Order, 'find', key, query, {
                                    index: 'gs3',
                                    follow: true,
                                })];
                        case 1: return [2 /*return*/, _b.sent()];
                    }
                });
            });
        };
        this.patchById = function (id, data) { return __awaiter(_this, void 0, void 0, function () {
            var order, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.Order.get({ id: id }, { index: "gs1", follow: true })];
                    case 1:
                        order = _b.sent();
                        if (!order)
                            throw new Error("no order fund for id: ".concat(id));
                        this.table.setContext({ accountId: order.accountId });
                        data.id = id;
                        return [4 /*yield*/, this.Order.update(data, { return: "get" })];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        err_1 = _b.sent();
                        throw new Error("Error during update order ".concat(err_1));
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        this.removeById = function (id) { return __awaiter(_this, void 0, void 0, function () {
            var order;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.Order.get({ id: id }, { index: "gs1", follow: true })];
                    case 1:
                        order = _b.sent();
                        if (!order)
                            throw new Error("Order not found");
                        return [4 /*yield*/, this.Order.remove({
                                sk: "order#".concat(id),
                                pk: "account#".concat(order.accountId),
                            })];
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
    _a = Orders;
    Orders.init = function () { return __awaiter(void 0, void 0, void 0, function () {
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
    return Orders;
}());
exports.Orders = Orders;
exports.default = Orders;
//# sourceMappingURL=orders.model.js.map