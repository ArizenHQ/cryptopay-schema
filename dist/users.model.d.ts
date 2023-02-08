export declare class Users {
    constructor();
    init: () => Promise<void>;
    insert: (data: any) => Promise<any>;
    findById: (id: any) => Promise<any>;
    findByApiKey: (apiKey: any) => Promise<any>;
    getByEmail: (email: any) => Promise<any>;
    findByEmail: (email: any) => Promise<any>;
    list: (accountId: any, query: any) => Promise<any>;
    removeById: (id: any) => Promise<any>;
}
export default Users;
