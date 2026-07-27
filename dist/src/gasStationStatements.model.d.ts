import { Table } from "dynamodb-onetable";
export declare class GasStationStatements {
    Crypto: any;
    table: Table;
    Project: any;
    Account: any;
    GasStationStatement: any;
    secretsString: any;
    private constructor();
    static init: () => Promise<GasStationStatements>;
    insert: (data: any) => Promise<any>;
    findById: (id: string) => Promise<any>;
    findByProjectAndMonth: (projectId: string, month: string) => Promise<any>;
    listByProject: (projectId: string, query?: any) => Promise<import("./utils/paginateModel").PaginatedResult<any>>;
    listByMonth: (month: string, query?: any) => Promise<import("./utils/paginateModel").PaginatedResult<any>>;
    deleteById: (id: string) => Promise<any>;
    patchById: (id: string, data: any) => Promise<any>;
}
export default GasStationStatements;
