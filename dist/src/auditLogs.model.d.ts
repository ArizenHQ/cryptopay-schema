import { Table } from "dynamodb-onetable";
export declare class AuditLogs {
    table: Table;
    AuditLog: any;
    Crypto: any;
    secretsString: any;
    private constructor();
    static init: () => Promise<AuditLogs>;
    /**
     * Writes one audit entry. A caller-chosen `id` makes the write idempotent: the entry
     * is created once, a second write with the same id fails its condition.
     * @param params.id - Optional entry id; a ULID by default.
     * @param params.at - Optional ISO time of the event; now by default.
     */
    log: (params: {
        id?: string;
        at?: string;
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
