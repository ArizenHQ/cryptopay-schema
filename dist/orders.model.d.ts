export declare class Orders {
    constructor();
    init: () => Promise<void>;
    insert: (accountId: any, data: any) => Promise<any>;
    findById: (id: any) => Promise<any>;
    findPublicById: (id: any) => Promise<any>;
    getById: (id: any) => Promise<any>;
    list: (accountId: any, query: any) => Promise<any>;
    patchById: (id: any, data: any) => Promise<any>;
    emoveById: (id: any) => Promise<any>;
}
export default Orders;
