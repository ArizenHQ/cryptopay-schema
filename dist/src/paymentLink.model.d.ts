import { Table } from "dynamodb-onetable";
export declare class PaymentLinks {
    Crypto: any;
    table: Table;
    User: any;
    Project: any;
    Account: any;
    Order: any;
    Payment: any;
    Kyt: any;
    PaymentLink: any;
    secretsString: any;
    private constructor();
    static init: () => Promise<PaymentLinks>;
    insert: (projectId: string, data: any, incrementCount: boolean) => Promise<any>;
    scan: (params?: any, query?: any) => Promise<import("./utils/paginateModel").PaginatedResult<any>>;
    getById: (id: string) => Promise<any>;
    findByOrderId: (orderId: string) => Promise<any>;
    list: (accountId: string, query?: any) => Promise<import("./utils/paginateModel").PaginatedResult<any>>;
    patchById: (id: string, data: any) => Promise<any>;
    removeById: (id: string) => Promise<any>;
}
export default PaymentLinks;
