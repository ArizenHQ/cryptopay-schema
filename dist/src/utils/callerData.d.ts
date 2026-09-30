/**
 * A caller's data without the item's key attributes, and without `drop`.
 * @param data - fields given by the caller
 * @param drop - more fields the caller does not set (e.g. "id" where the model sets it)
 * @returns a new object; `data` is left untouched
 */
export declare const withoutKeys: (data: any, drop?: string[]) => {
    [k: string]: unknown;
};
