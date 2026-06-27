import cp from "child_process";
import crypto from "crypto";
import http from "http";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_TARGET = "http://127.0.0.1:5001";
const CRM_TARGET = "http://127.0.0.1:3001";
const PUBLIC_API_TARGET = process.env.PUBLIC_API_TARGET || "https://api.hasumane.com";
const WEBSITE_API_TARGET = process.env.WEBSITE_API_TARGET || PUBLIC_API_TARGET;
const DEFAULT_CORS_ORIGIN = "https://crm.hasumane.com";
const DEFAULT_ADMIN_API_TOKEN = "sujan";
const DEFAULT_SECRET_SEED = process.env.ADMIN_API_TOKEN || DEFAULT_ADMIN_API_TOKEN;
const DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRESQL_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_PRIVATE_URL ||
  process.env.NEON_DATABASE_URL;

function derivedSecret(name) {
  return crypto.createHash("sha256").update(`hasumane:${name}:${DEFAULT_SECRET_SEED}`).digest("hex");
}

console.log("Starting HasuMane services from backend package...");

const backendMain = path.resolve(__dirname, "../dist/src/main.js");
const frontendDir = path.resolve(__dirname, "../frontend");
const frontendServerJs = path.resolve(frontendDir, "dist/server/server.js");

console.log(`- Backend path: ${backendMain}`);
console.log(`- Frontend path: ${frontendDir}`);
console.log(`- Frontend server: ${frontendServerJs}`);
if (!process.env.CORS_ORIGIN) {
  console.log(`- CORS_ORIGIN not set; defaulting backend CORS to ${DEFAULT_CORS_ORIGIN}`);
}
if (!process.env.ADMIN_API_TOKEN) {
  console.log("- ADMIN_API_TOKEN not set; using the bundled CRM login token.");
}
if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET || !process.env.COOKIE_SECRET) {
  console.log("- Auth secrets not fully set; deriving runtime defaults for backend startup.");
}
if (!process.env.DATABASE_URL && DATABASE_URL) {
  console.log("- DATABASE_URL not set; using an available Postgres URL alias.");
}

const backendEnv = {
  ...process.env,
  PORT: "5001",
  ...(DATABASE_URL ? { DATABASE_URL } : {}),
  CORS_ORIGIN: process.env.CORS_ORIGIN || DEFAULT_CORS_ORIGIN,
  ADMIN_API_TOKEN: process.env.ADMIN_API_TOKEN || DEFAULT_ADMIN_API_TOKEN,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || derivedSecret("jwt-access"),
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || derivedSecret("jwt-refresh"),
  COOKIE_SECRET: process.env.COOKIE_SECRET || derivedSecret("cookie"),
};

function runMigrations() {
  const npx = process.platform === "win32" ? "npx.cmd" : "npx";
  console.log("- Running Prisma migrations before backend startup...");
  const result = cp.spawnSync(npx, ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    env: backendEnv,
  });
  if (result.status !== 0) {
    console.log("- Prisma migration failed; continuing backend startup.");
  }
}

runMigrations();

// Spawn NestJS Backend on port 5001
const backendProcess = cp.spawn(
  "node",
  [backendMain],
  {
    stdio: "inherit",
    env: backendEnv,
  }
);

// Spawn the SSR frontend shim on port 3001
const frontendProcess = cp.spawn(
  "node",
  [path.resolve(__dirname, "frontend-server-shim.js")],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      PORT: "3001",
      HOST: "127.0.0.1",
      FRONTEND_DIR: frontendDir,
      BACKEND_API_URL: process.env.BACKEND_API_URL || WEBSITE_API_TARGET,
    },
  }
);

function killChildren() {
  console.log("Stopping all services...");
  try {
    backendProcess.kill("SIGTERM");
  } catch (e) {}
  try {
    frontendProcess.kill("SIGTERM");
  } catch (e) {}
  process.exit(0);
}

process.on("SIGINT", killChildren);
process.on("SIGTERM", killChildren);

// Create the reverse proxy
const server = http.createServer((req, res) => {
  const host = req.headers.host || "";
  let target = CRM_TARGET;
  const requestPath = req.url || "/";
  const isBackendApiPath =
    requestPath.startsWith("/api/v1") ||
    requestPath.startsWith("/docs") ||
    requestPath.startsWith("/metrics");

  if (host.includes("api.hasumane.com")) {
    target = API_TARGET;
  } else if (isBackendApiPath) {
    target = WEBSITE_API_TARGET;
  } else if (host.includes("crm.hasumane.com")) {
    // If accessing the root path of the CRM subdomain, redirect to the admin panel
    if (requestPath === "/" || requestPath === "") {
      res.writeHead(302, { Location: "/admin" });
      res.end();
      return;
    }
    target = CRM_TARGET;
  }

  const targetUrl = new URL(target);
  const proxyClient = targetUrl.protocol === "https:" ? https : http;
  const headers = { ...req.headers };
  if (targetUrl.hostname !== "127.0.0.1") {
    headers.host = targetUrl.host;
  }

  const proxyReq = proxyClient.request(
    {
      hostname: targetUrl.hostname,
      port: targetUrl.port || (targetUrl.protocol === "https:" ? 443 : 80),
      path: req.url,
      method: req.method,
      headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    }
  );

  proxyReq.on("error", (err) => {
    console.error(`Proxy error routing to ${target}:`, err.message);
    res.writeHead(502, { "Content-Type": "text/plain" });
    res.end("Bad Gateway - Target service might still be booting up or offline.");
  });

  req.pipe(proxyReq, { end: true });
});

// Proxy listens on port 3000 (standard port for the main Dokploy service container)
const proxyPort = Number(process.env.PORT || process.env.PROXY_PORT || 3000);
server.listen(proxyPort, "0.0.0.0", () => {
  console.log(`[Proxy] Reverse proxy listening on http://0.0.0.0:${proxyPort}`);
  console.log(`[Proxy] Routing api.hasumane.com -> ${API_TARGET}`);
  console.log(`[Proxy] Routing public API paths -> ${WEBSITE_API_TARGET}`);
  console.log(`[Proxy] Routing crm.hasumane.com -> ${CRM_TARGET}`);
});
