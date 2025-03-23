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
Object.defineProperty(exports, "__esModule", { value: true });
exports.importApiKey = exports.removeApiKey = exports.configureUsagePlanKey = exports.getKeyRoute = exports.getApiKeyId = void 0;
var client_api_gateway_1 = require("@aws-sdk/client-api-gateway");
var clientUtils = new client_api_gateway_1.APIGatewayClient({ region: "eu-west-1" });
var retrieveSecrets_1 = require("./retrieveSecrets");
var importApiKey = function (obj) { return __awaiter(void 0, void 0, void 0, function () {
    var params, command;
    return __generator(this, function (_a) {
        params = {
            customerId: obj.project.accountId,
            enabled: true,
            generateDistinctId: false,
            name: "".concat(obj.accountName, "-").concat(obj.project.codeProject),
            value: obj.project.apiKey,
            description: "Created the ".concat(new Date().toISOString(), " for account ").concat(obj.accountName),
        };
        command = new client_api_gateway_1.CreateApiKeyCommand(params);
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var data, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, clientUtils.send(command)];
                        case 1:
                            data = _a.sent();
                            resolve(data.id);
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            reject(error_1);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
exports.importApiKey = importApiKey;
var removeApiKey = function (apiKeyId) { return __awaiter(void 0, void 0, void 0, function () {
    var params, command;
    return __generator(this, function (_a) {
        params = {
            apiKey: apiKeyId
        };
        command = new client_api_gateway_1.DeleteApiKeyCommand(params);
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var data, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, clientUtils.send(command)];
                        case 1:
                            data = _a.sent();
                            resolve(data);
                            return [3 /*break*/, 3];
                        case 2:
                            error_2 = _a.sent();
                            reject(error_2);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
exports.removeApiKey = removeApiKey;
var configureUsagePlanKey = function (keyId) { return __awaiter(void 0, void 0, void 0, function () {
    var secretsString, inputUsagePlanKey, command;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, retrieveSecrets_1.default)("/coinhouse-solution/CardPayment-configuration")];
            case 1:
                secretsString = _a.sent();
                inputUsagePlanKey = {
                    keyId: keyId,
                    keyType: "API_KEY",
                    usagePlanId: secretsString.usagePlanIdPublicApi,
                };
                command = new client_api_gateway_1.CreateUsagePlanKeyCommand(inputUsagePlanKey);
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                        var data, error_3;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, clientUtils.send(command)];
                                case 1:
                                    data = _a.sent();
                                    resolve(data.value);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_3 = _a.sent();
                                    reject(error_3);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
        }
    });
}); };
exports.configureUsagePlanKey = configureUsagePlanKey;
var getKeyRoute = function (apiKey) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { })];
    });
}); };
exports.getKeyRoute = getKeyRoute;
var getApiKeyId = function (apiKey) { return __awaiter(void 0, void 0, void 0, function () {
    var command;
    return __generator(this, function (_a) {
        command = new client_api_gateway_1.GetApiKeyCommand({ apiKey: apiKey });
        return [2 /*return*/, new Promise(function (resolve, reject) { })];
    });
}); };
exports.getApiKeyId = getApiKeyId;
//# sourceMappingURL=ApiGatewayCryptoPayment.js.map