import { Table } from "dynamodb-onetable";
export declare class Users {
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
    static init: () => Promise<Users>;
    generateApiKey: () => string;
    insert: (data: any) => Promise<any>;
    findById: (id: string) => Promise<any>;
    findByApiKey: (apiKey: string) => Promise<any>;
    getByEmail: (email: string) => Promise<any>;
    findByEmail: (email: string) => Promise<any>;
    patchById: (id: string, data: any) => Promise<any>;
    updatePassword: (id: string, password: string) => Promise<any>;
    scan: (query?: any) => Promise<import("./utils/paginateModel").PaginatedResult<any>>;
    list: (accountId: string, query?: any) => Promise<import("./utils/paginateModel").PaginatedResult<any>>;
    listUsersForReseller: (resellerAccountId: string, query?: any) => Promise<import("./utils/paginateModel").PaginatedResult<any>>;
    removeById: (id: string) => Promise<any>;
}
export default Users;
