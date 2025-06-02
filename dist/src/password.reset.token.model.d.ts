import { Table } from "dynamodb-onetable";
export declare class PasswordResetToken {
    table: Table;
    PasswordResetToken: any;
    secretsString: any;
    private constructor();
    static init: () => Promise<PasswordResetToken>;
    create: ({ userId, token, expiresAt, ip, userAgent, }: {
        userId: string;
        token: string;
        expiresAt: Date;
        ip?: string;
        userAgent?: string;
    }) => Promise<any>;
    findByToken: (token: string) => Promise<any>;
    markUsed: (token: string) => Promise<any>;
    deleteExpired: (now?: Date) => Promise<any[]>;
}
export default PasswordResetToken;
