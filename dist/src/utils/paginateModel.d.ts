type PaginateMethod = 'find' | 'scan';
export declare function paginateModel(model: any, method: PaginateMethod, keyOrParams?: any, query?: any, options?: Record<string, any>): Promise<any>;
export {};
