import cp from "child_process";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const API_TARGET = "http://127.0.0.1:5000";
const CRM_TARGET = "http://127.0.0.1:3001";
const DEFAULT_CORS_ORIGIN = "http://localhost:3000,http://127.0.0.1:3000";

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
  NODE_ENV: "development",
  PORT: "5000",
  CORS_ORIGIN: process.env.CORS_ORIGIN || DEFAULT_CORS_ORIGIN,
};

// Spawn NestJS Backend on port 5000
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

  if (host.includes("api.hasumane.com")) {
    target = API_TARGET;
  } else if (host.includes("crm.hasumane.com")) {
    // If accessing the root path of the CRM subdomain, redirect to the admin panel
    if (req.url === "/" || req.url === "") {
      res.writeHead(302, { Location: "/admin" });
      res.end();
      return;
    }
    target = CRM_TARGET;
  }

  const targetPort = target === API_TARGET ? 5000 : 3001;

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

// Local preview proxy listens on 3000. Do not reuse PORT; the backend owns it.
const proxyPort = Number(process.env.PROXY_PORT || 3000);
server.listen(proxyPort, "0.0.0.0", () => {
  console.log(`[Proxy] Reverse proxy listening on http://0.0.0.0:${proxyPort}`);
  console.log(`[Proxy] Routing api.hasumane.com -> ${API_TARGET}`);
  console.log(`[Proxy] Routing crm.hasumane.com -> ${CRM_TARGET}`);
});



