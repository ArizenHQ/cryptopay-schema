import { Table } from "dynamodb-onetable";
import { PaginatedResult } from './utils/paginateModel';
export declare class Accounts {
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
    static init: () => Promise<Accounts>;
    insert: (data: any) => Promise<any>;
    findById: (id: string) => Promise<any>;
    getAccount: (id: string) => Promise<any>;
    getFullAccount: (id: string) => Promise<import("dynamodb-onetable/dist/mjs/Table").EntityGroup>;
    list: (query?: any) => Promise<PaginatedResult<any>>;
    scan: (query?: any) => Promise<PaginatedResult<any>>;
    patchById: (id: string, data: any) => Promise<any>;
    removeById: (id: string) => Promise<any>;
}
export default Accounts;
