export declare class Orders {
    constructor();
    init: () => Promise<void>;
    insert: (accountId: string, data: any) => Promise<any>;
    findById: (id: string) => Promise<any>;
    findPublicById: (id: string) => Promise<any>;
    getById: (id: string) => Promise<any>;
    list: (accountId: string, query: any) => Promise<any>;
    patchById: (id: string, data: any) => Promise<any>;
    emoveById: (id: string) => Promise<any>;
}
export default Orders;
