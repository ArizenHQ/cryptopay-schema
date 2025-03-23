type PaginateMethod = 'find' | 'scan';
export interface PaginatedResult<T = any> {
    items: T[];
    page?: number;
    limit?: number;
    next?: string;
    hasNextPage: boolean;
}
export declare function paginateModel(model: any, method: PaginateMethod, keyOrParams?: any, query?: any, options?: Record<string, any>): Promise<PaginatedResult>;
export {};
