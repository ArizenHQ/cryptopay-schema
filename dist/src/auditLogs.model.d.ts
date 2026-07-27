import { Table } from "dynamodb-onetable";
export declare class AuditLogs {
    table: Table;
    AuditLog: any;
    Crypto: any;
    secretsString: any;
    private constructor();
    static init: () => Promise<AuditLogs>;
    log: (params: {
        accountId: string;
        entityType: string;
        entityId: string;
        action: string;
        by?: object;
        meta?: object;
    }) => Promise<any>;
    findByEntity: (entityType: string, entityId: string, accountId: string, query?: any) => Promise<import("./utils/paginateModel").PaginatedResult<any>>;
    findByAccount: (accountId: string, query?: any) => Promise<import("./utils/paginateModel").PaginatedResult<any>>;
}
export default AuditLogs;
