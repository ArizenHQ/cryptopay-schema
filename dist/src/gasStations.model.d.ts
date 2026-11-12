import { Table } from "dynamodb-onetable";
export declare const GAS_STATION_REF_TAKEN = "GasStationRefTakenError";
export declare class GasStations {
    Crypto: any;
    table: Table;
    User: any;
    Project: any;
    Account: any;
    Order: any;
    GasStation: any;
    GasStationLimit: any;
    GasStationRef: any;
    Payment: any;
    Kyt: any;
    secretsString: any;
    private constructor();
    static init: () => Promise<GasStations>;
    insert: (gasStation: any, projectId: String) => Promise<any>;
    private createWithinLimit;
    /**
     * Whether a transfer keeps the project within its daily limit, in the project's
     * currency: the project's transfers of the last 24 hours in that currency, FAILED
     * ones excluded, plus this one, against parameters.gasStation.limitPer24H.
     * @param accountId - The project's account.
     * @param projectId - The project.
     * @param amount - The new transfer's amount.
     * @param currency - Its currency; all currencies when absent.
     * @param recent - Transfers just created, counted when the index does not show them yet.
     * @returns Whether the transfer fits within the limit.
     * @throws When the transfers or the project cannot be read.
     */
    isGasStationAvailable: (accountId: string, projectId: string, amount: any, currency?: string, recent?: any[]) => Promise<boolean>;
    findById: (id: string) => Promise<any>;
    findPublicById: (id: string) => Promise<any>;
    scan: (params?: any, query?: any) => Promise<import("./utils/paginateModel").PaginatedResult<any>>;
    getById: (id: string) => Promise<any>;
    findByTransferId: (transferId: string) => Promise<any>;
    list: (accountId: string, projectId: string, query: any) => Promise<import("./utils/paginateModel").PaginatedResult<any>>;
    patchById: (id: string, data: any) => Promise<any>;
    findByBillingMonth: (billingMonth: string, query?: any) => Promise<import("./utils/paginateModel").PaginatedResult<any>>;
    reserveForTransfer: (id: string) => Promise<any>;
    recordSent: (id: string, { transferId, txHash }: {
        transferId: string;
        txHash?: string | null;
    }) => Promise<any>;
    removeById: (id: string) => Promise<void>;
}
export default GasStations;
