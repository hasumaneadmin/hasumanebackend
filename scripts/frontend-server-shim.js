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
const previewCategoryId = "preview-category-dairy-essentials";
const previewCategories = [
  {
    id: previewCategoryId,
    name: "Dairy Essentials",
    slug: "dairy-essentials",
    description: "Core fresh dairy products for daily consumption and pantry use.",
    imageUrl: null,
    isActive: true,
    sortOrder: 0,
    createdAt: "2026-06-29T00:00:00.000Z",
    updatedAt: "2026-06-29T00:00:00.000Z",
    deletedAt: null,
    createdBy: "preview-admin",
    updatedBy: "preview-admin",
  },
];
const previewUsers = [
  {
    id: "preview-admin",
    name: "HasuMane Admin",
    phone: "+910000000000",
    email: "admin@hasumane.local",
    role: "super_admin",
    isBlocked: false,
    createdAt: "2026-06-29T00:00:00.000Z",
    updatedAt: "2026-06-29T00:00:00.000Z",
    deletedAt: null,
  },
];
const previewAdminSession = {
  authenticated: true,
  accessToken: "preview-admin-access-token",
  csrfToken: "preview-admin-csrf-token",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  role: "super_admin",
};
let previewAdminProducts = previewProducts.map((product) => toAdminProduct(product));
let previewInventoryItems = previewAdminProducts.map((product) => toInventoryItem(product));
let previewLeads = [];

function toAdminProduct(product) {
  const now = new Date().toISOString();
  return {
    ...product,
    categoryId: product.categoryId ?? previewCategoryId,
    category: previewCategories[0],
    variants: product.variants ?? [],
    images: product.images ?? [],
    inventoryItems: product.inventoryItems ?? [],
    createdAt: product.createdAt ?? now,
    updatedAt: product.updatedAt ?? now,
    deletedAt: product.deletedAt ?? null,
    createdBy: product.createdBy ?? "preview-admin",
    updatedBy: product.updatedBy ?? "preview-admin",
  };
}

function toInventoryItem(product) {
  return {
    id: `preview-stock-${product.productType}`,
    productId: product.id,
    variantId: null,
    sku: product.code,
    product,
    variant: null,
    currentStock: product.unit === "litre" ? 120 : 80,
    reservedStock: 0,
    reorderLevel: product.unit === "litre" ? 20 : 10,
    unit: product.unit,
    warehouseName: "Preview cold room",
    status: "in_stock",
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    deletedAt: null,
  };
}

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

function normalizePreviewApiPath(pathname) {
  if (pathname.startsWith("/api/v1/")) return pathname.slice("/api/v1".length);
  if (pathname === "/api/v1") return "/";
  if (pathname.startsWith("/api/")) return pathname.slice("/api".length);
  if (pathname === "/api") return "/";
  return pathname;
}

function getPreviewPagination(requestUrl, total) {
  const page = Math.max(1, Number(requestUrl.searchParams.get("page") || "1") || 1);
  const limit = Math.min(200, Math.max(1, Number(requestUrl.searchParams.get("limit") || String(total || 20)) || 20));
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

function paginatePreview(items, requestUrl) {
  const search = (requestUrl.searchParams.get("search") || "").trim().toLowerCase();
  const filtered = search
    ? items.filter((item) => {
        const haystack = [item.name, item.code, item.productType, item.slug, item.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(search);
      })
    : items;
  const meta = getPreviewPagination(requestUrl, filtered.length);
  const start = (meta.page - 1) * meta.limit;
  return {
    items: filtered.slice(start, start + meta.limit),
    meta,
  };
}

function productListPayload(requestUrl) {
  const activeProducts = previewAdminProducts
    .filter((product) => product.deletedAt == null)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name));
  const { items, meta } = paginatePreview(activeProducts, requestUrl);
  return {
    success: true,
    message: "Products fetched.",
    data: items,
    products: items,
    meta,
  };
}

function categoryListPayload(requestUrl) {
  const { items, meta } = paginatePreview(previewCategories, requestUrl);
  return {
    success: true,
    message: "Categories fetched.",
    data: items,
    categories: items,
    meta,
  };
}

function inventoryPayload() {
  return {
    success: true,
    message: "Inventory fetched.",
    items: previewInventoryItems,
    data: previewInventoryItems,
  };
}

