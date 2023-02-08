export declare class Accounts {
    constructor();
    insert: (data: any) => Promise<any>;
    findById: (id: any) => Promise<any>;
    getAccount: (id: any) => Promise<any>;
    getFullAccount: (id: any) => Promise<import("dynamodb-onetable/dist/mjs/Table").EntityGroup>;
    list: (query: any) => Promise<any>;
    patchById: (id: any, data: any) => Promise<any>;
    removeById: (id: any) => Promise<any>;
    init: () => Promise<void>;
}
export default Accounts;
