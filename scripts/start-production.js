import cp from "child_process";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_TARGET = "http://127.0.0.1:5001";
const CRM_TARGET = "http://127.0.0.1:3001";
const DEFAULT_CORS_ORIGIN = "https://crm.hasumane.com";

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

const backendEnv = {
  ...process.env,
  PORT: "5001",
  CORS_ORIGIN: process.env.CORS_ORIGIN || DEFAULT_CORS_ORIGIN,
};

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
      BACKEND_API_URL: process.env.BACKEND_API_URL || API_TARGET,
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

  if (host.includes("api.hasumane.com") || isBackendApiPath) {
    target = API_TARGET;
  } else if (host.includes("crm.hasumane.com")) {
    // If accessing the root path of the CRM subdomain, redirect to the admin panel
    if (requestPath === "/" || requestPath === "") {
      res.writeHead(302, { Location: "/admin" });
      res.end();
      return;
    }
    target = CRM_TARGET;
  }

  const targetPort = target === API_TARGET ? 5001 : 3001;

  const proxyReq = http.request(
    {
      host: "127.0.0.1",
      port: targetPort,
      path: req.url,
      method: req.method,
      headers: req.headers,
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
  console.log(`[Proxy] Routing crm.hasumane.com -> ${CRM_TARGET}`);
});
