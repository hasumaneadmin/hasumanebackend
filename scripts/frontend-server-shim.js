import fs from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number.parseInt(process.env.PORT || "3001", 10);
const HOST = process.env.HOST || "127.0.0.1";
const FRONTEND_DIR = process.env.FRONTEND_DIR
  ? path.resolve(process.env.FRONTEND_DIR)
  : path.resolve(__dirname, "../dist-frontend");

const serverEntryPath = path.resolve(FRONTEND_DIR, "dist/server/server.js");
const clientDir = path.resolve(FRONTEND_DIR, "dist/client");
const serverEntryUrl = new URL(`file:///${serverEntryPath.replace(/\\/g, "/")}`).href;
const mediaExtensions = new Set([".mp4", ".webm", ".mov", ".m4v"]);
const buildTimeApiBaseUrl = "http://localhost:5000";
const publicApiBaseUrl = (process.env.PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
const DEFAULT_ADMIN_PATH = process.env.CRM_DEFAULT_PATH || "/admin/super-admin";

console.log(`[Frontend SSR] Loading server entry: ${serverEntryPath}`);

let fetchHandler;

try {
  const mod = await import(serverEntryUrl);
  const entry = mod.default ?? mod;

  if (typeof entry?.fetch === "function") {
    fetchHandler = entry.fetch.bind(entry);
  } else if (typeof entry === "function") {
    fetchHandler = entry;
  } else {
    throw new Error("Unrecognized server entry format: expected { fetch } or a function.");
  }

  console.log("[Frontend SSR] Server entry loaded.");
} catch (err) {
  console.error("[Frontend SSR] Failed to load server entry:", err.message);
  process.exit(1);
}

function getContentType(filePath) {
  if (filePath.endsWith(".js")) return "application/javascript";
  if (filePath.endsWith(".css")) return "text/css";
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".jpeg") || filePath.endsWith(".jpg")) return "image/jpeg";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".mp4")) return "video/mp4";
  if (filePath.endsWith(".webm")) return "video/webm";
  if (filePath.endsWith(".json")) return "application/json";
  if (filePath.endsWith(".txt")) return "text/plain";
  if (filePath.endsWith(".xml")) return "application/xml";
  return "application/octet-stream";
}

function replaceBuildTimeApiBaseUrl(source) {
  return source.replaceAll(buildTimeApiBaseUrl, publicApiBaseUrl);
}

function serveFile(req, res, filePath, cacheControl) {
  const stat = fs.statSync(filePath);
  const total = stat.size;
  const ext = path.extname(filePath).toLowerCase();
  const supportsRange = mediaExtensions.has(ext);

  if (ext === ".js" || ext === ".html") {
    const source = fs.readFileSync(filePath, "utf8");
    const body = replaceBuildTimeApiBaseUrl(source);
    const bodyBuffer = Buffer.from(body);

    res.writeHead(200, {
      "Content-Type": getContentType(filePath),
      "Cache-Control": ext === ".js" ? "no-cache" : cacheControl,
      "Content-Length": bodyBuffer.length,
    });

    if (req.method === "HEAD") {
      res.end();
      return;
    }

    res.end(bodyBuffer);
    return;
  }

  const baseHeaders = {
    "Content-Type": getContentType(filePath),
    "Cache-Control": cacheControl,
    "Accept-Ranges": supportsRange ? "bytes" : "none",
  };

  if (supportsRange && req.headers.range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (!match) {
      res.writeHead(416, {
        ...baseHeaders,
        "Content-Range": `bytes */${total}`,
      });
      res.end();
      return;
    }

    let start = match[1] === "" ? 0 : Number(match[1]);
    let end = match[2] === "" ? total - 1 : Number(match[2]);

    if (match[1] === "" && match[2] !== "") {
      const suffixLength = Number(match[2]);
      start = Math.max(total - suffixLength, 0);
      end = total - 1;
    }

    if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= total) {
      res.writeHead(416, {
        ...baseHeaders,
        "Content-Range": `bytes */${total}`,
      });
      res.end();
      return;
    }

    end = Math.min(end, total - 1);
    const chunkSize = end - start + 1;
    res.writeHead(206, {
      ...baseHeaders,
      "Content-Length": chunkSize,
      "Content-Range": `bytes ${start}-${end}/${total}`,
    });

    if (req.method === "HEAD") {
      res.end();
      return;
    }

    fs.createReadStream(filePath, { start, end }).pipe(res);
    return;
  }

  res.writeHead(200, {
    ...baseHeaders,
    "Content-Length": total,
  });

  if (req.method === "HEAD") {
    res.end();
    return;
  }

  fs.createReadStream(filePath).pipe(res);
}

function resolveClientFile(urlPathname) {
  const decodedPath = decodeURIComponent(urlPathname);
  const filePath = path.resolve(clientDir, `.${decodedPath}`);

  if (!filePath.startsWith(`${clientDir}${path.sep}`) && filePath !== clientDir) {
    return null;
  }

  try {
    const stat = fs.statSync(filePath);
    return stat.isFile() ? filePath : null;
  } catch {
    return null;
  }
}

function getFrontendRedirect(req) {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";

  if (pathname === "/" || pathname === "/admin") {
    return `${DEFAULT_ADMIN_PATH}${url.search}`;
  }

  return null;
}

function toWebRequest(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => chunks.push(chunk));
    req.on("error", reject);
    req.on("end", () => {
      const body = Buffer.concat(chunks);
      const protocol = req.headers["x-forwarded-proto"] || (req.socket?.encrypted ? "https" : "http");
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
  });
}

async function writeWebResponse(webRes, res, method) {
  const contentType = webRes.headers.get("content-type") || "";
  const isText = contentType.includes("text/html") || contentType.includes("application/javascript");

  res.statusCode = webRes.status;
  webRes.headers.forEach((value, key) => {
    if (isText && key.toLowerCase() === "content-length") return;
    res.setHeader(key, value);
  });

  if (method === "HEAD") {
    res.end();
    return;
  }

  if (isText) {
    const body = replaceBuildTimeApiBaseUrl(await webRes.text());
    res.end(body);
    return;
  }

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
  if (!["GET", "HEAD"].includes(req.method || "GET")) {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");
    return;
  }

  try {
    const frontendRedirect = getFrontendRedirect(req);
    if (frontendRedirect) {
      res.writeHead(302, { Location: frontendRedirect });
      res.end();
      return;
    }

    const pathname = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`).pathname;
    const filePath = resolveClientFile(pathname);

    if (filePath) {
      const isHtml = path.extname(filePath).toLowerCase() === ".html";
      serveFile(req, res, filePath, isHtml ? "no-cache" : "public, max-age=31536000");
      return;
    }

    const webReq = await toWebRequest(req);
    const webRes = await fetchHandler(webReq, {}, {});
    await writeWebResponse(webRes, res, req.method || "GET");
  } catch (err) {
    console.error("[Frontend SSR] Request error:", err.message);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[Frontend SSR] Listening on http://${HOST}:${PORT}`);
});

server.on("error", (err) => {
  console.error("[Frontend SSR] Server error:", err.message);
  process.exit(1);
});
