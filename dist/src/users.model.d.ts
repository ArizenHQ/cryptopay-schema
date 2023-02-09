import { Table } from "dynamodb-onetable";
export declare class Users {
    Crypto: any;
    table: Table;
    User: any;
    Project: any;
    Account: any;
    Order: any;
    secretsString: any;
    private constructor();
    static init: () => Promise<Users>;
    insert: (data: any) => Promise<any>;
    findById: (id: string) => Promise<any>;
    findByApiKey: (apiKey: string) => Promise<any>;
    getByEmail: (email: string) => Promise<any>;
    findByEmail: (email: string) => Promise<any>;
    list: (accountId: string, query: any) => Promise<any>;
    removeById: (id: string) => Promise<any>;
}
export default Users;
