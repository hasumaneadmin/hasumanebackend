import { r as Route$3, t as Route$4 } from "./admin._role-CGHLeiF-.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HeadContent, Link, Outlet, Scripts, createFileRoute, createRootRouteWithContext, createRouter, lazyRouteComponent, useLocation, useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { z } from "zod";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
//#region src/styles.css?url
var styles_default = "/assets/styles-Cop-99Gq.css";
//#endregion
//#region src/lib/lovable-error-reporting.ts
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
//#endregion
//#region src/routes/__root.tsx
function NotFoundComponent() {
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-6",
					children: /* @__PURE__ */ jsx(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	useEffect(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ jsx("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ jsx("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$2 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Hasumane" },
			{
				name: "description",
				content: "A farmer entrepreneurship and organic dairy initiative"
			},
			{
				name: "author",
				content: "Lovable"
			},
			{
				property: "og:title",
				content: "Hasumane"
			},
			{
				property: "og:description",
				content: "A farmer entrepreneurship and organic dairy initiative"
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary"
			},
			{
				name: "twitter:site",
				content: "@Lovable"
			},
			{
				name: "twitter:title",
				content: "Hasumane"
			},
			{
				name: "twitter:description",
				content: "A farmer entrepreneurship and organic dairy initiative"
			},
			{
				property: "og:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4a38885c-2e65-4a7c-8bd0-ce2ad95a408f/id-preview-3c5434af--ec1b7ee2-fc79-45c1-a0d7-8f22f15c3779.lovable.app-1781732528553.png"
			},
			{
				name: "twitter:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4a38885c-2e65-4a7c-8bd0-ce2ad95a408f/id-preview-3c5434af--ec1b7ee2-fc79-45c1-a0d7-8f22f15c3779.lovable.app-1781732528553.png"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "en",
		children: [/* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }), /* @__PURE__ */ jsxs("body", { children: [children, /* @__PURE__ */ jsx(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$2.useRouteContext();
	const location = useLocation();
	const isLoading = useRouterState({ select: (s) => s.status === "pending" });
	useEffect(() => {
		if (location.pathname !== "/") return;
		const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		let cleanupSmoothScroll;
		let cancelled = false;
		async function enableSmoothScroll() {
			if (prefersReducedMotion) return;
			const { default: Lenis } = await import("lenis");
			if (cancelled) return;
			const lenis = new Lenis({
				duration: 1.05,
				easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
				smoothWheel: true
			});
			let animationFrame = 0;
			function raf(time) {
				lenis.raf(time);
				animationFrame = requestAnimationFrame(raf);
			}
			animationFrame = requestAnimationFrame(raf);
			cleanupSmoothScroll = () => {
				if (animationFrame) cancelAnimationFrame(animationFrame);
				lenis.destroy();
			};
		}
		enableSmoothScroll();
		return () => {
			cancelled = true;
			cleanupSmoothScroll?.();
		};
	}, [location.pathname]);
	return /* @__PURE__ */ jsxs(QueryClientProvider, {
		client: queryClient,
		children: [isLoading && /* @__PURE__ */ jsx("div", {
			className: "fixed left-0 right-0 top-0 z-[9999] h-[3px] w-full bg-forest-ink/20",
			children: /* @__PURE__ */ jsx("div", {
				className: "h-full bg-vivid-lime",
				style: {
					width: "100%",
					transformOrigin: "left",
					animation: "loading-bar 1.5s infinite ease-in-out"
				}
			})
		}), /* @__PURE__ */ jsx(Outlet, {})]
	});
}
var hero_cattle_jpeg_asset_default = { url: "/grazing-cow.jpeg" };
//#endregion
//#region src/routes/index.tsx
var $$splitComponentImporter = () => import("./routes-kVlDGFXM.js");
var Route$1 = createFileRoute("/")({
	head: () => ({
		meta: [
			{ title: "HasuMane - The Cow's Home. From Our Fields to Your Home." },
			{
				name: "description",
				content: "HasuMane is a farmer entrepreneurship initiative producing chemical-free milk, curd, butter, and ghee - delivered fresh across Bengaluru."
			},
			{
				property: "og:title",
				content: "HasuMane - From Our Fields to Your Home"
			},
			{
				property: "og:description",
				content: "A farmer entrepreneurship initiative. Chemical-free dairy, restorative agriculture, fresh to your door."
			},
			{
				property: "og:image",
				content: hero_cattle_jpeg_asset_default.url
			},
			{
				name: "twitter:title",
				content: "HasuMane - The Cow's Home"
			},
			{
				name: "twitter:description",
				content: "Chemical-free dairy and farmer entrepreneurship from Krishnagiri to Bengaluru homes."
			},
			{
				name: "twitter:image",
				content: hero_cattle_jpeg_asset_default.url
			}
		],
		links: [{
			rel: "canonical",
			href: "https://hasumane.com/"
		}]
	}),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
//#region src/lib/leads.ts
var leadSubmissionSchema = z.object({
	name: z.string().trim().min(2, "Enter your name").max(80, "Name is too long"),
	phone: z.string().trim().min(7, "Enter a valid phone number").max(20, "Phone number is too long").regex(/^[+()\d\s-]+$/, "Use a valid phone number"),
	area: z.string().trim().min(2, "Enter your area or pincode").max(120, "Area is too long"),
	product: z.string().trim().min(1, "Choose a product").max(80, "Product is too long").default("milk"),
	requestType: z.enum(["subscription", "order"]).default("subscription"),
	quantity: z.coerce.number().min(0.1, "Enter a valid quantity"),
	plan: z.preprocess((val) => val || "daily", z.enum([
		"daily",
		"alternate",
		"custom"
	])),
	source: z.string().trim().min(2, "Source is too short").max(40, "Source is too long").default("website"),
	notes: z.string().trim().max(500, "Notes are too long").optional().default("")
});
//#endregion
//#region src/lib/leads.server.ts
function maskPhone(value) {
	return value.replace(/\d(?=\d{4})/g, "*");
}
function createLocalLeadRecord(data, request) {
	return {
		id: crypto.randomUUID(),
		submittedAt: (/* @__PURE__ */ new Date()).toISOString(),
		...data,
		userAgent: request.headers.get("user-agent"),
		referrer: request.headers.get("referer"),
		backendForwarded: false
	};
}
async function saveLeadLocally(record) {
	const dataDir = path.resolve(process.cwd(), ".data");
	const filePath = path.join(dataDir, "public-leads.ndjson");
	await mkdir(dataDir, { recursive: true });
	await appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
	return record;
}
async function saveLeadSubmission(data, request) {
	const logPayload = {
		name: data.name,
		phone: maskPhone(data.phone),
		area: data.area
	};
	console.info("New HasuMane lead submission", logPayload);
	const backendUrl = (process.env.BACKEND_API_URL || "http://localhost:5000").replace(/\/$/, "");
	try {
		const response = await fetch(`${backendUrl}/api/v1/leads`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: data.name,
				phone: data.phone,
				area: data.area,
				product: data.product,
				requestType: data.requestType,
				quantity: data.quantity,
				plan: data.plan,
				notes: data.notes,
				source: data.source || `website-${data.requestType}`,
				userAgent: request.headers.get("user-agent"),
				referrer: request.headers.get("referer")
			})
		});
		if (!response.ok) {
			const message = await response.text().catch(() => "");
			throw new Error(message || `Backend returned status ${response.status}.`);
		}
		const result = await response.json().catch(() => null);
		const lead = result?.data ?? result ?? {};
		return {
			id: lead.id ?? "",
			submittedAt: lead.submittedAt ?? (/* @__PURE__ */ new Date()).toISOString(),
			backendForwarded: true
		};
	} catch (error) {
		console.warn("Backend unavailable, storing lead locally:", error);
		return await saveLeadLocally(createLocalLeadRecord(data, request));
	}
}
//#endregion
//#region src/routes/api/leads.ts
function json(data, init) {
	return Response.json(data, {
		...init,
		headers: {
			"Cache-Control": "no-store",
			...init?.headers
		}
	});
}
async function readPayload(request) {
	if ((request.headers.get("content-type") ?? "").includes("application/json")) return request.json();
	const formData = await request.formData();
	return Object.fromEntries(formData);
}
var Route = createFileRoute("/api/leads")({ server: { handlers: {
	GET: async () => json({
		ok: true,
		service: "hasumane-leads"
	}),
	POST: async ({ request }) => {
		try {
			const payload = await readPayload(request);
			const parsed = leadSubmissionSchema.safeParse(payload);
			if (!parsed.success) {
				console.error("Frontend lead validation failed:", parsed.error.flatten().fieldErrors);
				return json({
					success: false,
					message: "Please check the form and try again.",
					errors: parsed.error.flatten().fieldErrors
				}, { status: 400 });
			}
			return json({
				success: true,
				message: "Thanks. We received your request and will contact you shortly.",
				lead: await saveLeadSubmission(parsed.data, request)
			}, { status: 201 });
		} catch (error) {
			console.error(error);
			return json({
				success: false,
				message: "We could not submit your request right now. Please try again."
			}, { status: 500 });
		}
	}
} } });
//#endregion
//#region src/routeTree.gen.ts
var AdminRoute = Route$3.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => Route$2
});
var IndexRoute = Route$1.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$2
});
var ApiLeadsRoute = Route.update({
	id: "/api/leads",
	path: "/api/leads",
	getParentRoute: () => Route$2
});
var AdminRouteChildren = { AdminRoleRoute: Route$4.update({
	id: "/$role",
	path: "/$role",
	getParentRoute: () => AdminRoute
}) };
var rootRouteChildren = {
	IndexRoute,
	AdminRoute: AdminRoute._addFileChildren(AdminRouteChildren),
	ApiLeadsRoute
};
var routeTree = Route$2._addFileChildren(rootRouteChildren)._addFileTypes();
//#endregion
//#region src/router.tsx
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
