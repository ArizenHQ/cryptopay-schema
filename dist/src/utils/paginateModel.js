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
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeCursor = encodeCursor;
exports.decodeCursor = decodeCursor;
exports.paginateModel = paginateModel;
function encodeCursor(cursor) {
    return Buffer.from(JSON.stringify(cursor)).toString('base64');
}
function decodeCursor(encoded) {
    return JSON.parse(Buffer.from(encoded, 'base64').toString('utf-8'));
}
function paginateModel(model_1, method_1) {
    return __awaiter(this, arguments, void 0, function (model, method, keyOrParams, query, options) {
        var _a, limit, _b, page, _c, next, _d, sort, reverse, _e, field, direction, finalOptions, result_1, result_2, nextToken, i, result, items;
        var _f;
        if (keyOrParams === void 0) { keyOrParams = {}; }
        if (query === void 0) { query = {}; }
        if (options === void 0) { options = {}; }
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _a = query.limit, limit = _a === void 0 ? null : _a, _b = query.page, page = _b === void 0 ? null : _b, _c = query.next, next = _c === void 0 ? null : _c, _d = query.sort, sort = _d === void 0 ? '' : _d;
                    reverse = false;
                    if (sort) {
                        _e = sort.split(' '), field = _e[0], direction = _e[1];
                        reverse = (direction === null || direction === void 0 ? void 0 : direction.toLowerCase()) === 'desc';
                    }
                    finalOptions = __assign(__assign(__assign({}, options), query), { limit: limit, reverse: reverse });
                    // Decode base64 if next token is provided
                    if (next && typeof next === 'string') {
                        try {
                            finalOptions.next = decodeCursor(next);
                        }
                        catch (err) {
                            throw new Error('Invalid pagination cursor');
                        }
                    }
                    if (!finalOptions.next) return [3 /*break*/, 2];
                    return [4 /*yield*/, model[method](keyOrParams, finalOptions)];
                case 1:
                    result_1 = _g.sent();
                    return [2 /*return*/, {
                            items: result_1,
                            limit: limit,
                            next: result_1.next ? encodeCursor(result_1.next) : undefined,
                            hasNextPage: !!result_1.next,
                        }];
                case 2:
                    if (!(typeof page === 'number' && typeof limit === 'number')) return [3 /*break*/, 7];
                    nextToken = null;
                    i = 0;
                    _g.label = 3;
                case 3:
                    if (!(i <= page)) return [3 /*break*/, 6];
                    return [4 /*yield*/, model[method](keyOrParams, __assign(__assign({}, finalOptions), { next: nextToken || undefined }))];
                case 4:
                    result_2 = _g.sent();
                    nextToken = result_2.next;
                    if (!nextToken && i < page) {
                        return [2 /*return*/, {
                                items: [],
                                page: page,
                                limit: limit,
                                hasNextPage: false,
                            }];
                    }
                    _g.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/, {
                        items: result_2,
                        page: page,
                        limit: limit,
                        next: result_2.next ? encodeCursor(result_2.next) : undefined,
                        hasNextPage: !!result_2.next,
                    }];
                case 7: return [4 /*yield*/, model[method](keyOrParams, finalOptions)];
                case 8:
                    result = _g.sent();
                    items = (_f = result.items) !== null && _f !== void 0 ? _f : result;
                    return [2 /*return*/, {
                            items: items,
                            hasNextPage: false,
                        }];
            }
        });
    });
}
//# sourceMappingURL=paginateModel.js.map