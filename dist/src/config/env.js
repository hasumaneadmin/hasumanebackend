import { registerAs } from "@nestjs/config";
function requireEnv(name, fallback) {
    const value = process.env[name] || fallback;
    if (!value) {
        throw new Error(`${name} is required.`);
    }
    return value;
}
function parseOrigins(value) {
    return value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
}
export default registerAs("app", () => ({
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT || 5000),
    corsOrigins: parseOrigins(requireEnv("CORS_ORIGIN", "http://localhost:5173")),
    jwt: {
        accessSecret: requireEnv("JWT_ACCESS_SECRET", "local-access-secret-change-me"),
        refreshSecret: requireEnv("JWT_REFRESH_SECRET", "local-refresh-secret-change-me"),
        accessTtl: process.env.JWT_ACCESS_TTL || "15m",
        refreshTtl: process.env.JWT_REFRESH_TTL || "7d",
    },
    redisUrl: process.env.REDIS_URL || "",
    csrfHeader: process.env.CSRF_HEADER || "x-csrf-token",
    passwordHashRounds: Number(process.env.PASSWORD_HASH_ROUNDS || 12),
}));
//# sourceMappingURL=env.js.map