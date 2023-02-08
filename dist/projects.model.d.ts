export declare class Projects {
    constructor();
    init: () => Promise<void>;
    insert: (data: any) => Promise<any>;
    findById: (id: any) => Promise<any>;
    findPublicById: (id: any) => Promise<any>;
    findByApiKey: (apiKey: any) => Promise<any>;
    getById: (id: any) => Promise<any>;
    list: (accountId: any, query: any) => Promise<any>;
    patchById: (id: any, data: any) => Promise<any>;
    removeById: (id: any) => Promise<any>;
    createApiKey: (obj: any) => Promise<void>;
}
export default Projects;