function previewSummaryPayload() {
  const activeProducts = previewAdminProducts.filter((product) => product.deletedAt == null && product.isActive);
  return {
    summary: {
      dashboard: {
        totalRevenue: 0,
        totalOrders: 0,
        activeProducts: activeProducts.length,
        inventoryAlerts: 0,
      },
      products: {
        total: previewAdminProducts.filter((product) => product.deletedAt == null).length,
        active: activeProducts.length,
        priced: activeProducts.filter((product) => product.price != null).length,
      },
      leads: {
        total: previewLeads.length,
        pending: previewLeads.filter((lead) => lead.status === "new").length,
      },
      subscriptions: {
        total: 0,
        byStatus: {
          pending: 0,
          active: 0,
          paused: 0,
          terminated: 0,
        },
      },
      orders: {
        total: 0,
        pending: 0,
      },
    },
  };
}

function createPreviewProduct(input) {
  const now = new Date().toISOString();
  const productType = String(input.productType || input.name || "product")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || `product-${Date.now()}`;
  const product = toAdminProduct({
    id: `preview-${productType}-${randomUUID()}`,
    code: String(input.code || productType.toUpperCase()).trim(),
    name: String(input.name || input.code || "New Product").trim(),
    productType,
    categoryId: input.categoryId || previewCategoryId,
    unit: input.unit || "unit",
    price: input.price ?? null,
    compareAtPrice: input.compareAtPrice ?? null,
    taxPercent: input.taxPercent ?? 0,
    defaultQuantity: input.defaultQuantity ?? 1,
    defaultSchedule: input.defaultSchedule || "daily",
    description: input.description || "",
    tags: Array.isArray(input.tags) ? input.tags : [],
    isActive: input.isActive ?? true,
    active: input.isActive ?? true,
    sortOrder: input.sortOrder ?? previewAdminProducts.length,
    createdAt: now,
    updatedAt: now,
  });
  previewAdminProducts = [...previewAdminProducts, product];
  previewInventoryItems = previewAdminProducts.map((item) => toInventoryItem(item));
  return product;
}

function updatePreviewProduct(id, input) {
  let updatedProduct = null;
  previewAdminProducts = previewAdminProducts.map((product) => {
    if (product.id !== id) return product;
    updatedProduct = toAdminProduct({
      ...product,
      ...input,
      id: product.id,
      code: input.code ?? product.code,
      productType: input.productType ?? product.productType,
      categoryId: input.categoryId ?? product.categoryId ?? previewCategoryId,
      active: input.isActive ?? product.isActive,
      updatedAt: new Date().toISOString(),
    });
    return updatedProduct;
  });
  if (!updatedProduct) return null;
  previewInventoryItems = previewAdminProducts
    .filter((product) => product.deletedAt == null)
    .map((product) => toInventoryItem(product));
  return updatedProduct;
}

