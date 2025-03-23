type PaginateMethod = 'find' | 'scan';
export interface PaginatedResult<T = any> {
    items: T[];
    page?: number;
    limit?: number;
    next?: string;
    hasNextPage: boolean;
}
declare function encodeCursor(cursor: any): string;
declare function decodeCursor(encoded: string): any;
export { encodeCursor, decodeCursor };
export declare function paginateModel(model: any, method: PaginateMethod, keyOrParams?: any, query?: any, options?: Record<string, any>): Promise<PaginatedResult>;
