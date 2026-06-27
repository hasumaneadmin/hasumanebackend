import cp from "child_process";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_TARGET_PORT = Number(process.env.API_TARGET_PORT || 5001);
const CRM_TARGET_PORT = Number(process.env.CRM_TARGET_PORT || 3001);
const DEFAULT_CORS_ORIGIN = "https://crm.hasumane.com";
const DEFAULT_ADMIN_PATH = process.env.CRM_DEFAULT_PATH || "/admin/super-admin";

console.log("Starting HasuMane API and CRM proxy...");

const backendMain = path.resolve(__dirname, "../dist/src/main.js");
const frontendDir = path.resolve(__dirname, "../dist-frontend");
const frontendServerShim = path.resolve(__dirname, "frontend-server-shim.js");

console.log(`- Backend path: ${backendMain}`);
console.log(`- Frontend bundle: ${frontendDir}`);

const backendProcess = cp.spawn("node", [backendMain], {
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: String(API_TARGET_PORT),
    CORS_ORIGIN: process.env.CORS_ORIGIN || DEFAULT_CORS_ORIGIN,
  },
});

const frontendProcess = cp.spawn("node", [frontendServerShim], {
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: String(CRM_TARGET_PORT),
    HOST: "127.0.0.1",
    FRONTEND_DIR: frontendDir,
  },
});

function killChildren() {
  console.log("Stopping HasuMane services...");
  backendProcess.kill("SIGTERM");
  frontendProcess.kill("SIGTERM");
  process.exit(0);
}

process.on("SIGINT", killChildren);
process.on("SIGTERM", killChildren);

function proxyTo(req, res, targetPort) {
  const proxyReq = http.request(
    {
      host: "127.0.0.1",
      port: targetPort,
      path: req.url,
      method: req.method,
      headers: req.headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    },
  );

  proxyReq.on("error", (err) => {
    console.error(`Proxy error routing to port ${targetPort}:`, err.message);
    res.writeHead(502, { "Content-Type": "text/plain" });
    res.end("Bad Gateway - target service is still booting or unavailable.");
  });

  req.pipe(proxyReq, { end: true });
}

function getFrontendRedirect(req) {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";

  if (pathname === "/" || pathname === "/admin") {
    return `${DEFAULT_ADMIN_PATH}${url.search}`;
  }

  return null;
}

const server = http.createServer((req, res) => {
  const host = req.headers.host || "";
  const isApiHost = host.includes("api.hasumane.com");
  const isApiPath = req.url?.startsWith("/api") || req.url?.startsWith("/docs");

  if (isApiHost || isApiPath) {
    proxyTo(req, res, API_TARGET_PORT);
    return;
  }

  const frontendRedirect = getFrontendRedirect(req);
  if (frontendRedirect) {
    res.writeHead(302, { Location: frontendRedirect });
    res.end();
    return;
  }

  proxyTo(req, res, CRM_TARGET_PORT);
});

const proxyPort = Number(process.env.PORT || process.env.PROXY_PORT || 3000);
server.listen(proxyPort, "0.0.0.0", () => {
  console.log(`[Proxy] Listening on http://0.0.0.0:${proxyPort}`);
  console.log(`[Proxy] api.hasumane.com and /api -> http://127.0.0.1:${API_TARGET_PORT}`);
  console.log(`[Proxy] crm.hasumane.com -> http://127.0.0.1:${CRM_TARGET_PORT}`);
});
