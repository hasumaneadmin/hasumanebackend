declare const _default: (() => {
    nodeEnv: string;
    port: number;
    corsOrigins: string[];
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        accessTtl: string;
        refreshTtl: string;
    };
    redisUrl: string;
    csrfHeader: string;
    passwordHashRounds: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    nodeEnv: string;
    port: number;
    corsOrigins: string[];
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        accessTtl: string;
        refreshTtl: string;
    };
    redisUrl: string;
    csrfHeader: string;
    passwordHashRounds: number;
}>;
export default _default;
