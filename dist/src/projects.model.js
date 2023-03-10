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
var schema_1 = require("./schema");
var ApiGatewayCryptoPayment_js_1 = require("./utils/ApiGatewayCryptoPayment.js");
var retrieveSecrets_1 = require("./utils/retrieveSecrets");
var crypto_1 = require("crypto");
var Projects = /** @class */ (function () {
    function Projects(secretsString) {
        var _this = this;
        this.randomString = function () {
            return (0, crypto_1.randomBytes)(5).toString("hex");
        };
        this.generateApiKey = function () {
            return (0, crypto_1.createHash)("sha256").update(Math.random().toString()).digest("hex");
        };
        this.insert = function (data) { return __awaiter(_this, void 0, void 0, function () {
            var account_1, error_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.Account.get({ id: data.accountId })];
                    case 1:
                        account_1 = _b.sent();
                        this.table.setContext({ accountId: data.accountId });
                        return [2 /*return*/, this.Project.create({
                                name: data.name,
                                accountId: data.accountId,
                                codeProject: data.codeProject,
                                typeProject: data.typeProject,
                                description: data.description,
                                status: data.status,
                                parameters: data.parameters,
                                apiKey: this.generateApiKey(),
                                hmacPassword: this.randomString()
                            }).then(function (project) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, this.createApiKey({ accountName: account_1.name, project: project })];
                                        case 1:
                                            _b.sent();
                                            return [2 /*return*/, project];
                                    }
                                });
                            }); })];
                    case 2:
                        error_1 = _b.sent();
                        throw new Error("Error during add new project ".concat(error_1));
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.findById = function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.Project.get({ id: id }, { index: "gs2", follow: true })];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.findPublicById = function (id) { return __awaiter(_this, void 0, void 0, function () {
            var project;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.Project.get({ id: id }, { index: "gs2", follow: true })];
                    case 1:
                        project = _b.sent();
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
        this.findByCodeProject = function (codeProject, showHiddenFields) {
            if (showHiddenFields === void 0) { showHiddenFields = false; }
            return __awaiter(_this, void 0, void 0, function () {
                var project;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.Project.get({ codeProject: codeProject }, { index: "gs1", follow: true })];
                        case 1:
                            project = _b.sent();
                            if (showHiddenFields === false) {
                                delete project.hmacPassword;
                                delete project.apiKey;
                                delete project.status;
                                delete project.created;
                                delete project.updated;
                            }
                            return [2 /*return*/, project];
                    }
                });
            });
        };
        this.findByApiKey = function (apiKey) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.Project.get({ apiKey: apiKey }, { index: "gs3", follow: true })];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.getById = function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.Project.get({ id: id }, { index: "gs2", follow: true })];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.list = function (accountId, query) { return __awaiter(_this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_b) {
                key = {};
                if (accountId)
                    key = { pk: "account#".concat(accountId) };
                return [2 /*return*/, this.Project.find(key, { index: "gs1", follow: true }, query)];
            });
        }); };
        this.patchById = function (id, data) { return __awaiter(_this, void 0, void 0, function () {
            var project;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.Project.get({ id: id }, { index: "gs2", follow: true })];
                    case 1:
                        project = _b.sent();
                        this.table.setContext({ accountId: project.accountId });
                        data.id = id;
                        this.createApiKey(data);
                        return [2 /*return*/, this.Project.update(data)];
                }
            });
        }); };
        this.removeById = function (id) { return __awaiter(_this, void 0, void 0, function () {
            var project;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.Project.get({ id: id }, { index: "gs2", follow: true })];
                    case 1:
                        project = _b.sent();
                        if (!project)
                            throw new Error("Project not found");
                        if (!(project.typeProject === "cryptoPayment")) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, ApiGatewayCryptoPayment_js_1.removeApiKey)(project.apiKeyId)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3: return [2 /*return*/, this.Project.remove({ sk: "project#".concat(id), pk: "account#".concat(project.accountId) })];
                }
            });
        }); };
        this.createApiKey = function (obj) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(obj.project.typeProject === "cryptoPayment")) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, ApiGatewayCryptoPayment_js_1.importApiKey)(obj)
                                .then(function (keyId) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, (0, ApiGatewayCryptoPayment_js_1.configureUsagePlanKey)(keyId).catch(function (error) {
                                                console.error(error);
                                                throw new Error("Error during configure usage plan key ".concat(error));
                                            })];
                                        case 1:
                                            _b.sent();
                                            return [4 /*yield*/, this.Project.update({ id: obj.project.id, apiKeyId: keyId })];
                                        case 2:
                                            _b.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })
                                .catch(function (error) {
                                console.error(error);
                                throw new Error("Error during import key ".concat(error));
                            })];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/];
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
    _a = Projects;
    Projects.init = function () { return __awaiter(void 0, void 0, void 0, function () {
        var secretsString;
        return __generator(_a, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, retrieveSecrets_1.default)("/coinhouse-solution/CardPayment-configuration")];
                case 1:
                    secretsString = _b.sent();
                    return [2 /*return*/, new Projects(secretsString)];
            }
        });
    }); };
    return Projects;
}());
exports.Projects = Projects;
exports.default = Projects;
//# sourceMappingURL=projects.model.js.map