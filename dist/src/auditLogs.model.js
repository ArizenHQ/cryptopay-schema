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
exports.AuditLogs = void 0;
var Dynamo_1 = require("dynamodb-onetable/Dynamo");
var dynamodb_onetable_1 = require("dynamodb-onetable");
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var client = new Dynamo_1.Dynamo({ client: new client_dynamodb_1.DynamoDBClient({ region: "eu-west-1" }) });
var schema_1 = require("./schema");
var retrieveSecrets_1 = require("./utils/retrieveSecrets");
var paginateModel_1 = require("./utils/paginateModel");
var AuditLogs = /** @class */ (function () {
    function AuditLogs(secretsString) {
        var _this = this;
        this.log = function (params) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.table.setContext({ accountId: params.accountId });
                        return [4 /*yield*/, this.AuditLog.create({
                                accountId: params.accountId,
                                entityType: params.entityType,
                                entityId: params.entityId,
                                action: params.action,
                                by: params.by || { system: "temporal" },
                                at: new Date().toISOString(),
                                meta: params.meta || {},
                            })];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.findByEntity = function (entityType_1, entityId_1, accountId_1) {
            var args_1 = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                args_1[_i - 3] = arguments[_i];
            }
            return __awaiter(_this, __spreadArray([entityType_1, entityId_1, accountId_1], args_1, true), void 0, function (entityType, entityId, accountId, query) {
                if (query === void 0) { query = {}; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            this.table.setContext({ accountId: accountId });
                            return [4 /*yield*/, (0, paginateModel_1.paginateModel)(this.AuditLog, "find", {
                                    gs5pk: "auditLog#".concat(entityType, "#").concat(entityId),
                                    gs5sk: { begins: "auditLog#" },
                                }, query, { index: "gs5", follow: true })];
                        case 1: return [2 /*return*/, _b.sent()];
                    }
                });
            });
        };
        this.findByAccount = function (accountId_1) {
            var args_1 = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args_1[_i - 1] = arguments[_i];
            }
            return __awaiter(_this, __spreadArray([accountId_1], args_1, true), void 0, function (accountId, query) {
                if (query === void 0) { query = {}; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            this.table.setContext({ accountId: accountId });
                            return [4 /*yield*/, (0, paginateModel_1.paginateModel)(this.AuditLog, "find", { gs1pk: "auditLog#" }, query, { index: "gs1", follow: true })];
                        case 1: return [2 /*return*/, _b.sent()];
                    }
                });
            });
        };
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
        this.AuditLog = this.table.getModel("AuditLog");
    }
    var _a;
    _a = AuditLogs;
    AuditLogs.init = function () { return __awaiter(void 0, void 0, void 0, function () {
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
    return AuditLogs;
}());
exports.AuditLogs = AuditLogs;
exports.default = AuditLogs;
//# sourceMappingURL=auditLogs.model.js.map