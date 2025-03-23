import { Table } from "dynamodb-onetable";
export declare class Conversions {
    Crypto: any;
    table: Table;
    User: any;
    Project: any;
    Account: any;
    Order: any;
    Payment: any;
    Kyt: any;
    Conversion: any;
    secretsString: any;
    private constructor();
    static init: () => Promise<Conversions>;
    insert: (accountId: string, data: any) => Promise<any>;
    findById: (id: string) => Promise<any>;
    findPublicById: (id: string) => Promise<any>;
    scan: (params?: any, query?: any) => Promise<import("./utils/paginateModel").PaginatedResult<any>>;
    getById: (id: string) => Promise<any>;
    getByOrderId: (orderId: string) => Promise<import("./utils/paginateModel").PaginatedResult<any>>;
    list: (accountId: string, query?: any) => Promise<import("./utils/paginateModel").PaginatedResult<any>>;
    patchById: (id: string, data: any) => Promise<any>;
    removeById: (id: string) => Promise<any>;
}
export default Conversions;
