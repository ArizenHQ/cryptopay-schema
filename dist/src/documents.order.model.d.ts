import { Table } from "dynamodb-onetable";
export declare class DocumentOrder {
    Crypto: any;
    table: Table;
    User: any;
    Project: any;
    Account: any;
    Order: any;
    Payment: any;
    Kyt: any;
    Conversion: any;
    DocumentOrder: any;
    secretsString: any;
    private constructor();
    static init: () => Promise<DocumentOrder>;
    insert: (accountId: string, orderId: string, data: any) => Promise<any>;
    findById: (id: string) => Promise<any>;
    findByOrderId: (orderId: string) => Promise<any>;
    scan: (params?: any, query?: any) => Promise<import("./utils/paginateModel").PaginatedResult<any>>;
    getById: (id: string) => Promise<any>;
    list: (accountId: string, query?: any) => Promise<import("./utils/paginateModel").PaginatedResult<any>>;
    patchById: (id: string, data: any) => Promise<any>;
    removeById: (id: string) => Promise<any>;
}
export default DocumentOrder;
