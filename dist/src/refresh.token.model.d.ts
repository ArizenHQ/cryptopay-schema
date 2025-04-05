import { Table } from "dynamodb-onetable";
export declare class RefreshToken {
    Crypto: any;
    table: Table;
    User: any;
    Project: any;
    Account: any;
    Order: any;
    Payment: any;
    Kyt: any;
    RefreshToken: any;
    secretsString: any;
    private constructor();
    static init: () => Promise<RefreshToken>;
    create: ({ userId, token, expiresAt, ip, userAgent, }: {
        userId: string;
        token: string;
        expiresAt: Date;
        ip?: string;
        userAgent?: string;
    }) => Promise<any>;
    findByToken: (token: string) => Promise<any>;
    revoke: (token: string, replacedByToken?: string) => Promise<any>;
    findValid: (userId: string, token: string) => Promise<any>;
    revokeAll: (userId: string) => Promise<any[]>;
    deleteExpired: (now?: Date) => Promise<any[]>;
}
export default RefreshToken;
