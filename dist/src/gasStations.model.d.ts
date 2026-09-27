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
    insert: (gasStation: any, projectId: String) => Promise<any>;
    /**
     * Whether a transfer keeps the project within its daily limit, in the project's
     * currency: the project's transfers of the last 24 hours in that currency, FAILED
     * ones excluded, plus this one, against parameters.gasStation.limitPer24H.
     * @param accountId - The project's account.
     * @param projectId - The project.
     * @param amount - The new transfer's amount.
     * @param currency - Its currency; all currencies when absent.
     * @returns Whether the transfer fits within the limit.
     * @throws When the transfers or the project cannot be read.
     */
    isGasStationAvailable: (accountId: string, projectId: string, amount: any, currency?: string) => Promise<boolean>;
    findById: (id: string) => Promise<any>;
    findPublicById: (id: string) => Promise<any>;
    scan: (params?: any, query?: any) => Promise<import("./utils/paginateModel").PaginatedResult<any>>;
    getById: (id: string) => Promise<any>;
    findByTxHash: (txHash: string) => Promise<any>;
    list: (accountId: string, projectId: string, query: any) => Promise<import("./utils/paginateModel").PaginatedResult<any>>;
    patchById: (id: string, data: any) => Promise<any>;
    findByBillingMonth: (billingMonth: string, query?: any) => Promise<import("./utils/paginateModel").PaginatedResult<any>>;
    reserveForTransfer: (id: string) => Promise<any>;
    removeById: (id: string) => Promise<any>;
}
export default GasStations;
