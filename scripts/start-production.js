import cp from "child_process";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_TARGET = "http://127.0.0.1:5001";
const CRM_TARGET = "http://127.0.0.1:3001";

console.log("Starting HasuMane services from backend package...");

const backendMain = path.resolve(__dirname, "../dist/src/main.js");
const frontendDir = path.resolve(__dirname, "../dist-frontend");

console.log(`- Backend path: ${backendMain}`);
console.log(`- Frontend path: ${frontendDir}`);

// Spawn NestJS Backend on port 5001
const backendProcess = cp.spawn(
  "node",
  [backendMain],
  {
    stdio: "inherit",
    env: { ...process.env, PORT: "5001" },
  }
);

// Spawn TanStack Start Frontend on port 3001
const isWin = process.platform === "win32";
const frontendProcess = cp.spawn(
  isWin ? "npm.cmd" : "npm",
  ["run", "start", "--", "--port", "3001", "--host", "0.0.0.0"],
  {
    cwd: frontendDir,
    stdio: "inherit",
    env: { ...process.env, PORT: "3001" },
    shell: isWin,
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
const proxyPort = process.env.PROXY_PORT || 3000;
server.listen(proxyPort, "0.0.0.0", () => {
  console.log(`[Proxy] Reverse proxy listening on http://0.0.0.0:${proxyPort}`);
  console.log(`[Proxy] Routing api.hasumane.com -> ${API_TARGET}`);
  console.log(`[Proxy] Routing crm.hasumane.com -> ${CRM_TARGET}`);
});
