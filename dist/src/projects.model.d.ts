export declare class Projects {
    constructor();
    init: () => Promise<void>;
    insert: (data: any) => Promise<any>;
    findById: (id: string) => Promise<any>;
    findPublicById: (id: string) => Promise<any>;
    findByApiKey: (apiKey: string) => Promise<any>;
    getById: (id: string) => Promise<any>;
    list: (accountId: string, query: any) => Promise<any>;
    patchById: (id: string, data: any) => Promise<any>;
    removeById: (id: string) => Promise<any>;
    createApiKey: (obj: any) => Promise<void>;
}
export default Projects;
