import { Table } from "dynamodb-onetable";
export declare class Orders {
    Crypto: any;
    table: Table;
    User: any;
    Project: any;
    Account: any;
    Order: any;
    Payment: any;
    Kyt: any;
    secretsString: any;
    private constructor();
    static init: () => Promise<Orders>;
    insert: (accountId: string, order: any) => Promise<any>;
    findById: (id: string) => Promise<any>;
    findPublicById: (id: string) => Promise<any>;
    scan: (params?: any, query?: any) => Promise<any>;
    getById: (id: string) => Promise<any>;
    list: (accountId: string, query?: any) => Promise<any>;
    patchById: (id: string, data: any) => Promise<any>;
    removeById: (id: string) => Promise<any>;
}
export default Orders;
