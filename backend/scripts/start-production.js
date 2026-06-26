import cp from "child_process";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_TARGET = "http://127.0.0.1:5001";
const CRM_TARGET = "http://127.0.0.1:3001";
const SAFE_RETRY_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const RETRYABLE_ERROR_CODES = new Set(["ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "EHOSTUNREACH"]);

console.log("Starting HasuMane services from backend package...");

const backendMain = path.resolve(__dirname, "../dist/src/main.js");
const frontendDir = path.resolve(__dirname, "../dist-frontend");
const frontendServerJs = path.resolve(frontendDir, "dist/server/server.js");

console.log(`- Backend path: ${backendMain}`);
console.log(`- Frontend path: ${frontendDir}`);
console.log(`- Frontend server: ${frontendServerJs}`);

// Spawn NestJS Backend on port 5001
const backendProcess = cp.spawn(
  "node",
  [backendMain],
  {
    stdio: "inherit",
    env: { ...process.env, PORT: "5001" },
  }
);

backendProcess.on("error", (err) => {
  console.error("[Backend] Failed to start:", err.message);
});

// Spawn TanStack Start Frontend SSR server using the Nitro Cloudflare adapter
// wrapped by a Node.js http server shim
const frontendProcess = cp.spawn(
  "node",
  [path.resolve(__dirname, "frontend-server-shim.js")],
  {
    cwd: frontendDir,
    stdio: "inherit",
    env: {
      ...process.env,
      PORT: "3001",
      HOST: "127.0.0.1",
      FRONTEND_DIR: frontendDir,
    },
  }
);

frontendProcess.on("error", (err) => {
  console.error("[Frontend] Failed to start:", err.message);
});

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

function getTargetPort(host) {
  if (host.includes("api.hasumane.com")) {
    return 5001;
  }
  return 3001;
}

function isRetryableProxyError(err) {
  return Boolean(err && RETRYABLE_ERROR_CODES.has(err.code));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function proxyOnce(req, res, targetPort, body) {
  return new Promise((resolve, reject) => {
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
        proxyRes.on("end", resolve);
        proxyRes.on("error", reject);
      }
    );

    proxyReq.on("error", reject);
    if (body.length > 0) {
      proxyReq.end(body);
      return;
    }
    proxyReq.end();
  });
}

async function proxyWithRetry(req, res, targetPort, targetName) {
  const maxAttempts = SAFE_RETRY_METHODS.has(req.method || "GET") ? 10 : 1;
  let lastError;
  const body = await readRequestBody(req);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await proxyOnce(req, res, targetPort, body);
      return;
    } catch (err) {
      lastError = err;
      if (!isRetryableProxyError(err) || attempt === maxAttempts) {
        break;
      }

      const delayMs = Math.min(250 * attempt, 1000);
      console.warn(
        `Proxy target ${targetName} not ready yet (${err.code || err.message}); retrying in ${delayMs}ms [${attempt}/${maxAttempts}]`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  console.error(`Proxy error routing to ${targetName}:`, lastError?.message || "unknown error");
  if (!res.headersSent) {
    res.writeHead(502, { "Content-Type": "text/plain" });
  }
  if (!res.writableEnded) {
    res.end("Bad Gateway - Target service might still be booting up or offline.");
  }
}

// Create the reverse proxy
const server = http.createServer((req, res) => {
  const host = req.headers.host || "";
  const targetPort = getTargetPort(host);
  const targetName = targetPort === 5001 ? API_TARGET : CRM_TARGET;

  void proxyWithRetry(req, res, targetPort, targetName);
});

// Proxy listens on port 3000 (standard port for the main Dokploy service container)
const proxyPort = process.env.PORT || 3000;
server.listen(proxyPort, "0.0.0.0", () => {
  console.log(`[Proxy] Reverse proxy listening on http://0.0.0.0:${proxyPort}`);
  console.log(`[Proxy] Routing api.hasumane.com -> ${API_TARGET}`);
  console.log(`[Proxy] Routing crm.hasumane.com -> ${CRM_TARGET}`);
});
