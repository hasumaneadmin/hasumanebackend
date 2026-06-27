/**
 * frontend-server-shim.js
 *
 * Adapts the prebuilt TanStack Start / Nitro server bundle at
 * frontend/dist/server/server.js to run as a plain Node.js HTTP server.
 */

import http from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || "3001", 10);
const HOST = process.env.HOST || "127.0.0.1";
const FRONTEND_DIR = process.env.FRONTEND_DIR
  ? process.env.FRONTEND_DIR
  : path.resolve(__dirname, "../frontend");

const serverEntryPath = path.resolve(FRONTEND_DIR, "dist/server/server.js");
const clientDir = path.resolve(FRONTEND_DIR, "dist/client");
const serverEntryUrl = new URL(`file:///${serverEntryPath.replace(/\\/g, "/")}`).href;
const browseEffectCss = "/assets/hasumane-browse-effect.css";
const browseEffectJs = "/assets/hasumane-browse-effect.js";
const arvaPreloaderBoot = `<script>document.documentElement.classList.add("hasu-arva-preloader");</script>`;
const arvaLoaderMarkup = `<div class="loader hasu-arva-loader" aria-hidden="true"><div class="hasu-arva-loader__mark"><div class="hasu-arva-loader__ring"></div><div class="hasu-arva-loader__leaf" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg></div><div class="hasu-arva-loader__name">HasuMane</div></div></div>`;
const browseEffectAssets = new Map([
  [
    browseEffectCss,
    {
      contentType: "text/css",
      path: path.resolve(__dirname, "hasumane-browse-effect.css"),
    },
  ],
  [
    browseEffectJs,
    {
      contentType: "application/javascript",
      path: path.resolve(__dirname, "hasumane-browse-effect.js"),
    },
  ],
]);
const mediaExtensions = new Set([".mp4", ".webm", ".mov", ".m4v"]);

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
  const contentType = webRes.headers.get("content-type") || "";
  const isHtml = contentType.includes("text/html");

  res.statusCode = webRes.status;
  webRes.headers.forEach((value, key) => {
    if (isHtml && key.toLowerCase() === "content-length") return;
    res.setHeader(key, value);
  });

  if (isHtml) {
    const html = await webRes.text();
    res.end(injectBrowseEffect(html));
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

function injectBrowseEffect(html) {
  const cleanedHtml = html.replace(
    /<meta\s+(?:name|property)=["'](?:twitter:image|og:image)["']\s+content=["']\/hero-cattle\.jpeg["']\s*\/?>/gi,
    "",
  );
  const optimizedHtml = cleanedHtml.replace(
    /<video\b(?=[^>]*\bclass=["'][^"']*\bhero-video\b)[^>]*>/gi,
    (tag) => tag
      .replace(/\s+preload=["']auto["']/i, ' preload="metadata"')
      .replace(/\s+fetchpriority=["']high["']/i, ""),
  );
  const headTags = [];
  if (!optimizedHtml.includes("hasu-arva-preloader")) {
    headTags.push(arvaPreloaderBoot);
  }
  if (!optimizedHtml.includes(browseEffectCss)) {
    headTags.push(`<link rel="stylesheet" href="${browseEffectCss}">`);
  }

  const withCss = optimizedHtml.includes("</head>")
    ? optimizedHtml.replace("</head>", `${headTags.join("")}</head>`)
    : `${headTags.join("")}${optimizedHtml}`;

  const withLoader = withCss.includes("hasu-arva-loader")
    ? withCss
    : withCss.replace(/<body([^>]*)>/i, `<body$1>${arvaLoaderMarkup}`);

  if (withLoader.includes(browseEffectJs)) {
    return withLoader;
  }

  return withLoader.includes("</body>")
    ? withLoader.replace("</body>", `<script defer src="${browseEffectJs}"></script></body>`)
    : `${withLoader}<script defer src="${browseEffectJs}"></script>`;
}

function getContentType(filePath) {
  if (filePath.endsWith(".js")) return "application/javascript";
  if (filePath.endsWith(".css")) return "text/css";
  if (filePath.endsWith(".html")) return "text/html";
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

function serveStaticFile(req, res, filePath, contentType, cacheControl = "public, max-age=31536000") {
  const stat = fs.statSync(filePath);
  const total = stat.size;
  const ext = path.extname(filePath).toLowerCase();
  const supportsRange = mediaExtensions.has(ext);
  const baseHeaders = {
    "Content-Type": contentType,
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

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" || req.method === "HEAD") {
      try {
        const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
        const browseAsset = browseEffectAssets.get(pathname);
        if (browseAsset) {
          serveStaticFile(req, res, browseAsset.path, browseAsset.contentType, "no-cache");
          return;
        }

        if (pathname !== "/") { // Let SSR handle the root document
          const filePath = path.join(clientDir, pathname);
          // Prevent directory traversal
          if (filePath.startsWith(clientDir)) {
            const stat = fs.statSync(filePath);
            if (stat.isFile()) {
              serveStaticFile(req, res, filePath, getContentType(filePath));
              return;
            }
          }
        }
      } catch (e) {
        // file not found or other error, fallback to SSR handler
      }
    }

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
