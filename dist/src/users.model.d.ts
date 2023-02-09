export declare class Users {
    constructor();
    init: () => Promise<void>;
    insert: (data: any) => Promise<any>;
    findById: (id: string) => Promise<any>;
    findByApiKey: (apiKey: string) => Promise<any>;
    getByEmail: (email: string) => Promise<any>;
    findByEmail: (email: string) => Promise<any>;
    list: (accountId: string, query: any) => Promise<any>;
    removeById: (id: string) => Promise<any>;
}
export default Users;
