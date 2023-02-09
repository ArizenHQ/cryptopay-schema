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
exports.Projects = void 0;
var Dynamo_1 = require("dynamodb-onetable/Dynamo");
var dynamodb_onetable_1 = require("dynamodb-onetable");
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var client = new Dynamo_1.Dynamo({ client: new client_dynamodb_1.DynamoDBClient({ region: "eu-west-1" }) });
var schema_js_1 = require("./schema.js");
var ApiGatewayCryptoPayment_js_1 = require("./utils/ApiGatewayCryptoPayment.js");
var retrieveSecrets_1 = require("./utils/retrieveSecrets");
var Crypto;
var table;
var User;
var Project;
var Account;
var Projects = /** @class */ (function () {
    function Projects() {
        var _this = this;
        this.init = function () { return __awaiter(_this, void 0, void 0, function () {
            var secretsString;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, retrieveSecrets_1.default)("/coinhouse-solution/CardPayment-configuration")];
                    case 1:
                        secretsString = _a.sent();
                        Crypto = {
                            primary: {
                                cipher: "aes-256-gcm",
                                password: secretsString.CryptoPrimaryPassword,
                            },
                        };
                        table = new dynamodb_onetable_1.Table({
                            client: client,
                            schema: schema_js_1.default,
                            partial: false,
                            crypto: Crypto,
                            name: "CryptoPay-Accounts",
                        });
                        User = table.getModel("User");
                        Project = table.getModel("Project");
                        Account = table.getModel("Account");
                        return [2 /*return*/];
                }
            });
        }); };
        this.insert = function (data) { return __awaiter(_this, void 0, void 0, function () {
            var account_1, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Account.get({ id: data.accountId })];
                    case 1:
                        account_1 = _a.sent();
                        table.setContext({ accountId: data.accountId });
                        return [2 /*return*/, Project.create({
                                name: data.name,
                                accountId: data.accountId,
                                codeProject: data.codeProject,
                                typeProject: data.typeProject,
                                description: data.description,
                                status: data.status,
                                parameters: data.parameters,
                            }).then(function (project) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    this.createApiKey({ accountName: account_1.name, project: project });
                                    return [2 /*return*/, project];
                                });
                            }); })];
                    case 2:
                        error_1 = _a.sent();
                        throw new Error("Error during add new project ".concat(error_1));
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.findById = function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Project.get({ id: id }, { index: "gs2", follow: true })];
            });
        }); };
        this.findPublicById = function (id) { return __awaiter(_this, void 0, void 0, function () {
            var project;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Project.get({ id: id }, { index: "gs2", follow: true })];
                    case 1:
                        project = _a.sent();
                        delete project.hmacPassword;
                        delete project.apiKey;
                        delete project.accountId;
                        delete project.status;
                        delete project.created;
                        delete project.updated;
                        return [2 /*return*/, project];
                }
            });
        }); };
        this.findByApiKey = function (apiKey) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Project.get({ apiKey: apiKey }, { index: "gs3", follow: true })];
            });
        }); };
        this.getById = function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Project.get({ id: id }, { index: "gs1", follow: true })];
            });
        }); };
        this.list = function (accountId, query) { return __awaiter(_this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                key = {};
                if (accountId)
                    key = { pk: "account#".concat(accountId) };
                return [2 /*return*/, Project.find(key, { index: "gs1", follow: true }, query)];
            });
        }); };
        this.patchById = function (id, data) { return __awaiter(_this, void 0, void 0, function () {
            var project;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Project.get({ id: id }, { index: "gs2", follow: true })];
                    case 1:
                        project = _a.sent();
                        table.setContext({ accountId: project.accountId });
                        data.id = id;
                        this.createApiKey(data);
                        return [2 /*return*/, Project.update(data)];
                }
            });
        }); };
        this.removeById = function (id) { return __awaiter(_this, void 0, void 0, function () {
            var project;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Project.get({ id: id }, { index: "gs2", follow: true })];
                    case 1:
                        project = _a.sent();
                        if (!project)
                            throw new Error("Project not found");
                        if (!(project.typeProject === "cryptoPayment")) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, ApiGatewayCryptoPayment_js_1.removeApiKey)(project.apiKeyId)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, Project.remove({ sk: "project#".concat(id), pk: "account#".concat(project.accountId) })];
                }
            });
        }); };
        this.createApiKey = function (obj) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(obj.project.typeProject === "cryptoPayment")) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, ApiGatewayCryptoPayment_js_1.importApiKey)(obj)
                                .then(function (keyId) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, (0, ApiGatewayCryptoPayment_js_1.configureUsagePlanKey)(keyId).catch(function (error) {
                                                console.error(error);
                                                throw new Error("Error during configure usage plan key ".concat(error));
                                            })];
                                        case 1:
                                            _a.sent();
                                            return [4 /*yield*/, Project.update({ id: obj.project.id, apiKeyId: keyId })];
                                        case 2:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })
                                .catch(function (error) {
                                console.error(error);
                                throw new Error("Error during import key ".concat(error));
                            })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); };
        this.init();
    }
    return Projects;
}());
exports.Projects = Projects;
exports.default = Projects;