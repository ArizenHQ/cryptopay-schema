export declare class Accounts {
    constructor();
    insert: (data: any) => Promise<any>;
    findById: (id: string) => Promise<any>;
    getAccount: (id: string) => Promise<any>;
    getFullAccount: (id: string) => Promise<import("dynamodb-onetable/dist/mjs/Table").EntityGroup>;
    list: (query: any) => Promise<any>;
    patchById: (id: string, data: any) => Promise<any>;
    removeById: (id: string) => Promise<any>;
    init: () => Promise<void>;
}
export default Accounts;
