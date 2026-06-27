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

const clientDir = path.resolve(FRONTEND_DIR, "dist/client");
const indexHtmlPath = path.resolve(clientDir, "index.html");
const mediaExtensions = new Set([".mp4", ".webm", ".mov", ".m4v"]);
const buildTimeApiBaseUrl = "http://localhost:5000";
const publicApiBaseUrl = (process.env.PUBLIC_API_BASE_URL || "").replace(/\/$/, "");

console.log(`[Frontend Static] Serving client bundle: ${clientDir}`);

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

function serveFile(req, res, filePath, cacheControl) {
  const stat = fs.statSync(filePath);
  const total = stat.size;
  const ext = path.extname(filePath).toLowerCase();
  const supportsRange = mediaExtensions.has(ext);

  if (ext === ".js") {
    const source = fs.readFileSync(filePath, "utf8");
    const body = source.replaceAll(buildTimeApiBaseUrl, publicApiBaseUrl);
    const bodyBuffer = Buffer.from(body);

    res.writeHead(200, {
      "Content-Type": getContentType(filePath),
      "Cache-Control": "no-cache",
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
  const requestedPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const filePath = path.resolve(clientDir, `.${requestedPath}`);

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

const server = http.createServer((req, res) => {
  if (!["GET", "HEAD"].includes(req.method || "GET")) {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");
    return;
  }

  try {
    const pathname = new URL(req.url || "/", `http://${req.headers.host}`).pathname;
    const filePath = resolveClientFile(pathname);

    if (filePath) {
      const isIndex = filePath === indexHtmlPath;
      serveFile(req, res, filePath, isIndex ? "no-cache" : "public, max-age=31536000");
      return;
    }

    serveFile(req, res, indexHtmlPath, "no-cache");
  } catch (err) {
    console.error("[Frontend Static] Request error:", err.message);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[Frontend Static] Listening on http://${HOST}:${PORT}`);
});

server.on("error", (err) => {
  console.error("[Frontend Static] Server error:", err.message);
  process.exit(1);
});
