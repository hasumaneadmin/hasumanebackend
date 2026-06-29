/**
 * frontend-server-shim.js
 *
 * Adapts the prebuilt TanStack Start / Nitro server bundle at
 * frontend/dist/server/server.js to run as a plain Node.js HTTP server.
 */

import http from "http";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
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
const assetVersion = "20260629-pro-logo";
const faviconSvg = "/favicon.svg";
const faviconIco = "/favicon.ico";
const webManifest = "/site.webmanifest";
const faviconSvgHref = `${faviconSvg}?v=${assetVersion}`;
const webManifestHref = `${webManifest}?v=${assetVersion}`;
const heroVideo = "/hasumane-video.mp4";
const noCacheMetaTags = `<meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate"><meta http-equiv="Pragma" content="no-cache"><meta http-equiv="Expires" content="0">`;
const brandHeadTags = [
  `<link rel="icon" type="image/svg+xml" href="${faviconSvgHref}">`,
  `<link rel="shortcut icon" href="${faviconSvgHref}">`,
  `<link rel="manifest" href="${webManifestHref}">`,
  `<meta name="theme-color" content="#07503f">`,
  `<link rel="preload" as="video" href="${heroVideo}" type="video/mp4" fetchpriority="high">`,
].join("");
const openingLoaderMarkup = `<div class="hasu-opening-loader" role="status" aria-live="polite" aria-label="Loading HasuMane"><div class="hasu-opening-loader__content"><img class="hasu-opening-loader__mark" src="${faviconSvgHref}" alt="" aria-hidden="true"><div class="hasu-opening-loader__brand">HasuMane</div><div class="hasu-opening-loader__line" aria-hidden="true"><span></span></div></div></div>`;
const criticalVisibilityStyle = `<style id="hasu-critical-visibility">:root{--hasu-hero-fallback:#f1efdf;--hasu-logo-loader:url("${faviconSvgHref}")}.hero-kicker,.hero-title,.hero-cta,.hasu-arva-scroll{opacity:1!important;visibility:visible!important;transform:none!important}html,body{min-height:100%;background:#f1efdf}.hero-video{background:#f1efdf!important;visibility:visible!important;transition:opacity .24s ease}html:not(.hasu-video-ready) .hero-video{opacity:0!important}html.hasu-video-ready .hero-video{opacity:1!important}html:not(.hasu-video-ready) .hero-video+div,div:has(>.hero-video){background:#f1efdf!important}.hasu-opening-loader{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;background:#f1efdf;color:#07503f;transition:opacity .46s cubic-bezier(.215,.61,.355,1),visibility .46s cubic-bezier(.215,.61,.355,1);pointer-events:auto}.hasu-opening-loader__content{display:grid;justify-items:center;gap:14px;transform:translateY(-10px)}.hasu-opening-loader__mark{width:76px;height:76px;border-radius:18px;box-shadow:0 18px 38px rgba(7,80,63,.14);animation:hasu-opening-mark 1.35s cubic-bezier(.55,.05,.2,1) infinite}.hasu-opening-loader__brand{font-family:Georgia,"Times New Roman",serif;font-size:clamp(34px,5.6vw,62px);font-weight:500;letter-spacing:0;line-height:1;text-shadow:0 14px 34px rgba(7,80,63,.12)}.hasu-opening-loader__line{width:min(180px,42vw);height:3px;overflow:hidden;border-radius:999px;background:rgba(7,80,63,.14)}.hasu-opening-loader__line span{display:block;width:46%;height:100%;border-radius:inherit;background:#07503f;animation:hasu-opening-line 1.15s cubic-bezier(.65,.05,.36,1) infinite}html.hasu-opening-loaded .hasu-opening-loader{opacity:0;visibility:hidden;pointer-events:none}@keyframes hasu-opening-mark{0%,100%{transform:translateY(0);filter:drop-shadow(0 16px 28px rgba(7,80,63,.1))}50%{transform:translateY(-5px);filter:drop-shadow(0 22px 38px rgba(7,80,63,.18))}}@keyframes hasu-opening-line{0%{transform:translateX(-105%)}52%{transform:translateX(70%)}100%{transform:translateX(225%)}}</style>`;
const blankScreenGuard = `<script id="hasu-blank-screen-guard">(()=>{const show=(el)=>{el.style.opacity="1";el.style.visibility="visible";el.style.transform="none";};const reveal=()=>{document.documentElement.classList.remove("hasu-arva-preloader");document.documentElement.classList.add("hasu-arva-loaded");document.body?.classList.remove("preloader");document.querySelectorAll(".hasu-arva-loader").forEach((el)=>el.remove());document.querySelectorAll(".hero-kicker,.hero-title,.hero-cta,.hasu-arva-scroll").forEach(show);};const revealSections=()=>document.querySelectorAll(".scroll-fade-in,#products").forEach((el)=>{el.classList.add("scroll-fade-in-visible");show(el);});const recover=()=>{reveal();const visibleText=(document.body?.innerText||"").trim();const hasHero=!!document.querySelector(".hero-title");if((visibleText.length<80||!hasHero)&&!sessionStorage.getItem("hasu-render-retry")){sessionStorage.setItem("hasu-render-retry","1");const url=new URL(location.href);url.searchParams.set("renderRetry",Date.now().toString());location.replace(url.toString());}};window.addEventListener("pageshow",recover);document.addEventListener("DOMContentLoaded",recover,{once:true});setTimeout(recover,1200);setTimeout(()=>{recover();revealSections();},3500);})();</script>`;
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
  [
    faviconSvg,
    {
      contentType: "image/svg+xml",
      path: path.resolve(clientDir, "favicon.svg"),
    },
  ],
  [
    faviconIco,
    {
      contentType: "image/svg+xml",
      path: path.resolve(clientDir, "favicon.svg"),
    },
  ],
  [
    webManifest,
    {
      contentType: "application/manifest+json",
      path: path.resolve(clientDir, "site.webmanifest"),
    },
  ],
]);
const mediaExtensions = new Set([".mp4", ".webm", ".mov", ".m4v"]);
const previewProducts = [
  {
    id: "preview-milk-01",
    code: "MILK-01",
    name: "Milk",
    productType: "milk",
    unit: "litre",
    price: 60,
    compareAtPrice: null,
    taxPercent: 0,
    defaultQuantity: 1,
    defaultSchedule: "daily",
    description: "Fresh farm milk delivered chilled and ready for daily use.",
    tags: ["fresh", "daily", "milk"],
    isActive: true,
    active: true,
    sortOrder: 0,
  },
  {
    id: "preview-curd-02",
    code: "CURD-02",
    name: "Curd",
    productType: "curd",
    unit: "litre",
    price: 35,
    compareAtPrice: null,
    taxPercent: 0,
    defaultQuantity: 1,
    defaultSchedule: "daily",
    description: "Thick set curd made from our fresh milk batches.",
    tags: ["curd", "fresh", "daily"],
    isActive: true,
    active: true,
    sortOrder: 1,
  },
  {
    id: "preview-butter-03",
    code: "BUTTER-03",
    name: "Butter",
    productType: "butter",
    unit: "gram",
    price: 120,
    compareAtPrice: 135,
    taxPercent: 0,
    defaultQuantity: 1,
    defaultSchedule: "weekly",
    description: "Small-batch churned butter with a rich traditional finish.",
    tags: ["butter", "spread", "dairy"],
    isActive: true,
    active: true,
    sortOrder: 2,
  },
  {
    id: "preview-ghee-05",
    code: "GHEE-05",
    name: "Ghee",
    productType: "ghee",
    unit: "kg",
    price: 260,
    compareAtPrice: 285,
    taxPercent: 0,
    defaultQuantity: 1,
    defaultSchedule: "monthly",
    description: "Slow-cooked ghee with a clean aroma and rich color.",
    tags: ["ghee", "traditional", "premium"],
    isActive: true,
    active: true,
    sortOrder: 3,
  },
  {
    id: "preview-paneer-04",
    code: "PANEER-04",
    name: "Paneer",
    productType: "paneer",
    unit: "gram",
    price: 180,
    compareAtPrice: 195,
    taxPercent: 0,
    defaultQuantity: 1,
    defaultSchedule: "weekly",
    description: "Soft fresh paneer for home cooking and everyday meals.",
    tags: ["paneer", "protein", "fresh"],
    isActive: true,
    active: true,
    sortOrder: 4,
  },
  {
    id: "preview-cheese-06",
    code: "CHEESE-06",
    name: "Cheese",
    productType: "cheese",
    unit: "gram",
    price: 220,
    compareAtPrice: 245,
    taxPercent: 0,
    defaultQuantity: 1,
    defaultSchedule: "weekly",
    description: "Fresh mild cheese for cooking, slicing, and family meals.",
    tags: ["cheese", "fresh", "dairy"],
    isActive: true,
    active: true,
    sortOrder: 5,
  },
];

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
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
  }

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
    optimizeHeroVideoTag,
  );
  const headTags = [];
  if (!optimizedHtml.includes('http-equiv="Cache-Control"')) {
    headTags.push(noCacheMetaTags);
  }
  if (!/<link\s+[^>]*rel=["'][^"']*\bicon\b/i.test(optimizedHtml)) {
    headTags.push(brandHeadTags);
  }
  if (!optimizedHtml.includes(browseEffectCss)) {
    headTags.push(`<link rel="stylesheet" href="${browseEffectCss}">`);
  }
  if (!optimizedHtml.includes("hasu-critical-visibility")) {
    headTags.push(criticalVisibilityStyle);
  }
  if (!optimizedHtml.includes("hasu-blank-screen-guard")) {
    headTags.push(blankScreenGuard);
  }

  const withCss = optimizedHtml.includes("</head>")
    ? optimizedHtml.replace("</head>", `${headTags.join("")}</head>`)
    : `${headTags.join("")}${optimizedHtml}`;

  let withLoader = withCss;
  if (!/<div\s+class=["']hasu-opening-loader\b/i.test(withLoader)) {
    withLoader = /<body\b[^>]*>/i.test(withLoader)
      ? withLoader.replace(/<body\b([^>]*)>/i, `<body$1>${openingLoaderMarkup}`)
      : `${openingLoaderMarkup}${withLoader}`;
  }

  if (withLoader.includes(browseEffectJs)) {
    return withLoader;
  }

  return withLoader.includes("</body>")
    ? withLoader.replace("</body>", `<script defer src="${browseEffectJs}"></script></body>`)
    : `${withLoader}<script defer src="${browseEffectJs}"></script>`;
}

function optimizeHeroVideoTag(tag) {
  let nextTag = tag.replace(/\s+poster=["'][^"']*["']/i, "");
  if (/\s+preload=["'][^"']*["']/i.test(nextTag)) {
    nextTag = nextTag.replace(/\s+preload=["'][^"']*["']/i, ' preload="auto"');
  } else {
    nextTag = nextTag.replace(/<video\b/i, '<video preload="auto"');
  }
  if (/\s+fetchpriority=["'][^"']*["']/i.test(nextTag)) {
    nextTag = nextTag.replace(/\s+fetchpriority=["'][^"']*["']/i, ' fetchpriority="high"');
  } else {
    nextTag = nextTag.replace(/<video\b/i, '<video fetchpriority="high"');
  }
  if (!/\s+playsinline(?:=|\s|>)/i.test(nextTag)) {
    nextTag = nextTag.replace(/<video\b/i, "<video playsinline");
  }
  return nextTag;
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

function writeJsonResponse(req, res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body),
  });

  if (req.method === "HEAD") {
    res.end();
    return;
  }

  res.end(body);
}

function readRequestJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = requestUrl.pathname;

    if (
      (req.method === "GET" || req.method === "HEAD") &&
      (pathname === "/api/v1/products" || pathname === "/api/products")
    ) {
      writeJsonResponse(req, res, 200, {
        success: true,
        message: "Products fetched.",
        data: previewProducts,
        products: previewProducts,
        meta: {
          page: 1,
          limit: previewProducts.length,
          total: previewProducts.length,
          totalPages: 1,
        },
      });
      return;
    }

    if (
      req.method === "POST" &&
      (pathname === "/api/leads" || pathname === "/api/v1/leads" || pathname === "/api/v1/subscriptions/public")
    ) {
      const payload = await readRequestJson(req);
      writeJsonResponse(req, res, 201, {
        success: true,
        message: "Thanks. We received your request. Our team will confirm the details on WhatsApp.",
        lead: {
          id: `preview-${randomUUID()}`,
          ...payload,
          status: "new",
          submittedAt: new Date().toISOString(),
        },
      });
      return;
    }

    if (req.method === "GET" || req.method === "HEAD") {
      try {
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
