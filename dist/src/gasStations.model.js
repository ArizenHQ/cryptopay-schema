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
exports.GasStations = void 0;
var Dynamo_1 = require("dynamodb-onetable/Dynamo");
var dynamodb_onetable_1 = require("dynamodb-onetable");
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var client = new Dynamo_1.Dynamo({
    client: new client_dynamodb_1.DynamoDBClient({ region: "eu-west-1" }),
});
var schema_1 = require("./schema");
var retrieveSecrets_1 = require("./utils/retrieveSecrets");
var paginateModel_1 = require("./utils/paginateModel");
var GasStations = /** @class */ (function () {
    function GasStations(secretsString) {
        var _this = this;
        this.insert = function (gasStation, projectId) { return __awaiter(_this, void 0, void 0, function () {
            var project, error_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.Project.get({ id: projectId }, { index: "gs2", follow: true })];
                    case 1:
                        project = _b.sent();
                        if (!(Object.keys(project).length > 0)) return [3 /*break*/, 3];
                        if (project.typeProject !== "gasStation")
                            throw new Error("That project is not configured for type gasStation. Please choose another one, create a new one or chnage this one for this kind of project. Be careful, if you change the project type, all your other instance could be impacted");
                        this.table.setContext({ accountId: project.accountId });
                        gasStation.accountId = project.accountId;
                        gasStation.codeProject = project.codeProject;
                        gasStation.projectId = project.id;
                        if (!project.parameters.gasStation.currency ||
                            !project.parameters.gasStation.limitPer24H)
                            throw new Error("That project is not fine configured. Please update your project with paramaeters for project type gasStation");
                        if (!gasStation.amount || gasStation.amount === 0)
                            throw new Error("Amount propertie is incorrect. Please enter a value > 0");
                        return [4 /*yield*/, this.isGasStationAvailable(project.accountId, project.id, gasStation.amount)];
                    case 2:
                        if (!(_b.sent()))
                            throw new Error("The daily purchase limit has been exceeded. Please change amount");
                        return [3 /*break*/, 4];
                    case 3: throw new Error("Project not found! Please check your codeProject or API Key");
                    case 4: return [4 /*yield*/, this.GasStation.create(gasStation).then(function (gasStation) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_b) {
                                delete gasStation.audit;
                                return [2 /*return*/, gasStation];
                            });
                        }); })];
                    case 5: return [2 /*return*/, _b.sent()];
                    case 6:
                        error_1 = _b.sent();
                        throw new Error("Error during add new gasStation request ".concat(error_1));
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        this.isGasStationAvailable = function (accountId, projectId, amount) { return __awaiter(_this, void 0, void 0, function () {
            var dateYeasterday, dateISOYesterday, listGasStationForToday, sum_1, project, limit, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        dateYeasterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
                        dateISOYesterday = new Date(dateYeasterday).toISOString();
                        return [4 /*yield*/, this.list(accountId, projectId, { where: "${dateCreated} >= {" + dateISOYesterday + "}" })];
                    case 1:
                        listGasStationForToday = _b.sent();
                        sum_1 = amount;
                        listGasStationForToday.map(function (gas) {
                            sum_1 = sum_1 + gas.amount;
                        });
                        return [4 /*yield*/, this.Project.get({ id: projectId }, { index: "gs2", follow: true })];
                    case 2:
                        project = _b.sent();
                        limit = project.parameters.gasStation.limitPer24H;
                        if (limit >= sum_1)
                            return [2 /*return*/, true];
                        else
                            return [2 /*return*/, false];
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _b.sent();
                        throw new Error("Error during isGasStationAvailable: ".concat(e_1.message));
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        this.findById = function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.GasStation.get({ id: id }, { index: "gs2", follow: true })];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.findPublicById = function (id) { return __awaiter(_this, void 0, void 0, function () {
            var order;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.GasStation.get({ id: id }, { index: "gs2", follow: true })];
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
                        case 0: return [4 /*yield*/, (0, paginateModel_1.paginateModel)(this.GasStation, 'scan', params, query)];
                        case 1: return [2 /*return*/, _b.sent()];
                    }
                });
            });
        };
        this.getById = function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.GasStation.get({ id: id }, { index: "gs1", follow: true })];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.list = function (accountId, projectId, query) { return __awaiter(_this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        key = {};
                        if (accountId)
                            key.pk = "account#".concat(accountId);
                        if (projectId)
                            key.projectId = projectId;
                        return [4 /*yield*/, (0, paginateModel_1.paginateModel)(this.GasStation, 'find', key, query)];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.patchById = function (id, data) { return __awaiter(_this, void 0, void 0, function () {
            var gasStation, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.GasStation.get({ id: id }, { index: "gs1", follow: true })];
                    case 1:
                        gasStation = _b.sent();
                        if (!gasStation)
                            throw new Error("no gasStation fund for id: ".concat(id));
                        this.table.setContext({ accountId: gasStation.accountId });
                        data.id = id;
                        return [4 /*yield*/, this.GasStation.update(data, { return: "get" })];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        err_1 = _b.sent();
                        throw new Error("Error during update gasStation ".concat(err_1));
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        this.removeById = function (id) { return __awaiter(_this, void 0, void 0, function () {
            var gasStation;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.GasStation.get({ id: id }, { index: "gs1", follow: true })];
                    case 1:
                        gasStation = _b.sent();
                        if (!gasStation)
                            throw new Error("gasStation not found");
                        return [4 /*yield*/, this.Order.remove({
                                sk: "gasStation#".concat(id),
                                pk: "account#".concat(gasStation.accountId),
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
            /*logger: (level, message, context) => {
              console.log(`${new Date().toLocaleString()}: ${level}: ${message}`)
              console.log(JSON.stringify(context, null, 4) + '\n')
          }*/
        });
        this.User = this.table.getModel("User");
        this.Project = this.table.getModel("Project");
        this.Account = this.table.getModel("Account");
        this.Order = this.table.getModel("Order");
        this.Payment = this.table.getModel("Payment");
        this.Kyt = this.table.getModel("Kyt");
        this.GasStation = this.table.getModel("GasStation");
    }
    var _a;
    _a = GasStations;
    GasStations.init = function () { return __awaiter(void 0, void 0, void 0, function () {
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
    return GasStations;
}());
exports.GasStations = GasStations;
exports.default = GasStations;
//# sourceMappingURL=gasStations.model.js.map