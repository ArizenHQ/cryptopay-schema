import { Table } from "dynamodb-onetable";
export declare class GasStations {
    Crypto: any;
    table: Table;
    User: any;
    Project: any;
    Account: any;
    Order: any;
    GasStation: any;
    Payment: any;
    Kyt: any;
    secretsString: any;
    private constructor();
    static init: () => Promise<GasStations>;
    insert: (gasStation: any) => Promise<any>;
    isGasStationAvailable: <Boolean_1>(accountId: string, projectId: string, amount: Number) => Promise<boolean>;
    findById: (id: string) => Promise<any>;
    findPublicById: (id: string) => Promise<any>;
    scan: (params: any, query: any) => Promise<any>;
    getById: (id: string) => Promise<any>;
    list: (accountId: string, projectId: string, query: any) => Promise<any>;
    patchById: (id: string, data: any) => Promise<any>;
    removeById: (id: string) => Promise<any>;
}
export default GasStations;
