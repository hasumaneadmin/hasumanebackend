/**
 * frontend-server-shim.js
 *
 * Adapts the prebuilt TanStack Start / Nitro server bundle at
 * frontend/dist/server/server.js to run as a plain Node.js HTTP server.
 */

import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || "3001", 10);
const HOST = process.env.HOST || "127.0.0.1";
const FRONTEND_DIR = process.env.FRONTEND_DIR
  ? process.env.FRONTEND_DIR
  : path.resolve(__dirname, "../frontend");

const serverEntryPath = path.resolve(FRONTEND_DIR, "dist/server/server.js");
const serverEntryUrl = new URL(`file:///${serverEntryPath.replace(/\\/g, "/")}`).href;

console.log(`[Frontend Shim] Loading server entry: ${serverEntryPath}`);

let fetchHandler;

try {
  const mod = await import(serverEntryUrl);
  const entry = mod.default ?? mod;

  if (typeof entry?.fetch === "function") {
    fetchHandler = entry.fetch.bind(entry);
    console.log("[Frontend Shim] Loaded Cloudflare Workers-style fetch handler.");
  } else if (typeof entry === "function") {
    fetchHandler = entry;
    console.log("[Frontend Shim] Loaded function-style fetch handler.");
  } else {
    throw new Error("Unrecognized server entry format: expected { fetch } or a function.");
  }
} catch (err) {
  console.error("[Frontend Shim] Failed to load server entry:", err.message);
  process.exit(1);
}

function toWebRequest(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const body = Buffer.concat(chunks);
      const protocol = req.socket?.encrypted ? "https" : "http";
      const host = req.headers.host || `localhost:${PORT}`;
      const url = `${protocol}://${host}${req.url}`;

      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (Array.isArray(value)) {
          value.forEach((item) => headers.append(key, item));
        } else if (value !== undefined) {
          headers.set(key, value);
        }
      }

      const init = {
        method: req.method || "GET",
        headers,
      };

      if (!["GET", "HEAD"].includes(req.method || "GET") && body.length > 0) {
        init.body = body;
      }

      try {
        resolve(new Request(url, init));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

async function writeWebResponse(webRes, res) {
  res.statusCode = webRes.status;
  webRes.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (webRes.body) {
    const reader = webRes.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  }

  res.end();
}

const server = http.createServer(async (req, res) => {
  try {
    const webReq = await toWebRequest(req);
    const webRes = await fetchHandler(webReq, {}, {});
    await writeWebResponse(webRes, res);
  } catch (err) {
    console.error("[Frontend Shim] Request error:", err.message);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[Frontend Shim] Listening on http://${HOST}:${PORT}`);
});

server.on("error", (err) => {
  console.error("[Frontend Shim] Server error:", err.message);
  process.exit(1);
});
