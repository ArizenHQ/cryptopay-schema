"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withoutKeys = void 0;
// Attributes that bind an item to its account and place it in the table and its
// indexes. OneTable computes them from the item's own fields, and a value given in the
// data would win over that computation: they are never taken from a caller.
var KEY_ATTRIBUTE = /^(pk|sk|gs\d+pk|gs\d+sk|_type)$/;
/**
 * A caller's data without the item's key attributes, and without `drop`.
 * @param data - fields given by the caller
 * @param drop - more fields the caller does not set (e.g. "id" where the model sets it)
 * @returns a new object; `data` is left untouched
 */
var withoutKeys = function (data, drop) {
    if (drop === void 0) { drop = []; }
    return Object.fromEntries(Object.entries(data || {}).filter(function (_a) {
        var key = _a[0];
        return !KEY_ATTRIBUTE.test(key) && !drop.includes(key);
    }));
};
exports.withoutKeys = withoutKeys;
//# sourceMappingURL=callerData.js.map