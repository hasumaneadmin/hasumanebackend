import { registerAs } from "@nestjs/config";

function requireEnv(name: string, fallback?: string) {
  const value = process.env[name] || fallback;
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  if (process.env.NODE_ENV === "production" && fallback !== undefined && value === fallback) {
    throw new Error(`${name} must be set in production.`);
  }
  return value;
}

function requireNumber(name: string, fallback: number) {
  const rawValue = process.env[name];
  const value = Number(rawValue || fallback);
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a valid number.`);
  }
  return value;
}

function parseOrigins(value: string) {
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export default registerAs("app", () => ({
  nodeEnv: process.env.NODE_ENV || "development",
  port: requireNumber("PORT", 5000),
  databaseUrl: requireEnv("DATABASE_URL"),
  corsOrigins: parseOrigins(requireEnv("CORS_ORIGIN", "http://localhost:5173")),
  jwt: {
    accessSecret: requireEnv("JWT_ACCESS_SECRET", "local-access-secret-change-me"),
    refreshSecret: requireEnv("JWT_REFRESH_SECRET", "local-refresh-secret-change-me"),
    accessTtl: process.env.JWT_ACCESS_TTL || "15m",
    refreshTtl: process.env.JWT_REFRESH_TTL || "7d",
  },
  cookieSecret: requireEnv("COOKIE_SECRET", "local-cookie-secret-change-me"),
  adminApiToken: requireEnv("ADMIN_API_TOKEN", "sujan"),
  redisUrl: process.env.REDIS_URL || "",
  csrfHeader: process.env.CSRF_HEADER || "x-csrf-token",
  passwordHashRounds: Number(process.env.PASSWORD_HASH_ROUNDS || 12),
}));