function archivePreviewProduct(id) {
  return updatePreviewProduct(id, {
    isActive: false,
    active: false,
    deletedAt: new Date().toISOString(),
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = requestUrl.pathname;
    const apiPath = normalizePreviewApiPath(pathname);

    if (apiPath === "/admin/session") {
      if (req.method === "POST") {
        const payload = await readRequestJson(req);
        const expectedPassword = process.env.ADMIN_API_TOKEN || "sujan";
        if (payload.password && payload.password !== expectedPassword) {
          writeJsonResponse(req, res, 401, {
            message: "Invalid admin token.",
          });
          return;
        }
        writeJsonResponse(req, res, 200, previewAdminSession);
        return;
      }

      if (req.method === "GET" || req.method === "HEAD") {
        writeJsonResponse(req, res, 200, {
          authenticated: true,
          role: "super_admin",
        });
        return;
      }

      if (req.method === "DELETE") {
        writeJsonResponse(req, res, 200, {
          authenticated: false,
        });
        return;
      }
    }

    if (
      (req.method === "GET" || req.method === "HEAD") &&
      (apiPath === "/products" || apiPath === "/admin/products")
    ) {
      writeJsonResponse(req, res, 200, productListPayload(requestUrl));
      return;
    }

    if (apiPath === "/admin/products" && req.method === "POST") {
      const product = createPreviewProduct(await readRequestJson(req));
      writeJsonResponse(req, res, 201, {
        success: true,
        message: "Product created.",
        data: product,
        product,
      });
      return;
    }

    const adminProductMatch = /^\/admin\/products\/([^/]+)$/.exec(apiPath);
    if (adminProductMatch && (req.method === "PUT" || req.method === "PATCH")) {
      const product = updatePreviewProduct(adminProductMatch[1], await readRequestJson(req));
      if (!product) {
        writeJsonResponse(req, res, 404, { message: "Product not found." });
        return;
      }
      writeJsonResponse(req, res, 200, {
        success: true,
        message: "Product updated.",
        data: product,
        product,
      });
      return;
    }

    if (adminProductMatch && req.method === "DELETE") {
      const product = archivePreviewProduct(adminProductMatch[1]);
      if (!product) {
        writeJsonResponse(req, res, 404, { message: "Product not found." });
        return;
      }
      writeJsonResponse(req, res, 200, {
        success: true,
        message: "Product archived.",
        data: product,
        product,
      });
      return;
    }

    if ((req.method === "GET" || req.method === "HEAD") && apiPath === "/categories") {
      writeJsonResponse(req, res, 200, categoryListPayload(requestUrl));
      return;
    }

    if ((req.method === "GET" || req.method === "HEAD") && apiPath === "/admin/summary") {
      writeJsonResponse(req, res, 200, previewSummaryPayload());
      return;
    }

    if ((req.method === "GET" || req.method === "HEAD") && apiPath === "/users") {
      writeJsonResponse(req, res, 200, { users: previewUsers, data: previewUsers });
      return;
    }

    if ((req.method === "GET" || req.method === "HEAD") && apiPath === "/admin/leads") {
      writeJsonResponse(req, res, 200, { leads: previewLeads });
      return;
    }

    if ((req.method === "GET" || req.method === "HEAD") && apiPath === "/subscriptions") {
      writeJsonResponse(req, res, 200, { subscriptions: [] });
      return;
    }

    if ((req.method === "GET" || req.method === "HEAD") && (apiPath === "/dispatch/orders" || apiPath === "/admin/orders")) {
      writeJsonResponse(req, res, 200, { orders: [] });
      return;
    }

    if ((req.method === "GET" || req.method === "HEAD") && apiPath === "/farmers") {
      writeJsonResponse(req, res, 200, { farmers: [] });
      return;
    }

    if ((req.method === "GET" || req.method === "HEAD") && apiPath === "/procurement/logs") {
      writeJsonResponse(req, res, 200, { logs: [] });
      return;
    }

    if ((req.method === "GET" || req.method === "HEAD") && apiPath === "/notifications") {
      writeJsonResponse(req, res, 200, { notifications: [] });
      return;
    }

    if ((req.method === "GET" || req.method === "HEAD") && apiPath === "/inventory") {
      writeJsonResponse(req, res, 200, inventoryPayload());
      return;
    }

    if ((req.method === "GET" || req.method === "HEAD") && apiPath === "/security/audit-logs") {
      writeJsonResponse(req, res, 200, { auditLogs: [] });
      return;
    }

    if ((req.method === "GET" || req.method === "HEAD") && apiPath === "/security/login-history") {
      writeJsonResponse(req, res, 200, { logins: [] });
      return;
    }

    if ((req.method === "GET" || req.method === "HEAD") && apiPath === "/settings") {
      writeJsonResponse(req, res, 200, { settings: [] });
      return;
    }

    if ((req.method === "GET" || req.method === "HEAD") && apiPath === "/roles/permissions") {
      writeJsonResponse(req, res, 200, { permissions: [] });
      return;
    }

    if (
      req.method === "POST" &&
      (apiPath === "/leads" || apiPath === "/subscriptions/public")
    ) {
      const payload = await readRequestJson(req);
      const lead = {
        id: `preview-${randomUUID()}`,
        name: payload.name || "Preview Lead",
        phone: payload.phone || "",
        area: payload.area || "",
        productType: payload.productType || payload.product || "milk",
        quantity: payload.quantity || 1,
        scheduleType: payload.scheduleType || payload.plan || "daily",
        notes: payload.notes || "",
        source: payload.source || "website",
        status: "new",
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      previewLeads = [lead, ...previewLeads];
      writeJsonResponse(req, res, 201, {
        success: true,
        message: "Thanks. We received your request. Our team will confirm the details on WhatsApp.",
        lead,
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
