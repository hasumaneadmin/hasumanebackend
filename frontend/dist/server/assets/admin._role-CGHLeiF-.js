import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Area, AreaChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, BadgePercent, BarChart3, Bell, CalendarDays, Check, ChevronLeft, ChevronRight, CircleHelp, ClipboardList, CreditCard, Database, Eye, EyeOff, Headphones, Image, IndianRupee, KeyRound, Leaf, LogOut, Milk, PackageCheck, Pencil, Plus, RefreshCcw, Search, Send, Settings, Shield, ShieldCheck, ShoppingCart, Sprout, Store, Tags, Trash2, Truck, UserCog, UserPlus, Users, Warehouse, X } from "lucide-react";
//#region src/lib/admin-api.ts
var API_BASE_URL = "".replace(/\/$/, "");
var API_PATH_PREFIX = "/api/v1";
var ADMIN_CSRF_STORAGE_KEY = "hasumane-admin-csrf";
var ADMIN_ACCESS_STORAGE_KEY = "hasumane-admin-access-token";
function getAdminApiBaseUrl() {
	return API_BASE_URL;
}
function getStoredCsrfToken() {
	if (typeof window === "undefined") return "";
	return window.sessionStorage.getItem(ADMIN_CSRF_STORAGE_KEY) || "";
}
function setStoredCsrfToken(token) {
	if (typeof window === "undefined") return;
	if (token) window.sessionStorage.setItem(ADMIN_CSRF_STORAGE_KEY, token);
	else window.sessionStorage.removeItem(ADMIN_CSRF_STORAGE_KEY);
}
function getStoredAccessToken() {
	if (typeof window === "undefined") return "";
	return window.sessionStorage.getItem(ADMIN_ACCESS_STORAGE_KEY) || "";
}
function setStoredAccessToken(token) {
	if (typeof window === "undefined") return;
	if (token) window.sessionStorage.setItem(ADMIN_ACCESS_STORAGE_KEY, token);
	else window.sessionStorage.removeItem(ADMIN_ACCESS_STORAGE_KEY);
}
function getStoredAdminAccessToken() {
	return getStoredAccessToken();
}
async function parseResponse(response) {
	return (response.headers.get("content-type") || "").includes("application/json") ? response.json() : response.text();
}
function apiPath(path) {
	let normalized = path;
	if (normalized.startsWith("/api/v1/")) normalized = normalized.slice(7);
	else if (normalized.startsWith("/api/")) normalized = normalized.slice(4);
	return `${API_PATH_PREFIX}${normalized.startsWith("/") ? normalized : `/${normalized}`}`;
}
function isRecord(value) {
	return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function unwrapApiResponse(data) {
	if (isRecord(data) && "success" in data && "data" in data) return data.data;
	return data;
}
function isAuthErrorMessage(message) {
	return /unauthorized|invalid or expired access token|missing access token|invalid token/i.test(message);
}
function toArray(value, key) {
	if (Array.isArray(value)) return value;
	if (isRecord(value)) {
		if (key && Array.isArray(value[key])) return value[key];
		if (Array.isArray(value.data)) return value.data;
	}
	return [];
}
function normalizeRole(role) {
	return {
		super_admin: "super_admin",
		superadmin: "super_admin",
		admin: "admin",
		manager: "manager",
		support: "customer_support",
		customer_support: "customer_support",
		customer: "consumer",
		consumer: "consumer",
		delivery_partner: "rider",
		rider: "rider",
		farmer: "farmer",
		inventory_manager: "inventory_manager",
		delivery_manager: "delivery_manager"
	}[String(role || "").toLowerCase()] || "consumer";
}
function normalizeUser(user) {
	return {
		...user,
		role: normalizeRole(user.role)
	};
}
function normalizeSubscription(subscription) {
	return {
		...subscription,
		user: subscription.user ? normalizeUser(subscription.user) : subscription.user
	};
}
function normalizeRolePermission(permission) {
	return {
		...permission,
		role: normalizeRole(permission.role)
	};
}
async function request(path, init = {}) {
	const headers = new Headers(init.headers);
	if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
	let response;
	try {
		response = await fetch(`${API_BASE_URL}${apiPath(path)}`, {
			...init,
			headers,
			credentials: "include"
		});
	} catch {
		throw new Error(`Backend is not reachable at ${API_BASE_URL}. Start the backend and refresh.`);
	}
	const data = await parseResponse(response);
	if (!response.ok) {
		const message = isRecord(data) && "message" in data ? String(data.message) : isRecord(data) && "error" in data ? String(data.error) : `Request failed with status ${response.status}`;
		throw new Error(message);
	}
	return unwrapApiResponse(data);
}
async function adminRequest(token, path, init = {}) {
	const method = String(init.method || "GET").toUpperCase();
	const headers = new Headers(init.headers);
	const accessToken = token || getStoredAccessToken();
	if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
	if (![
		"GET",
		"HEAD",
		"OPTIONS"
	].includes(method)) {
		const csrfToken = getStoredCsrfToken();
		if (csrfToken) headers.set("x-csrf-token", csrfToken);
	}
	return request(path, {
		...init,
		headers
	});
}
async function optionalAdminRequest(token, path, fallback) {
	try {
		return await adminRequest(token, path);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		if (/route not found|not found|status 404/i.test(message)) return fallback;
		throw error;
	}
}
async function createAdminSession(password, role) {
	const session = await request("/api/admin/session", {
		method: "POST",
		body: JSON.stringify({
			password,
			role
		})
	});
	setStoredCsrfToken(session.csrfToken);
	setStoredAccessToken(session.accessToken);
	return session;
}
async function verifyAdminSession() {
	try {
		await adminRequest(getStoredAccessToken(), "/api/admin/session");
		return true;
	} catch {
		setStoredCsrfToken("");
		setStoredAccessToken("");
		return false;
	}
}
async function destroyAdminSession(token = getStoredAccessToken()) {
	try {
		await adminRequest(token, "/api/admin/session", { method: "DELETE" });
	} finally {
		setStoredCsrfToken("");
		setStoredAccessToken("");
	}
}
async function fetchAdminDashboard(token) {
	const [summary, users, leads, subscriptions, orders, farmers, procurementLogs, products, notifications] = await Promise.all([
		adminRequest(token, "/api/admin/summary"),
		adminRequest(token, "/api/users"),
		adminRequest(token, "/api/admin/leads"),
		adminRequest(token, "/api/subscriptions"),
		adminRequest(token, "/api/dispatch/orders"),
		adminRequest(token, "/api/farmers"),
		adminRequest(token, "/api/procurement/logs"),
		adminRequest(token, "/api/admin/products?limit=200"),
		adminRequest(token, "/api/notifications")
	]);
	const [commerceOrders, categories, auditLogs, loginHistory, settings, rolePermissions] = await Promise.all([
		optionalAdminRequest(token, "/api/admin/orders?limit=200", []),
		optionalAdminRequest(token, "/api/categories?limit=200", []),
		optionalAdminRequest(token, "/api/security/audit-logs?limit=80", { auditLogs: [] }),
		optionalAdminRequest(token, "/api/security/login-history?limit=80", { logins: [] }),
		optionalAdminRequest(token, "/api/settings?limit=200", { settings: [] }),
		optionalAdminRequest(token, "/api/roles/permissions?limit=500", { permissions: [] })
	]);
	return {
		summary: summary.summary,
		users: toArray(users, "users").map(normalizeUser),
		leads: leads.leads,
		subscriptions: subscriptions.subscriptions.map(normalizeSubscription),
		orders: orders.orders,
		commerceOrders: toArray(commerceOrders, "orders"),
		farmers: farmers.farmers.map(normalizeUser),
		procurementLogs: procurementLogs.logs,
		products: toArray(products, "products"),
		categories: toArray(categories, "categories"),
		notifications: notifications.notifications,
		auditLogs: auditLogs.auditLogs,
		loginHistory: loginHistory.logins,
		settings: settings.settings,
		rolePermissions: rolePermissions.permissions.map(normalizeRolePermission)
	};
}
function unwrapProduct(value) {
	if (isRecord(value) && "product" in value && isRecord(value.product)) return value.product;
	return value;
}
async function createProduct(token, payload) {
	return unwrapProduct(await adminRequest(token, "/api/admin/products", {
		method: "POST",
		body: JSON.stringify(payload)
	}));
}
async function updateProduct(token, productId, payload) {
	return unwrapProduct(await adminRequest(token, `/api/admin/products/${productId}`, {
		method: "PUT",
		body: JSON.stringify(payload)
	}));
}
async function deleteProduct(token, productId) {
	return unwrapProduct(await adminRequest(token, `/api/admin/products/${productId}`, { method: "DELETE" }));
}
async function captureLead(token, payload) {
	return adminRequest(token, "/api/leads", {
		method: "POST",
		body: JSON.stringify(payload)
	});
}
async function deleteLead(token, leadId) {
	return adminRequest(token, `/api/admin/leads/${leadId}`, { method: "DELETE" });
}
async function createCategory(token, payload) {
	return adminRequest(token, "/api/categories", {
		method: "POST",
		body: JSON.stringify(payload)
	});
}
async function updateCategory(token, categoryId, payload) {
	return adminRequest(token, `/api/categories/${categoryId}`, {
		method: "PUT",
		body: JSON.stringify(payload)
	});
}
async function deleteCategory(token, categoryId) {
	return adminRequest(token, `/api/categories/${categoryId}`, { method: "DELETE" });
}
async function fetchInventoryItems(token) {
	return (await adminRequest(token, "/api/v1/inventory")).items;
}
async function createInventoryItem(token, payload) {
	return adminRequest(token, "/api/v1/inventory", {
		method: "POST",
		body: JSON.stringify(payload)
	});
}
async function adjustInventoryItem(token, inventoryItemId, payload) {
	return adminRequest(token, `/api/v1/inventory/${inventoryItemId}/adjust`, {
		method: "PATCH",
		body: JSON.stringify(payload)
	});
}
async function deleteInventoryItem(token, inventoryItemId) {
	return adminRequest(token, `/api/v1/inventory/${inventoryItemId}`, { method: "DELETE" });
}
async function saveSetting(token, key, payload) {
	return adminRequest(token, `/api/settings/${encodeURIComponent(key)}`, {
		method: "PUT",
		body: JSON.stringify(payload)
	});
}
async function updateSubscriptionStatus(token, subscriptionId, status) {
	return adminRequest(token, `/api/subscriptions/${subscriptionId}/status`, {
		method: "PATCH",
		body: JSON.stringify({ status })
	});
}
async function deleteSubscription(token, subscriptionId) {
	return adminRequest(token, `/api/subscriptions/${subscriptionId}`, { method: "DELETE" });
}
async function runDispatch(token, date) {
	return adminRequest(token, "/api/dispatch/run", {
		method: "POST",
		body: JSON.stringify(date ? { date } : {})
	});
}
async function createFarmer(token, payload) {
	return adminRequest(token, "/api/farmers", {
		method: "POST",
		body: JSON.stringify(payload)
	});
}
async function createProcurementLog(token, payload) {
	return adminRequest(token, "/api/procurement/logs", {
		method: "POST",
		body: JSON.stringify(payload)
	});
}
async function markOrderDelivered(token, orderId) {
	return adminRequest(token, `/api/dispatch/orders/${orderId}/deliver`, {
		method: "PATCH",
		body: JSON.stringify({})
	});
}
async function updateCommerceOrderStatus(token, orderId, status) {
	return adminRequest(token, `/api/admin/orders/${orderId}/status`, {
		method: "PATCH",
		body: JSON.stringify({ status })
	});
}
async function retryNotification(token, notificationId) {
	return adminRequest(token, `/api/notification-center/${notificationId}/retry`, {
		method: "POST",
		body: JSON.stringify({})
	});
}
//#endregion
//#region src/routes/admin.tsx
var Route$1 = createFileRoute("/admin")({
	head: () => ({ meta: [
		{ title: "HasuMane Admin" },
		{
			name: "description",
			content: "HasuMane operations dashboard for leads, subscriptions, dispatch, and procurement."
		},
		{
			name: "robots",
			content: "noindex,nofollow,noarchive"
		}
	] }),
	component: AdminPage
});
var adminRoleLoginPages = [
	{
		slug: "super-admin",
		path: "/admin/super-admin",
		role: "super_admin",
		tabId: "superAdminPanel",
		title: "Super Admin",
		eyebrow: "Founder workspace",
		headline: "Control security, settings, users, and platform approvals.",
		description: "Use this protected entry point for full-platform oversight, audit review, API controls, and final business decisions.",
		features: [
			{
				label: "Access",
				value: "Full control"
			},
			{
				label: "Security",
				value: "Audit first"
			},
			{
				label: "Scope",
				value: "All modules"
			}
		]
	},
	{
		slug: "admin",
		path: "/admin/admin",
		role: "admin",
		tabId: "adminPanel",
		title: "Admin",
		eyebrow: "Operations workspace",
		headline: "Run products, orders, customers, campaigns, and notifications.",
		description: "Use this login for day-to-day operating teams that need broad business controls without security ownership.",
		features: [
			{
				label: "Access",
				value: "Operations"
			},
			{
				label: "Review",
				value: "Refunds"
			},
			{
				label: "Scope",
				value: "Commerce"
			}
		]
	},
	{
		slug: "manager",
		path: "/admin/manager",
		role: "manager",
		tabId: "managerPanel",
		title: "Manager",
		eyebrow: "Business workspace",
		headline: "Coordinate sales, fulfillment, reporting, and customer growth.",
		description: "Use this role page for managers who need dashboards, analytics, order oversight, and operational exports.",
		features: [
			{
				label: "Access",
				value: "Scoped"
			},
			{
				label: "Reports",
				value: "Exports"
			},
			{
				label: "Scope",
				value: "Growth"
			}
		]
	},
	{
		slug: "customer-support",
		path: "/admin/customer-support",
		role: "customer_support",
		tabId: "customerSupportPanel",
		title: "Customer Support",
		eyebrow: "Support workspace",
		headline: "Resolve customer issues, refunds, complaints, and order updates.",
		description: "Use this login for support teams handling customer history, tickets, conversations, and service exceptions.",
		features: [
			{
				label: "Access",
				value: "Support"
			},
			{
				label: "Privacy",
				value: "Masked"
			},
			{
				label: "Scope",
				value: "Customers"
			}
		]
	},
	{
		slug: "inventory-manager",
		path: "/admin/inventory-manager",
		role: "inventory_manager",
		tabId: "inventoryManagerPanel",
		title: "Inventory Manager",
		eyebrow: "Inventory workspace",
		headline: "Manage catalog, categories, stock, suppliers, and purchase records.",
		description: "Use this role page for inventory teams responsible for product readiness and stock movement discipline.",
		features: [
			{
				label: "Access",
				value: "Stock"
			},
			{
				label: "Alerts",
				value: "Low stock"
			},
			{
				label: "Scope",
				value: "Catalog"
			}
		]
	},
	{
		slug: "delivery-manager",
		path: "/admin/delivery-manager",
		role: "delivery_manager",
		tabId: "deliveryManagerPanel",
		title: "Delivery Manager",
		eyebrow: "Delivery workspace",
		headline: "Manage dispatch, partner readiness, tracking, and proof of delivery.",
		description: "Use this login for delivery leads coordinating riders, route exceptions, assignment, and performance.",
		features: [
			{
				label: "Access",
				value: "Dispatch"
			},
			{
				label: "Proof",
				value: "Required"
			},
			{
				label: "Scope",
				value: "Delivery"
			}
		]
	}
];
var rolePanelEntries = adminRoleLoginPages.map(({ tabId, role }) => ({
	tabId,
	role
}));
function getAdminRoleLoginPage(slug) {
	return adminRoleLoginPages.find((page) => page.slug === slug);
}
function getAdminRoleLoginPageByRole(role) {
	return adminRoleLoginPages.find((page) => page.role === role);
}
function getRolePanelTab(role) {
	return getAdminRoleLoginPageByRole(role)?.tabId || "overview";
}
var tabRegistry = {
	overview: {
		id: "overview",
		label: "Dashboard",
		icon: Activity,
		status: "live"
	},
	orders: {
		id: "orders",
		label: "Orders",
		icon: ShoppingCart,
		status: "live"
	},
	leads: {
		id: "leads",
		label: "Leads",
		icon: ClipboardList,
		status: "live"
	},
	subscriptions: {
		id: "subscriptions",
		label: "Subscriptions",
		icon: Milk,
		status: "live"
	},
	products: {
		id: "products",
		label: "Products",
		icon: PackageCheck,
		status: "live"
	},
	categories: {
		id: "categories",
		label: "Categories",
		icon: Tags,
		status: "live"
	},
	inventory: {
		id: "inventory",
		label: "Stock",
		icon: Warehouse,
		status: "live"
	},
	customers: {
		id: "customers",
		label: "Users",
		icon: Users,
		status: "live"
	},
	deliveryPartners: {
		id: "deliveryPartners",
		label: "Delivery Partners",
		icon: Truck,
		status: "planned"
	},
	coupons: {
		id: "coupons",
		label: "Coupons & Offers",
		icon: BadgePercent,
		status: "planned"
	},
	payments: {
		id: "payments",
		label: "Payments",
		icon: CreditCard,
		status: "planned"
	},
	analytics: {
		id: "analytics",
		label: "Reports",
		icon: BarChart3,
		status: "live"
	},
	support: {
		id: "support",
		label: "Support",
		icon: Headphones,
		status: "planned"
	},
	content: {
		id: "content",
		label: "Content",
		icon: Image,
		status: "planned"
	},
	dispatch: {
		id: "dispatch",
		label: "Dispatch",
		icon: Truck,
		status: "live"
	},
	procurement: {
		id: "procurement",
		label: "Procurement",
		icon: Sprout,
		status: "live"
	},
	notifications: {
		id: "notifications",
		label: "Notifications",
		icon: Bell,
		status: "live"
	},
	usersRoles: {
		id: "usersRoles",
		label: "Users & Roles",
		icon: UserCog,
		status: "planned"
	},
	architecture: {
		id: "architecture",
		label: "Insights",
		icon: Database,
		status: "live"
	},
	superAdminPanel: {
		id: "superAdminPanel",
		label: "Super Admin",
		icon: ShieldCheck,
		status: "live"
	},
	adminPanel: {
		id: "adminPanel",
		label: "Admin",
		icon: UserCog,
		status: "live"
	},
	managerPanel: {
		id: "managerPanel",
		label: "Manager",
		icon: BarChart3,
		status: "live"
	},
	customerSupportPanel: {
		id: "customerSupportPanel",
		label: "Customer Support",
		icon: Headphones,
		status: "live"
	},
	inventoryManagerPanel: {
		id: "inventoryManagerPanel",
		label: "Inventory Manager",
		icon: Warehouse,
		status: "live"
	},
	deliveryManagerPanel: {
		id: "deliveryManagerPanel",
		label: "Delivery Manager",
		icon: Truck,
		status: "live"
	},
	settings: {
		id: "settings",
		label: "Settings",
		icon: Settings,
		status: "live"
	},
	security: {
		id: "security",
		label: "Audit Logs",
		icon: Shield,
		status: "live"
	}
};
var navSections = [
	{
		title: "Dashboard",
		items: [tabRegistry.overview]
	},
	{
		title: "Customers",
		items: [tabRegistry.customers, tabRegistry.leads]
	},
	{
		title: "Sales",
		items: [tabRegistry.orders, tabRegistry.subscriptions]
	},
	{
		title: "Inventory",
		items: [
			tabRegistry.products,
			tabRegistry.categories,
			tabRegistry.inventory
		]
	},
	{
		title: "Operations",
		items: [tabRegistry.procurement, tabRegistry.notifications]
	},
	{
		title: "Analytics",
		items: [tabRegistry.analytics, tabRegistry.architecture]
	},
	{
		title: "System",
		items: [tabRegistry.security, tabRegistry.settings]
	}
];
var PIPELINE_COLORS = {
	pending: "#ad711f",
	active: "#07503f",
	paused: "#b2cee7",
	terminated: "#b42318"
};
var adminControlLabels = [
	"View",
	"Create",
	"Edit",
	"Delete",
	"Export"
];
var permissionControlFields = {
	View: "canView",
	Create: "canCreate",
	Edit: "canEdit",
	Delete: "canDelete",
	Export: "canExport"
};
var adminRoleBlueprints = [
	{
		role: "super_admin",
		title: "Super Admin",
		subtitle: "Owns platform configuration, security, billing, users, and final approvals.",
		owner: "Founder / Platform owner",
		risk: "Critical",
		icon: ShieldCheck,
		controls: [
			"View",
			"Create",
			"Edit",
			"Delete",
			"Export"
		],
		modules: [
			"Dashboard",
			"Orders",
			"Products",
			"Users & Roles",
			"Settings",
			"Security"
		],
		guardrails: [
			"Two-factor auth",
			"Audit every write",
			"API key approval"
		],
		dashboardWidgets: [
			"Revenue",
			"Orders",
			"Users",
			"Delivery status",
			"Inventory alerts",
			"Sales charts"
		],
		workflows: [
			"Admin role management",
			"Platform settings",
			"Security review",
			"Payment gateway controls",
			"Tax and shipping rules",
			"Audit log review"
		],
		dataTables: [
			"admins",
			"admin_roles",
			"admin_activity_logs",
			"roles",
			"permissions",
			"user_sessions",
			"app_settings",
			"api_keys"
		],
		apiScope: "Admin APIs 20+, Analytics APIs 10+, Settings and Security APIs",
		securityControls: [
			"JWT access token",
			"Refresh token",
			"Session management",
			"RBAC",
			"2FA for admins",
			"Rate limiting"
		]
	},
	{
		role: "admin",
		title: "Admin",
		subtitle: "Runs day-to-day business operations with broad but supervised access.",
		owner: "Operations admin",
		risk: "High",
		icon: UserCog,
		controls: [
			"View",
			"Create",
			"Edit",
			"Export"
		],
		modules: [
			"Orders",
			"Products",
			"Customers",
			"Coupons",
			"Payments",
			"Notifications"
		],
		guardrails: [
			"No API secrets",
			"Refund review",
			"Settings approval"
		],
		dashboardWidgets: [
			"Revenue",
			"Orders",
			"Users",
			"Delivery status",
			"Inventory alerts",
			"Sales charts"
		],
		workflows: [
			"CRUD products",
			"Order workflow",
			"Status updates",
			"Refund handling",
			"Coupon campaigns",
			"Banner publishing"
		],
		dataTables: [
			"products",
			"categories",
			"product_variants",
			"orders",
			"order_items",
			"payments",
			"refunds",
			"coupons",
			"banners"
		],
		apiScope: "Product APIs 20+, Order APIs 20+, Payment APIs 10+, Admin APIs 20+",
		securityControls: [
			"RBAC",
			"CSRF protection",
			"XSS protection",
			"SQL injection protection",
			"Password hashing"
		]
	},
	{
		role: "manager",
		title: "Manager",
		subtitle: "Coordinates sales, fulfillment, product performance, and reporting.",
		owner: "Business manager",
		risk: "Scoped",
		icon: BarChart3,
		controls: [
			"View",
			"Create",
			"Edit",
			"Export"
		],
		modules: [
			"Dashboard",
			"Orders",
			"Products",
			"Customers",
			"Analytics"
		],
		guardrails: [
			"No destructive deletes",
			"Export watermark",
			"Approval notes"
		],
		dashboardWidgets: [
			"Revenue",
			"Orders",
			"Users",
			"Delivery status",
			"Inventory alerts",
			"Sales charts"
		],
		workflows: [
			"Revenue reports",
			"Sales reports",
			"Product analytics",
			"Customer analytics",
			"Delivery analytics",
			"Campaign review"
		],
		dataTables: [
			"sales_reports",
			"page_views",
			"user_activity",
			"orders",
			"products",
			"coupon_usage",
			"delivery_assignments"
		],
		apiScope: "Analytics APIs 10+, Order APIs 20+, Product APIs 20+",
		securityControls: [
			"Scoped RBAC",
			"Export audit trail",
			"Session management",
			"Rate limiting",
			"Masked customer fields"
		]
	},
	{
		role: "customer_support",
		title: "Customer Support",
		subtitle: "Handles customers, support tickets, complaint resolution, and refunds.",
		owner: "Support lead",
		risk: "Scoped",
		icon: Headphones,
		controls: [
			"View",
			"Edit",
			"Export"
		],
		modules: [
			"Customers",
			"Orders",
			"Support",
			"Refund Requests",
			"Notifications"
		],
		guardrails: [
			"Masked phone exports",
			"Refund limit",
			"Conversation history"
		],
		dashboardWidgets: [
			"Open tickets",
			"Refund queue",
			"Blocked users",
			"Order exceptions",
			"Complaint aging",
			"Login history"
		],
		workflows: [
			"User details",
			"Block or unblock",
			"KYC verification",
			"Login history",
			"Ticket management",
			"Complaint handling"
		],
		dataTables: [
			"users",
			"addresses",
			"user_sessions",
			"tickets",
			"ticket_messages",
			"orders",
			"refunds",
			"notifications"
		],
		apiScope: "User APIs 15+, Order APIs 20+, Support APIs, Admin APIs 20+",
		securityControls: [
			"Masked PII",
			"Session management",
			"RBAC",
			"CSRF protection",
			"Audit customer changes"
		]
	},
	{
		role: "inventory_manager",
		title: "Inventory Manager",
		subtitle: "Controls stock, categories, suppliers, purchase records, and warehouses.",
		owner: "Inventory lead",
		risk: "Scoped",
		icon: Warehouse,
		controls: [
			"View",
			"Create",
			"Edit",
			"Export"
		],
		modules: [
			"Products",
			"Categories",
			"Inventory",
			"Suppliers",
			"Purchase Records"
		],
		guardrails: [
			"Stock adjustment reason",
			"Supplier review",
			"Low-stock alerts"
		],
		dashboardWidgets: [
			"Inventory alerts",
			"Stock movement",
			"Active products",
			"Out of stock",
			"Supplier status",
			"Purchase records"
		],
		workflows: [
			"CRUD products",
			"Categories",
			"Variants",
			"Inventory",
			"Inventory logs",
			"Supplier and warehouse management"
		],
		dataTables: [
			"products",
			"categories",
			"product_variants",
			"product_images",
			"inventory",
			"inventory_logs",
			"suppliers",
			"purchase_records"
		],
		apiScope: "Product APIs 20+, Inventory APIs, Admin APIs 20+",
		securityControls: [
			"Scoped RBAC",
			"Audit stock writes",
			"SQL injection protection",
			"CSRF protection",
			"Rate limiting"
		]
	},
	{
		role: "delivery_manager",
		title: "Delivery Manager",
		subtitle: "Manages dispatch, delivery partners, tracking, and delivery performance.",
		owner: "Delivery lead",
		risk: "Scoped",
		icon: Truck,
		controls: [
			"View",
			"Create",
			"Edit",
			"Export"
		],
		modules: [
			"Orders",
			"Dispatch",
			"Delivery Partners",
			"Live Tracking",
			"Delivery Reports"
		],
		guardrails: [
			"Rider verification",
			"Proof of delivery",
			"Route exception log"
		],
		dashboardWidgets: [
			"Delivery status",
			"Assigned riders",
			"Route exceptions",
			"Tracking logs",
			"Proof pending",
			"Delivery analytics"
		],
		workflows: [
			"Assign riders",
			"Track deliveries",
			"Delivery analytics",
			"Delivery zones",
			"Partner verification",
			"Proof of delivery"
		],
		dataTables: [
			"delivery_partners",
			"delivery_assignments",
			"tracking_logs",
			"delivery_zones",
			"orders",
			"order_status_history",
			"addresses"
		],
		apiScope: "Delivery APIs 15+, Order APIs 20+, Analytics APIs 10+",
		securityControls: [
			"Scoped RBAC",
			"Session management",
			"Rate limiting",
			"Audit assignment changes",
			"Proof capture controls"
		]
	}
];
var productionArchitectureLayers = [
	{
		title: "Frontend",
		detail: "Next.js / TanStack client workspace for customers, admin, support, and operations.",
		icon: Store,
		items: [
			"Customer storefront",
			"Role-based admin routes",
			"Protected session UI"
		]
	},
	{
		title: "Load Balancer",
		detail: "Routes browser traffic to the API cluster and keeps deployments replaceable.",
		icon: Activity,
		items: [
			"TLS termination",
			"Health checks",
			"Traffic routing"
		]
	},
	{
		title: "API Server",
		detail: "NestJS production target with domain modules for Auth, Orders, and Products.",
		icon: Database,
		items: [
			"Auth",
			"Orders",
			"Products",
			"Delivery",
			"Analytics"
		]
	},
	{
		title: "PostgreSQL",
		detail: "Primary transactional store for users, catalog, orders, payments, and audit records.",
		icon: Database,
		items: [
			"25-35 tables",
			"Prisma ORM",
			"RBAC records"
		]
	},
	{
		title: "Redis / Storage / Queue",
		detail: "Fast cache, object assets, and async work for notifications and delivery events.",
		icon: RefreshCcw,
		items: [
			"Redis cache",
			"Cloudflare R2",
			"Background queue"
		]
	}
];
var databaseDomains = [
	{
		title: "User System",
		tables: [
			"users",
			"roles",
			"permissions",
			"user_sessions",
			"addresses"
		]
	},
	{
		title: "Product System",
		tables: [
			"products",
			"categories",
			"product_variants",
			"product_images",
			"inventory"
		]
	},
	{
		title: "Order System",
		tables: [
			"orders",
			"order_items",
			"order_status_history",
			"carts",
			"wishlists"
		]
	},
	{
		title: "Payment System",
		tables: [
			"payments",
			"refunds",
			"transactions"
		]
	},
	{
		title: "Delivery System",
		tables: [
			"delivery_partners",
			"delivery_assignments",
			"tracking_logs",
			"delivery_zones"
		]
	},
	{
		title: "Marketing System",
		tables: [
			"coupons",
			"coupon_usage",
			"banners",
			"notifications"
		]
	},
	{
		title: "Support System",
		tables: ["tickets", "ticket_messages"]
	},
	{
		title: "Admin System",
		tables: [
			"admins",
			"admin_roles",
			"admin_activity_logs"
		]
	},
	{
		title: "Analytics System",
		tables: [
			"page_views",
			"sales_reports",
			"user_activity"
		]
	}
];
var productionApiGroups = [
	{
		title: "Auth APIs",
		count: "15+",
		detail: "Login, refresh, logout, 2FA, sessions"
	},
	{
		title: "User APIs",
		count: "15+",
		detail: "Profiles, addresses, KYC, block state"
	},
	{
		title: "Product APIs",
		count: "20+",
		detail: "Products, categories, variants, stock"
	},
	{
		title: "Order APIs",
		count: "20+",
		detail: "Cart, checkout, workflow, status history"
	},
	{
		title: "Payment APIs",
		count: "10+",
		detail: "Payments, refunds, reconciliation"
	},
	{
		title: "Delivery APIs",
		count: "15+",
		detail: "Partners, assignment, tracking, zones"
	},
	{
		title: "Analytics APIs",
		count: "10+",
		detail: "Sales, customers, products, revenue"
	},
	{
		title: "Admin APIs",
		count: "20+",
		detail: "RBAC, settings, logs, module controls"
	}
];
var infrastructureItems = [
	{
		title: "Backend",
		value: "NestJS",
		detail: "Modular API server target",
		icon: Database
	},
	{
		title: "Database",
		value: "PostgreSQL",
		detail: "Transactional production data",
		icon: Database
	},
	{
		title: "ORM",
		value: "Prisma",
		detail: "Schema and migrations",
		icon: ClipboardList
	},
	{
		title: "Cache",
		value: "Redis",
		detail: "Sessions, rate limits, queues",
		icon: RefreshCcw
	},
	{
		title: "Object Storage",
		value: "Cloudflare R2",
		detail: "Product images and proof files",
		icon: Image
	},
	{
		title: "Monitoring",
		value: "Grafana + Prometheus",
		detail: "Metrics, alerts, dashboards",
		icon: BarChart3
	},
	{
		title: "Deployment",
		value: "Dokploy",
		detail: "Production app delivery",
		icon: Truck
	},
	{
		title: "CI/CD",
		value: "GitHub Actions",
		detail: "Build, test, deploy pipeline",
		icon: Check
	}
];
var securityGroups = [
	{
		title: "Authentication",
		controls: [
			"JWT access token",
			"Refresh token",
			"Session management",
			"2FA for admins"
		]
	},
	{
		title: "Authorization",
		controls: [
			"RBAC",
			"Super Admin",
			"Admin",
			"Manager",
			"Support",
			"Delivery Partner",
			"Customer"
		]
	},
	{
		title: "Protection",
		controls: [
			"Rate limiting",
			"CSRF protection",
			"XSS protection",
			"SQL injection protection",
			"Password hashing with bcrypt or argon2"
		]
	}
];
var developmentOrder = [
	"Authentication",
	"User Management",
	"Product Management",
	"Cart & Wishlist",
	"Orders",
	"Payments",
	"Delivery Tracking",
	"Admin Panel",
	"Notifications",
	"Analytics",
	"Monitoring & Logging",
	"Security Hardening"
];
var featureModules = {
	categories: {
		title: "Categories",
		kicker: "Product taxonomy",
		icon: Tags,
		summary: "Organize products by dairy, pantry, bundles, seasonal items, and subscription plans.",
		controls: [
			"Create category",
			"Edit category",
			"Delete category",
			"Featured category",
			"Export"
		]
	},
	inventory: {
		title: "Inventory",
		kicker: "Stock control",
		icon: Warehouse,
		summary: "Track current stock, low-stock alerts, out-of-stock alerts, suppliers, and purchases.",
		controls: [
			"Current stock",
			"Low stock alerts",
			"Out of stock alerts",
			"Purchase records",
			"Supplier management",
			"Warehouse management"
		]
	},
	coupons: {
		title: "Coupons & Offers",
		kicker: "Growth campaigns",
		icon: BadgePercent,
		summary: "Run discount campaigns, referral codes, festival offers, and usage reports.",
		controls: [
			"Create coupon",
			"Discount campaign",
			"Referral code",
			"Festival offer",
			"Usage report"
		]
	},
	payments: {
		title: "Payments",
		kicker: "Money movement",
		icon: CreditCard,
		summary: "Monitor payments, failed charges, refunds, settlements, and invoices.",
		controls: [
			"Payment history",
			"Failed payments",
			"Refund requests",
			"Settlement reports",
			"Generate invoice"
		]
	},
	analytics: {
		title: "Analytics & Reports",
		kicker: "Commerce intelligence",
		icon: BarChart3,
		summary: "Measure revenue, sales, customers, product performance, delivery, and growth.",
		controls: [
			"Revenue reports",
			"Sales reports",
			"Customer reports",
			"Product performance",
			"Delivery reports",
			"Monthly growth charts",
			"AI sales insights"
		]
	},
	support: {
		title: "Support Center",
		kicker: "Customer care",
		icon: Headphones,
		summary: "Resolve customer tickets, complaints, live chat, cancellations, and refund requests.",
		controls: [
			"Customer tickets",
			"Live chat",
			"Complaint management",
			"Refund requests",
			"Cancel order management"
		]
	},
	content: {
		title: "Content Management",
		kicker: "Storefront content",
		icon: Image,
		summary: "Control homepage banners, featured products, blogs, FAQs, and policy pages.",
		controls: [
			"Homepage banners",
			"Featured products",
			"Blogs",
			"FAQs",
			"Terms & conditions",
			"Privacy policy"
		]
	},
	settings: {
		title: "Settings",
		kicker: "Store configuration",
		icon: Store,
		summary: "Manage store information, taxes, delivery charges, gateways, email, and notifications.",
		controls: [
			"Store information",
			"Tax settings",
			"Delivery charges",
			"Payment gateway settings",
			"Email settings",
			"Notification settings",
			"API keys management"
		]
	},
	security: {
		title: "Security Logs",
		kicker: "Access control",
		icon: KeyRound,
		summary: "Review login history, audit logs, role permissions, two-factor auth, and API keys.",
		controls: [
			"Login history",
			"Audit logs",
			"Role permissions",
			"Two-factor authentication",
			"API keys management"
		]
	}
};
function getGreetingText() {
	return "Welcome";
}
function AdminPage({ initialRole } = {}) {
	const roleLoginPage = getAdminRoleLoginPageByRole(initialRole);
	const [token, setToken] = useState("");
	const [tokenInput, setTokenInput] = useState("");
	const [data, setData] = useState(null);
	const [inventoryItems, setInventoryItems] = useState([]);
	const [activeTab, setActiveTab] = useState(getRolePanelTab(initialRole));
	const [backendStatus, setBackendStatus] = useState("checking");
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isBusy, setIsBusy] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [dispatchDate, setDispatchDate] = useState("");
	const sidebarNavRef = useRef(null);
	const loadDashboard = useCallback(async (nextToken = token) => {
		setIsLoading(true);
		setError("");
		try {
			setData(await fetchAdminDashboard(nextToken));
		} catch (loadError) {
			const message = loadError instanceof Error ? loadError.message : "Admin data could not be loaded.";
			if (isAuthErrorMessage(message)) {
				setData(null);
				setToken("");
				setTokenInput("");
				setError("Admin session expired. Enter the admin password again.");
				return;
			}
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}, [token]);
	const loadInventory = useCallback(async (nextToken = token) => {
		if (!nextToken) return;
		try {
			setInventoryItems(await fetchInventoryItems(nextToken));
		} catch (loadError) {
			const message = loadError instanceof Error ? loadError.message : "Inventory data could not be loaded.";
			setError((current) => current || message);
		}
	}, [token]);
	useEffect(() => {
		let isMounted = true;
		verifyAdminSession().then((isAuthenticated) => {
			if (isMounted && isAuthenticated) setToken(getStoredAdminAccessToken());
		});
		return () => {
			isMounted = false;
		};
	}, []);
	useEffect(() => {
		let isMounted = true;
		async function checkBackend() {
			try {
				const response = await fetch(`${getAdminApiBaseUrl()}/api/v1/health`, { cache: "no-store" });
				if (isMounted) setBackendStatus(response.ok ? "online" : "offline");
			} catch {
				if (isMounted) setBackendStatus("offline");
			}
		}
		checkBackend();
		const interval = window.setInterval(checkBackend, 3e4);
		return () => {
			isMounted = false;
			window.clearInterval(interval);
		};
	}, []);
	useEffect(() => {
		if (!token) return;
		loadDashboard(token);
		loadInventory(token);
	}, [
		loadDashboard,
		loadInventory,
		token
	]);
	useEffect(() => {
		if (!initialRole) return;
		setActiveTab(getRolePanelTab(initialRole));
	}, [initialRole]);
	const pendingSubscriptions = useMemo(() => data?.subscriptions.filter((subscription) => subscription.status === "pending") ?? [], [data?.subscriptions]);
	const activeSubscriptions = useMemo(() => data?.subscriptions.filter((subscription) => subscription.status === "active") ?? [], [data?.subscriptions]);
	const pendingOrders = useMemo(() => data?.orders.filter((order) => order.status === "pending") ?? [], [data?.orders]);
	const customerUsers = useMemo(() => data?.users.filter((user) => user.role === "consumer") ?? [], [data?.users]);
	const deliveryPartners = useMemo(() => data?.users.filter((user) => user.role === "rider") ?? [], [data?.users]);
	const crmMetrics = useMemo(() => data ? buildCrmMetrics(data) : null, [data]);
	function openAdminTab(tab, message) {
		setActiveTab(tab);
		setError("");
		if (message) setNotice(message);
	}
	function handleTopbarSearch(query) {
		const normalizedQuery = query.trim().toLowerCase();
		if (!normalizedQuery) return;
		const match = Object.values(tabRegistry).find((tab) => {
			return `${tab.label} ${tab.id}`.toLowerCase().includes(normalizedQuery);
		});
		if (match) {
			openAdminTab(match.id, `Opened ${match.label}.`);
			return;
		}
		setNotice("");
		setError(`No admin module matched "${query}".`);
	}
	async function handleConnect(event) {
		event.preventDefault();
		const password = tokenInput.trim();
		if (!password) {
			setError("Enter the admin password.");
			return;
		}
		setIsLoading(true);
		setError("");
		try {
			setToken((await createAdminSession(password, roleLoginPage?.role)).accessToken);
			setTokenInput("");
			setNotice("");
		} catch (connectError) {
			setToken("");
			setError(connectError instanceof Error ? connectError.message : "Admin login failed.");
		} finally {
			setIsLoading(false);
		}
	}
	async function handleLogout() {
		await destroyAdminSession(token);
		setToken("");
		setTokenInput("");
		setData(null);
		setNotice("");
		setError("");
	}
	async function runAction(action) {
		setIsBusy(true);
		setError("");
		setNotice("");
		try {
			setNotice(await action());
			await loadDashboard();
			await loadInventory();
		} catch (actionError) {
			const message = actionError instanceof Error ? actionError.message : "The action failed.";
			if (isAuthErrorMessage(message)) {
				setData(null);
				setToken("");
				setTokenInput("");
				setError("Admin session expired. Enter the admin password again.");
				return;
			}
			setError(message);
		} finally {
			setIsBusy(false);
		}
	}
	function upsertProduct(product) {
		setData((current) => {
			if (!current) return current;
			const products = current.products.filter((item) => item.id !== product.id);
			return {
				...current,
				products: [product, ...products]
			};
		});
	}
	function removeProduct(productId) {
		setData((current) => {
			if (!current) return current;
			return {
				...current,
				products: current.products.filter((product) => product.id !== productId)
			};
		});
	}
	function upsertInventoryItem(item) {
		setInventoryItems((current) => {
			return [item, ...current.filter((entry) => entry.id !== item.id)];
		});
	}
	function removeInventoryItem(itemId) {
		setInventoryItems((current) => current.filter((item) => item.id !== itemId));
	}
	async function handleLeadCapture(payload) {
		await runAction(async () => {
			await captureLead(token, payload);
			return "Lead captured.";
		});
	}
	async function handleLeadDelete(id) {
		await runAction(async () => {
			await deleteLead(token, id);
			return "Lead deleted.";
		});
	}
	async function handleSubscriptionStatus(id, status) {
		await runAction(async () => {
			await updateSubscriptionStatus(token, id, status);
			return `Subscription moved to ${status}.`;
		});
	}
	async function handleCommerceOrderStatus(id, status) {
		await runAction(async () => {
			await updateCommerceOrderStatus(token, id, status);
			return `Order status updated to ${status}.`;
		});
	}
	async function handleSubscriptionDelete(id) {
		await runAction(async () => {
			await deleteSubscription(token, id);
			return "Subscription deleted.";
		});
	}
	async function handleDispatchRun(event) {
		event.preventDefault();
		await runAction(async () => {
			const result = await runDispatch(token, dispatchDate || void 0);
			setDispatchDate("");
			return result.message;
		});
	}
	async function handleDeliverOrder(orderId) {
		await runAction(async () => {
			await markOrderDelivered(token, orderId);
			return "Order marked delivered.";
		});
	}
	async function handleNotificationRetry(notificationId) {
		await runAction(async () => {
			await retryNotification(token, notificationId);
			return "Notification retry queued.";
		});
	}
	async function handleFarmerSubmit(event) {
		event.preventDefault();
		const form = event.currentTarget;
		const formData = new FormData(form);
		await runAction(async () => {
			await createFarmer(token, {
				name: String(formData.get("name") || ""),
				phone: String(formData.get("phone") || "")
			});
			form.reset();
			return "Farmer added.";
		});
	}
	async function handleProcurementSubmit(event) {
		event.preventDefault();
		const form = event.currentTarget;
		const formData = new FormData(form);
		await runAction(async () => {
			await createProcurementLog(token, {
				farmerId: String(formData.get("farmerId") || ""),
				collectionDate: String(formData.get("collectionDate") || "") || void 0,
				quantityLiters: Number(formData.get("quantityLiters")),
				fatPercentage: Number(formData.get("fatPercentage")),
				snfPercentage: Number(formData.get("snfPercentage"))
			});
			form.reset();
			return "Procurement entry saved.";
		});
	}
	async function handleProductCreate(payload) {
		await runAction(async () => {
			upsertProduct(await createProduct(token, payload));
			return "Product added.";
		});
	}
	async function handleProductUpdate(id, payload) {
		await runAction(async () => {
			upsertProduct(await updateProduct(token, id, payload));
			return "Product updated.";
		});
	}
	async function handleProductDelete(id) {
		await runAction(async () => {
			await deleteProduct(token, id);
			removeProduct(id);
			return "Product archived.";
		});
	}
	async function handleCategoryCreate(payload) {
		await runAction(async () => {
			await createCategory(token, payload);
			return "Category created.";
		});
	}
	async function handleCategoryUpdate(id, payload) {
		await runAction(async () => {
			await updateCategory(token, id, payload);
			return "Category updated.";
		});
	}
	async function handleCategoryDelete(id) {
		await runAction(async () => {
			await deleteCategory(token, id);
			return "Category archived.";
		});
	}
	async function handleInventoryCreate(payload) {
		await runAction(async () => {
			const result = await createInventoryItem(token, payload);
			if (result?.item) upsertInventoryItem(result.item);
			return "Stock item added.";
		});
	}
	async function handleInventoryAdjust(id, payload) {
		await runAction(async () => {
			const result = await adjustInventoryItem(token, id, payload);
			if (result?.item) upsertInventoryItem(result.item);
			return "Stock updated.";
		});
	}
	async function handleInventoryDelete(id) {
		await runAction(async () => {
			await deleteInventoryItem(token, id);
			removeInventoryItem(id);
			return "Stock item deleted.";
		});
	}
	async function handleSettingSave(key, payload) {
		await runAction(async () => {
			await saveSetting(token, key, payload);
			return `${payload.label || key} saved.`;
		});
	}
	if (!token) return /* @__PURE__ */ jsx("main", {
		className: "admin-shell min-h-screen text-charcoal",
		children: /* @__PURE__ */ jsx(TokenGate, {
			tokenInput,
			setTokenInput,
			onSubmit: handleConnect,
			error,
			isLoading,
			backendStatus,
			loginPage: roleLoginPage
		})
	});
	const tabCounts = {
		overview: 0,
		orders: (data?.orders.length ?? 0) + (data?.commerceOrders.length ?? 0),
		leads: data?.leads.length ?? 0,
		subscriptions: data?.subscriptions.length ?? 0,
		products: data?.products.length ?? 0,
		categories: data?.categories.length ?? 0,
		inventory: data?.products.length ?? 0,
		customers: customerUsers.length,
		deliveryPartners: deliveryPartners.length,
		coupons: 0,
		payments: 0,
		analytics: 0,
		architecture: 0,
		support: 0,
		content: 0,
		dispatch: data?.orders.length ?? 0,
		procurement: data?.procurementLogs.length ?? 0,
		notifications: data?.notifications.length ?? 0,
		usersRoles: data?.users.length ?? 0,
		superAdminPanel: data?.users.filter((user) => user.role === "super_admin").length ?? 0,
		adminPanel: data?.users.filter((user) => user.role === "admin").length ?? 0,
		managerPanel: data?.users.filter((user) => user.role === "manager").length ?? 0,
		customerSupportPanel: data?.users.filter((user) => user.role === "customer_support").length ?? 0,
		inventoryManagerPanel: data?.users.filter((user) => user.role === "inventory_manager").length ?? 0,
		deliveryManagerPanel: data?.users.filter((user) => user.role === "delivery_manager").length ?? 0,
		settings: data?.settings.length ?? 0,
		security: (data?.auditLogs.length ?? 0) + (data?.loginHistory.length ?? 0)
	};
	return /* @__PURE__ */ jsx("main", {
		className: "admin-shell min-h-screen text-charcoal",
		children: /* @__PURE__ */ jsxs("div", {
			className: `admin-layout grid min-h-screen w-full grid-cols-1 transition-all duration-300 ${isSidebarCollapsed ? "md:grid-cols-[80px_minmax(0,1fr)] xl:grid-cols-[80px_minmax(0,1fr)]" : "md:grid-cols-[304px_minmax(0,1fr)] xl:grid-cols-[328px_minmax(0,1fr)]"}`,
			children: [/* @__PURE__ */ jsxs("aside", {
				className: `admin-sidebar md:sticky md:top-0 md:h-screen transition-all duration-300 ${isSidebarCollapsed ? "admin-sidebar-collapsed" : ""}`,
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: `admin-sidebar-brand flex items-center justify-between gap-10 border-b border-white/10 px-16 py-15 transition-all duration-300 ${isSidebarCollapsed ? "flex-col justify-center px-10 py-15 gap-12" : ""}`,
						children: [/* @__PURE__ */ jsxs("div", {
							className: `flex items-center gap-10 min-w-0 ${isSidebarCollapsed ? "justify-center" : ""}`,
							children: [/* @__PURE__ */ jsx("span", {
								className: "inline-flex h-38 w-38 shrink-0 items-center justify-center rounded-[10px] bg-vivid-lime text-forest-ink shadow-sm",
								children: /* @__PURE__ */ jsx(Leaf, {
									className: "h-[18px] w-[18px]",
									strokeWidth: 1.8
								})
							}), !isSidebarCollapsed && /* @__PURE__ */ jsxs("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ jsx("p", {
									className: "truncate font-reckless text-[20px] font-medium tracking-normal text-white",
									children: "HasuMane Admin"
								}), /* @__PURE__ */ jsx("p", {
									className: "mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60",
									children: "Operations"
								})]
							})]
						}), /* @__PURE__ */ jsx("div", {
							className: "admin-sidebar-scroll-controls",
							"aria-label": "Sidebar collapse controls",
							children: /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setIsSidebarCollapsed(!isSidebarCollapsed),
								className: "admin-sidebar-scroll-button",
								"aria-label": isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar",
								children: isSidebarCollapsed ? /* @__PURE__ */ jsx(ChevronRight, {
									className: "h-[13px] w-[13px]",
									strokeWidth: 2
								}) : /* @__PURE__ */ jsx(ChevronLeft, {
									className: "h-[13px] w-[13px]",
									strokeWidth: 2
								})
							})
						})]
					}),
					/* @__PURE__ */ jsx("nav", {
						ref: sidebarNavRef,
						className: `admin-sidebar-nav grid gap-9 p-10 transition-all duration-300 ${isSidebarCollapsed ? "px-6 py-10" : ""}`,
						children: navSections.map((section) => /* @__PURE__ */ jsxs("div", {
							className: "admin-nav-section-group",
							children: [!isSidebarCollapsed && /* @__PURE__ */ jsx("p", {
								className: "admin-nav-section",
								children: section.title
							}), /* @__PURE__ */ jsx("div", {
								className: "grid gap-5",
								children: section.items.map((tab) => /* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: () => openAdminTab(tab.id),
									className: `admin-nav-button transition-all duration-300 ${activeTab === tab.id ? "admin-nav-button-active" : ""}`,
									title: isSidebarCollapsed ? tab.label : void 0,
									children: [/* @__PURE__ */ jsxs("span", {
										className: "inline-flex items-center gap-10",
										children: [/* @__PURE__ */ jsx(tab.icon, {
											className: `h-[15px] w-[15px] transition-transform duration-300 ${isSidebarCollapsed ? "mx-auto" : ""}`,
											strokeWidth: 1.8
										}), !isSidebarCollapsed && tab.label]
									}), !isSidebarCollapsed && tab.id !== "overview" && /* @__PURE__ */ jsx("span", {
										className: `admin-nav-count ${tab.status === "planned" ? "admin-nav-count-planned" : ""}`,
										children: tab.status === "planned" && tabCounts[tab.id] === 0 ? "Plan" : tabCounts[tab.id]
									})]
								}, tab.id))
							})]
						}, section.title))
					}),
					/* @__PURE__ */ jsx("div", {
						className: `mt-auto border-t border-white/10 p-10 transition-all duration-300 ${isSidebarCollapsed ? "px-6 py-10" : ""}`,
						children: /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: handleLogout,
							className: "admin-nav-button w-full transition-all duration-300 text-[#ffa3a3] hover:text-white",
							title: isSidebarCollapsed ? "Lock" : void 0,
							children: /* @__PURE__ */ jsxs("span", {
								className: "inline-flex items-center gap-10",
								children: [/* @__PURE__ */ jsx(LogOut, {
									className: `h-[15px] w-[15px] transition-transform duration-300 ${isSidebarCollapsed ? "mx-auto" : ""}`,
									strokeWidth: 1.8
								}), !isSidebarCollapsed && /* @__PURE__ */ jsx("span", { children: "Lock" })]
							})
						})
					})
				]
			}), /* @__PURE__ */ jsxs("section", {
				className: "admin-main-content min-w-0",
				children: [
					/* @__PURE__ */ jsx(AdminTopbar, {
						backendStatus,
						onSearchNavigate: handleTopbarSearch,
						onHelp: () => openAdminTab("architecture", "Opened admin insights."),
						onNotifications: () => openAdminTab("notifications", "Opened notifications."),
						onSettings: () => openAdminTab("settings", "Opened settings."),
						onUsers: () => openAdminTab("usersRoles", "Opened users and roles.")
					}),
					activeTab === "overview" && /* @__PURE__ */ jsxs("header", {
						className: "admin-page-heading",
						children: [/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex flex-wrap items-center gap-8",
								children: [/* @__PURE__ */ jsxs("span", {
									className: `admin-live-pill ${backendStatus === "offline" ? "admin-live-pill-offline" : ""}`,
									children: [/* @__PURE__ */ jsx(Activity, {
										className: "h-[12px] w-[12px]",
										strokeWidth: 1.8
									}), backendStatus === "offline" ? "Backend offline" : "Live backend"]
								}), /* @__PURE__ */ jsxs("span", {
									className: "admin-date-pill",
									children: [/* @__PURE__ */ jsx(CalendarDays, {
										className: "h-[12px] w-[12px]",
										strokeWidth: 1.8
									}), new Intl.DateTimeFormat("en-IN", {
										day: "2-digit",
										month: "short",
										year: "numeric"
									}).format(/* @__PURE__ */ new Date())]
								})]
							}),
							/* @__PURE__ */ jsxs("h1", {
								className: "mt-9 font-reckless text-[36px] font-medium leading-[1.04] tracking-normal text-charcoal md:text-[48px]",
								children: [getGreetingText(), ", HasuMane"]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-5 max-w-[78ch] text-[15px] leading-relaxed text-graphite",
								children: "Welcome back! Manage our farmer entrepreneurship network, track chemical-free dairy subscriptions, coordinate procurement, and monitor Bengaluru dispatch workflows in a single interface."
							})
						] }), /* @__PURE__ */ jsx("div", {
							className: "flex flex-wrap items-center gap-10",
							children: /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => void loadDashboard(),
								disabled: isLoading || isBusy,
								className: "admin-secondary-button",
								children: [/* @__PURE__ */ jsx(RefreshCcw, {
									className: "h-[12px] w-[12px]",
									strokeWidth: 1.9
								}), "Refresh"]
							})
						})]
					}),
					error ? /* @__PURE__ */ jsx(Alert, {
						tone: "error",
						children: error
					}) : null,
					notice ? /* @__PURE__ */ jsx(Alert, {
						tone: "success",
						children: notice
					}) : null,
					isLoading && !data ? /* @__PURE__ */ jsx("div", {
						className: "rounded-[8px] border border-forest-ink/10 bg-pure-white p-24 text-body-sm text-graphite",
						children: "Loading admin data..."
					}) : data ? /* @__PURE__ */ jsxs(Fragment, { children: [
						activeTab === "overview" ? /* @__PURE__ */ jsxs(Fragment, { children: [
							/* @__PURE__ */ jsx(SummaryGrid, { data }),
							crmMetrics ? /* @__PURE__ */ jsx(OverviewCharts, {
								data,
								metrics: crmMetrics
							}) : null,
							/* @__PURE__ */ jsx(CommerceInsights, { data })
						] }) : null,
						activeTab === "orders" ? /* @__PURE__ */ jsx(OrdersPanel, {
							orders: data.orders,
							commerceOrders: data.commerceOrders,
							pendingOrders,
							isBusy,
							onDeliver: handleDeliverOrder,
							onCommerceStatusChange: handleCommerceOrderStatus
						}) : null,
						activeTab === "leads" ? /* @__PURE__ */ jsx(LeadsPanel, {
							leads: data.leads,
							products: data.products,
							pendingSubscriptions,
							isBusy,
							onCapture: handleLeadCapture,
							onActivate: (id) => handleSubscriptionStatus(id, "active"),
							onReject: (id) => handleSubscriptionStatus(id, "terminated"),
							onDelete: handleLeadDelete
						}) : null,
						activeTab === "subscriptions" ? /* @__PURE__ */ jsx(SubscriptionsPanel, {
							subscriptions: data.subscriptions,
							activeCount: activeSubscriptions.length,
							isBusy,
							onStatusChange: handleSubscriptionStatus,
							onDelete: handleSubscriptionDelete
						}) : null,
						activeTab === "products" ? /* @__PURE__ */ jsx(ProductsPanel, {
							products: data.products,
							categories: data.categories,
							isBusy,
							onCreate: handleProductCreate,
							onUpdate: handleProductUpdate,
							onDelete: handleProductDelete
						}) : null,
						activeTab === "categories" ? /* @__PURE__ */ jsx(CategoriesPanel, {
							categories: data.categories,
							products: data.products,
							isBusy,
							onCreate: handleCategoryCreate,
							onUpdate: handleCategoryUpdate,
							onDelete: handleCategoryDelete
						}) : null,
						activeTab === "inventory" ? /* @__PURE__ */ jsx(InventoryDashboardPanel, {
							products: data.products,
							inventoryItems,
							onCreate: handleInventoryCreate,
							onAdjust: handleInventoryAdjust,
							onDelete: handleInventoryDelete
						}) : null,
						activeTab === "customers" ? /* @__PURE__ */ jsx(CustomersPanel, {
							customers: customerUsers,
							subscriptions: data.subscriptions
						}) : null,
						activeTab === "deliveryPartners" ? /* @__PURE__ */ jsx(DeliveryPartnersPanel, { partners: deliveryPartners }) : null,
						activeTab === "coupons" ? /* @__PURE__ */ jsx(FeatureModulePanel, { module: featureModules.coupons }) : null,
						activeTab === "payments" ? /* @__PURE__ */ jsx(FeatureModulePanel, { module: featureModules.payments }) : null,
						activeTab === "analytics" ? /* @__PURE__ */ jsx(AnalyticsDashboardPanel, {
							data,
							metrics: crmMetrics
						}) : null,
						activeTab === "support" ? /* @__PURE__ */ jsx(FeatureModulePanel, { module: featureModules.support }) : null,
						activeTab === "content" ? /* @__PURE__ */ jsx(FeatureModulePanel, { module: featureModules.content }) : null,
						activeTab === "dispatch" ? /* @__PURE__ */ jsx(DispatchPanel, {
							orders: data.orders,
							pendingOrders,
							dispatchDate,
							setDispatchDate,
							isBusy,
							onRun: handleDispatchRun,
							onDeliver: handleDeliverOrder
						}) : null,
						activeTab === "procurement" ? /* @__PURE__ */ jsx(ProcurementPanel, {
							farmers: data.farmers,
							logs: data.procurementLogs,
							isBusy,
							onFarmerSubmit: handleFarmerSubmit,
							onProcurementSubmit: handleProcurementSubmit
						}) : null,
						activeTab === "notifications" ? /* @__PURE__ */ jsx(NotificationsPanel, {
							notifications: data.notifications,
							isBusy,
							onRetry: handleNotificationRetry
						}) : null,
						activeTab === "architecture" ? /* @__PURE__ */ jsx(ProductionArchitecturePanel, {}) : null,
						activeTab === "usersRoles" ? /* @__PURE__ */ jsx(UsersRolesPanel, {
							users: data.users,
							rolePermissions: data.rolePermissions
						}) : null,
						rolePanelEntries.map((entry) => {
							if (activeTab !== entry.tabId) return null;
							const blueprint = adminRoleBlueprints.find((item) => item.role === entry.role);
							if (!blueprint) return null;
							return /* @__PURE__ */ jsx(RoleOperationsPanel, {
								blueprint,
								data,
								users: data.users,
								rolePermissions: data.rolePermissions
							}, entry.tabId);
						}),
						activeTab === "settings" ? /* @__PURE__ */ jsx(SettingsPanel, {
							settings: data.settings,
							isBusy,
							onSave: handleSettingSave
						}) : null,
						activeTab === "security" ? /* @__PURE__ */ jsx(SecurityLogsPanel, {
							auditLogs: data.auditLogs,
							loginHistory: data.loginHistory,
							settings: data.settings
						}) : null
					] }) : /* @__PURE__ */ jsx("div", {
						className: "rounded-[8px] border border-forest-ink/10 bg-pure-white p-24",
						children: /* @__PURE__ */ jsx("p", {
							className: "text-body-sm text-graphite",
							children: "Admin data is unavailable. Check the backend service and token."
						})
					})
				]
			})]
		})
	});
}
function AdminTopbar({ backendStatus, onSearchNavigate, onHelp, onNotifications, onSettings, onUsers }) {
	const [searchQuery, setSearchQuery] = useState("");
	function handleSearch(event) {
		event.preventDefault();
		onSearchNavigate(searchQuery);
		setSearchQuery("");
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "admin-topbar",
		"aria-label": "Admin utilities",
		children: [/* @__PURE__ */ jsxs("form", {
			className: "admin-topbar-search",
			onSubmit: handleSearch,
			children: [/* @__PURE__ */ jsx(Search, {
				className: "h-[14px] w-[14px]",
				strokeWidth: 1.9
			}), /* @__PURE__ */ jsx("input", {
				type: "search",
				value: searchQuery,
				onChange: (event) => setSearchQuery(event.target.value),
				placeholder: "Search modules",
				"aria-label": "Search admin modules"
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "admin-topbar-actions",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: `admin-backend-dot ${backendStatus === "online" ? "admin-backend-dot-online" : backendStatus === "offline" ? "admin-backend-dot-offline" : ""}`,
					"aria-label": `Backend status: ${backendStatus}`
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: onHelp,
					className: "admin-icon-button",
					"aria-label": "Help",
					children: /* @__PURE__ */ jsx(CircleHelp, {
						className: "h-[15px] w-[15px]",
						strokeWidth: 1.9
					})
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: onNotifications,
					className: "admin-icon-button",
					"aria-label": "Notifications",
					children: /* @__PURE__ */ jsx(Bell, {
						className: "h-[15px] w-[15px]",
						strokeWidth: 1.9
					})
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: onSettings,
					className: "admin-icon-button",
					"aria-label": "Settings",
					children: /* @__PURE__ */ jsx(Settings, {
						className: "h-[15px] w-[15px]",
						strokeWidth: 1.9
					})
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: onUsers,
					className: "admin-avatar",
					"aria-label": "Users and roles",
					children: "HM"
				})
			]
		})]
	});
}
function TokenGate({ tokenInput, setTokenInput, onSubmit, error, isLoading, backendStatus, loginPage }) {
	const [showPassword, setShowPassword] = useState(false);
	const features = loginPage?.features ?? [
		{
			label: "Lead capture",
			value: "Website to CRM"
		},
		{
			label: "Product ops",
			value: "Live catalog"
		},
		{
			label: "Fulfillment",
			value: "Dispatch ready"
		}
	];
	return /* @__PURE__ */ jsxs("div", {
		className: "admin-auth-screen",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "auth-bg-glow-container",
			children: [
				/* @__PURE__ */ jsx("div", { className: "glow-blob glow-blob-1" }),
				/* @__PURE__ */ jsx("div", { className: "glow-blob glow-blob-2" }),
				/* @__PURE__ */ jsx("div", { className: "glow-blob glow-blob-3" })
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "admin-auth-frame",
			children: [/* @__PURE__ */ jsxs("section", {
				className: "admin-auth-hero",
				"aria-label": "HasuMane CRM overview",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "admin-auth-brand",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "admin-auth-logo-container",
							children: [/* @__PURE__ */ jsx("div", { className: "admin-auth-logo-ring" }), /* @__PURE__ */ jsx("div", {
								className: "admin-auth-logo-bg",
								children: /* @__PURE__ */ jsx(Leaf, {
									className: "h-[22px] w-[22px]",
									strokeWidth: 1.8
								})
							})]
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", { children: loginPage ? `${loginPage.title} Login` : "HasuMane CRM" }), /* @__PURE__ */ jsx("span", { children: loginPage?.eyebrow || "Sales and operations command center" })] })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "admin-auth-copy",
						children: [
							/* @__PURE__ */ jsx("p", {
								className: "admin-auth-kicker",
								children: loginPage ? "Role-Based Secure Workspace" : "Secure Admin Workspace"
							}),
							/* @__PURE__ */ jsx("h1", { children: loginPage?.headline || "Control leads, products, dispatch, and procurement from one premium cockpit." }),
							/* @__PURE__ */ jsx("p", { children: loginPage?.description || "Authenticate once, then manage the full dairy sales pipeline with live backend data, dynamic product controls, and operational readiness signals." })
						]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "admin-auth-feature-grid",
						children: features.map((item) => /* @__PURE__ */ jsxs("div", {
							className: "admin-auth-feature",
							children: [/* @__PURE__ */ jsx("span", { children: item.label }), /* @__PURE__ */ jsx("strong", { children: item.value })]
						}, item.label))
					}),
					/* @__PURE__ */ jsx("div", {
						className: "admin-auth-checks",
						children: [
							"Protected HttpOnly admin session",
							"CSRF-checked product and CRM actions",
							"Backend rate limiting and audit-safe logging"
						].map((item) => /* @__PURE__ */ jsxs("div", {
							className: "admin-auth-check",
							children: [/* @__PURE__ */ jsx(Check, {
								className: "h-[14px] w-[14px] shrink-0",
								strokeWidth: 2
							}), /* @__PURE__ */ jsx("span", { children: item })]
						}, item))
					})
				]
			}), /* @__PURE__ */ jsx("div", {
				className: "admin-auth-card-wrap",
				children: /* @__PURE__ */ jsxs("form", {
					onSubmit,
					className: "admin-auth-card",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "admin-auth-card-header",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "admin-auth-header-row",
								children: [/* @__PURE__ */ jsx("span", {
									className: "admin-auth-card-icon",
									children: /* @__PURE__ */ jsx(ShieldCheck, {
										className: "h-[18px] w-[18px]",
										strokeWidth: 1.9
									})
								}), /* @__PURE__ */ jsxs("div", {
									className: `admin-auth-status-indicator status-${backendStatus}`,
									children: [/* @__PURE__ */ jsx("span", { className: "status-dot" }), /* @__PURE__ */ jsx("span", {
										className: "status-text",
										children: backendStatus === "online" ? "System Live" : backendStatus === "checking" ? "Checking..." : "Offline"
									})]
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "admin-auth-title-group",
								children: [/* @__PURE__ */ jsx("p", { children: loginPage ? `${loginPage.title} Login` : "Administrator Login" }), /* @__PURE__ */ jsx("h2", { children: loginPage ? `Unlock ${loginPage.title}` : "Unlock HasuMane CRM" })]
							})]
						}),
						error ? /* @__PURE__ */ jsx(Alert, {
							tone: "error",
							children: error
						}) : null,
						/* @__PURE__ */ jsxs("div", {
							className: "admin-auth-form-field",
							children: [/* @__PURE__ */ jsx("label", {
								className: "admin-auth-label",
								htmlFor: "admin-password",
								children: "Admin password"
							}), /* @__PURE__ */ jsxs("div", {
								className: "admin-auth-input-wrap",
								children: [
									/* @__PURE__ */ jsx(ShieldCheck, {
										className: "h-[16px] w-[16px] text-forest-ink/62 shrink-0",
										strokeWidth: 1.9
									}),
									/* @__PURE__ */ jsx("input", {
										id: "admin-password",
										type: showPassword ? "text" : "password",
										value: tokenInput,
										onChange: (event) => setTokenInput(event.target.value),
										placeholder: "Enter secure admin password",
										autoComplete: "current-password",
										required: true,
										disabled: isLoading
									}),
									/* @__PURE__ */ jsx("button", {
										type: "button",
										className: "admin-auth-toggle-pwd",
										onClick: () => setShowPassword((prev) => !prev),
										"aria-label": showPassword ? "Hide password" : "Show password",
										tabIndex: 0,
										children: showPassword ? /* @__PURE__ */ jsx(EyeOff, {
											className: "h-[16px] w-[16px]",
											strokeWidth: 1.9
										}) : /* @__PURE__ */ jsx(Eye, {
											className: "h-[16px] w-[16px]",
											strokeWidth: 1.9
										})
									})
								]
							})]
						}),
						/* @__PURE__ */ jsxs("button", {
							type: "submit",
							disabled: isLoading,
							className: "admin-auth-submit",
							children: [isLoading ? /* @__PURE__ */ jsx("span", { className: "admin-auth-spinner" }) : /* @__PURE__ */ jsx(ShieldCheck, {
								className: "h-[15px] w-[15px]",
								strokeWidth: 2
							}), isLoading ? "Authenticating..." : loginPage ? `Open ${loginPage.title}` : "Open Dashboard"]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "admin-auth-footnote",
							children: [/* @__PURE__ */ jsx("span", { children: loginPage ? `${loginPage.title} role entry` : "Session-protected CRM access" }), /* @__PURE__ */ jsx("span", { children: "Use the private admin password" })]
						})
					]
				})
			})]
		})]
	});
}
function SummaryGrid({ data }) {
	const summary = data.summary;
	const todayKey = toDateKey((/* @__PURE__ */ new Date()).toISOString());
	const todayOrders = data.orders.filter((order) => toDateKey(order.deliveryDate) === todayKey);
	const todayCustomerOrders = data.commerceOrders.filter((order) => toDateKey(order.createdAt) === todayKey && ![
		"cancelled",
		"refunded",
		"rejected"
	].includes(String(order.status).toLowerCase()));
	const totalOrders = data.orders.length + data.commerceOrders.length;
	const priceByProduct = new Map(data.products.map((product) => [product.productType.toLowerCase(), Number(product.price || 0)]));
	const todaysDispatchRevenue = todayOrders.reduce((total, order) => {
		const productType = order.subscription?.productType?.toLowerCase() || "";
		return total + Number(order.quantity || 0) * (priceByProduct.get(productType) || 0);
	}, 0);
	const todaysCommerceRevenue = todayCustomerOrders.reduce((total, order) => total + Number(order.total || 0), 0);
	const todaysRevenue = todaysDispatchRevenue + todaysCommerceRevenue;
	const lowStockAlerts = getInventoryRows(data.products, data.subscriptions).filter((item) => item.status !== "healthy").length;
	const newLeads = data.leads.filter((lead) => toDateKey(lead.submittedAt) === todayKey).length;
	const pendingNotifications = data.notifications.filter((notification) => isPendingNotification(notification.status)).length;
	return /* @__PURE__ */ jsxs("div", {
		className: "mb-24 grid gap-14 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 2xl:gap-16",
		children: [
			/* @__PURE__ */ jsx(StatCard, {
				icon: ShoppingCart,
				label: "Total orders",
				value: totalOrders,
				detail: `${data.commerceOrders.length} customer / ${data.orders.length} dispatch`,
				tone: "orders"
			}),
			/* @__PURE__ */ jsx(StatCard, {
				icon: Users,
				label: "Active subscribers",
				value: summary.subscriptions.byStatus.active ?? 0,
				detail: `${summary.subscriptions.total} subscription records`,
				tone: "users"
			}),
			/* @__PURE__ */ jsx(StatCard, {
				icon: IndianRupee,
				label: "Today's revenue",
				value: formatCurrency(todaysRevenue),
				detail: `${todayCustomerOrders.length + todayOrders.length} today orders`,
				tone: "revenue"
			}),
			/* @__PURE__ */ jsx(StatCard, {
				icon: PackageCheck,
				label: "Low stock alerts",
				value: lowStockAlerts,
				detail: "Low or out of stock",
				tone: "pending"
			}),
			/* @__PURE__ */ jsx(StatCard, {
				icon: UserPlus,
				label: "New leads",
				value: newLeads,
				detail: `${data.leads.length} total leads`,
				tone: "sales"
			}),
			/* @__PURE__ */ jsx(StatCard, {
				icon: Bell,
				label: "Pending notifications",
				value: pendingNotifications,
				detail: "Queued or retryable",
				tone: "delivered"
			})
		]
	});
}
function OverviewCharts({ data, metrics }) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);
	const orderTrend = metrics.salesGrowth.map((point) => {
		const dailyCount = data.orders.filter((order) => toDateKey(order.deliveryDate) === point.key).length;
		const commerceCount = data.commerceOrders.filter((order) => toDateKey(order.createdAt) === point.key).length;
		return {
			...point,
			orders: dailyCount + commerceCount
		};
	});
	if (!mounted) return /* @__PURE__ */ jsxs("div", {
		className: "mb-24 grid gap-18 xl:grid-cols-2",
		children: [/* @__PURE__ */ jsx(ChartCard, {
			title: "Orders Chart",
			kicker: "Last 8 days",
			icon: ShoppingCart,
			children: /* @__PURE__ */ jsx("div", {
				className: "h-[240px] lg:h-[300px] flex items-center justify-center bg-ash-gray/10 animate-pulse rounded-cards",
				children: /* @__PURE__ */ jsx("span", {
					className: "text-body-sm text-pewter",
					children: "Loading chart..."
				})
			})
		}), /* @__PURE__ */ jsx(ChartCard, {
			title: "Lead Chart",
			kicker: "Last 8 days",
			icon: ClipboardList,
			children: /* @__PURE__ */ jsx("div", {
				className: "h-[240px] lg:h-[300px] flex items-center justify-center bg-ash-gray/10 animate-pulse rounded-cards",
				children: /* @__PURE__ */ jsx("span", {
					className: "text-body-sm text-pewter",
					children: "Loading chart..."
				})
			})
		})]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "mb-24 grid gap-18 xl:grid-cols-2",
		children: [/* @__PURE__ */ jsx(ChartCard, {
			title: "Orders Chart",
			kicker: "Last 8 days",
			icon: ShoppingCart,
			children: /* @__PURE__ */ jsx("div", {
				className: "h-[240px] lg:h-[300px]",
				children: /* @__PURE__ */ jsx(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ jsxs(AreaChart, {
						data: orderTrend,
						children: [
							/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
								id: "ordersChartGradient",
								x1: "0",
								x2: "0",
								y1: "0",
								y2: "1",
								children: [/* @__PURE__ */ jsx("stop", {
									offset: "5%",
									stopColor: "#2563EB",
									stopOpacity: .24
								}), /* @__PURE__ */ jsx("stop", {
									offset: "95%",
									stopColor: "#2563EB",
									stopOpacity: .03
								})]
							}) }),
							/* @__PURE__ */ jsx(CartesianGrid, {
								vertical: false,
								stroke: "#e5e7eb",
								strokeDasharray: "3 3"
							}),
							/* @__PURE__ */ jsx(XAxis, {
								dataKey: "label",
								axisLine: false,
								tickLine: false,
								tick: { fontSize: 11 }
							}),
							/* @__PURE__ */ jsx(YAxis, {
								allowDecimals: false,
								axisLine: false,
								tickLine: false,
								tick: { fontSize: 11 }
							}),
							/* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(ChartTooltip, {}) }),
							/* @__PURE__ */ jsx(Area, {
								type: "monotone",
								dataKey: "orders",
								name: "Orders",
								stroke: "#2563EB",
								strokeWidth: 2,
								fill: "url(#ordersChartGradient)"
							})
						]
					})
				})
			})
		}), /* @__PURE__ */ jsx(ChartCard, {
			title: "Lead Chart",
			kicker: "Last 8 days",
			icon: ClipboardList,
			children: /* @__PURE__ */ jsx("div", {
				className: "h-[240px] lg:h-[300px]",
				children: /* @__PURE__ */ jsx(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ jsxs(LineChart, {
						data: metrics.salesGrowth,
						children: [
							/* @__PURE__ */ jsx(CartesianGrid, {
								vertical: false,
								stroke: "#e5e7eb",
								strokeDasharray: "3 3"
							}),
							/* @__PURE__ */ jsx(XAxis, {
								dataKey: "label",
								axisLine: false,
								tickLine: false,
								tick: { fontSize: 11 }
							}),
							/* @__PURE__ */ jsx(YAxis, {
								allowDecimals: false,
								axisLine: false,
								tickLine: false,
								tick: { fontSize: 11 }
							}),
							/* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(ChartTooltip, {}) }),
							/* @__PURE__ */ jsx(Line, {
								type: "monotone",
								dataKey: "leads",
								name: "Leads",
								stroke: "#16A34A",
								strokeWidth: 2,
								dot: {
									r: 3,
									strokeWidth: 2
								},
								activeDot: { r: 5 }
							})
						]
					})
				})
			})
		})]
	});
}
function CommerceInsights({ data }) {
	const topProducts = getTopProducts(data.subscriptions);
	const activities = getRecentActivities(data);
	return /* @__PURE__ */ jsxs("div", {
		className: "mb-24 grid gap-18 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]",
		children: [/* @__PURE__ */ jsx(ChartCard, {
			title: "Top selling products",
			kicker: "By active subscription units",
			icon: PackageCheck,
			children: /* @__PURE__ */ jsx("div", {
				className: "grid gap-10",
				children: topProducts.map((product, index) => /* @__PURE__ */ jsxs("div", {
					className: "admin-product-rank-row",
					children: [
						/* @__PURE__ */ jsx("span", { children: index + 1 }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", { children: product.name }), /* @__PURE__ */ jsxs("small", { children: [product.units, " units in active or pending plans"] })] }),
						/* @__PURE__ */ jsxs("strong", { children: [product.share, "%"] })
					]
				}, product.name))
			})
		}), /* @__PURE__ */ jsx(ChartCard, {
			title: "Recent activities",
			kicker: "Live commerce feed",
			icon: Activity,
			children: /* @__PURE__ */ jsx("div", {
				className: "grid gap-10",
				children: activities.map((activity) => /* @__PURE__ */ jsxs("div", {
					className: "admin-activity-row",
					children: [
						/* @__PURE__ */ jsx("span", { className: `admin-activity-dot admin-activity-dot-${activity.tone}` }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", { children: activity.title }), /* @__PURE__ */ jsx("small", { children: activity.meta })] }),
						/* @__PURE__ */ jsx("time", { children: activity.time })
					]
				}, `${activity.type}-${activity.time}-${activity.title}`))
			})
		})]
	});
}
function OrdersPanel({ orders, commerceOrders, pendingOrders, isBusy, onDeliver, onCommerceStatusChange }) {
	const [activeFilter, setActiveFilter] = useState("View orders");
	const filteredCommerceOrders = useMemo(() => {
		switch (activeFilter) {
			case "Accept / reject orders": return commerceOrders.filter((o) => String(o.status).toLowerCase() === "pending");
			case "Assign delivery partner": return commerceOrders.filter((o) => String(o.status).toLowerCase() === "processing");
			case "Update status": return commerceOrders.filter((o) => [
				"processing",
				"dispatched",
				"delivered"
			].includes(String(o.status).toLowerCase()));
			case "Refund management": return commerceOrders.filter((o) => [
				"cancelled",
				"refunded",
				"rejected"
			].includes(String(o.status).toLowerCase()));
			default: return commerceOrders;
		}
	}, [commerceOrders, activeFilter]);
	const displayedOrders = orders.slice(0, 40);
	const displayedCommerceOrders = filteredCommerceOrders.slice(0, 40);
	const pendingCommerceOrders = commerceOrders.filter((order) => [
		"pending",
		"processing",
		"accepted"
	].includes(String(order.status)));
	return /* @__PURE__ */ jsxs(Panel, {
		title: "Order Management",
		kicker: `${commerceOrders.length} customer / ${orders.length} dispatch`,
		actionIcon: ShoppingCart,
		actionText: `${pendingCommerceOrders.length + pendingOrders.length} pending`,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "admin-product-readiness-grid mb-16",
				children: [
					/* @__PURE__ */ jsx(IntelCard, {
						label: "Customer orders",
						value: commerceOrders.length,
						detail: "Checkout and app orders from the commerce order table"
					}),
					/* @__PURE__ */ jsx(RiskCard, {
						label: "Customer pending",
						value: pendingCommerceOrders.length,
						detail: "Orders waiting for acceptance, packing, or assignment",
						tone: pendingCommerceOrders.length ? "warning" : "safe"
					}),
					/* @__PURE__ */ jsx(IntelCard, {
						label: "Dispatch orders",
						value: orders.length,
						detail: "Subscription delivery orders generated by dispatch"
					}),
					/* @__PURE__ */ jsx(RiskCard, {
						label: "Dispatch pending",
						value: pendingOrders.length,
						detail: "Daily delivery orders still open",
						tone: pendingOrders.length ? "warning" : "safe"
					})
				]
			}),
			/* @__PURE__ */ jsx(ModuleControlStrip, {
				controls: [
					"View orders",
					"Accept / reject orders",
					"Assign delivery partner",
					"Update status",
					"Generate invoice",
					"Refund management"
				],
				activeControl: activeFilter,
				onControlSelect: setActiveFilter
			}),
			filteredCommerceOrders.length ? /* @__PURE__ */ jsxs("section", {
				className: "mb-18",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "admin-section-heading",
						children: [/* @__PURE__ */ jsx("h3", { children: "Customer orders" }), /* @__PURE__ */ jsxs("span", { children: [displayedCommerceOrders.length, " shown"] })]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "admin-table-wrap hidden md:block",
						children: /* @__PURE__ */ jsxs("table", {
							className: "admin-table",
							children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", { children: "Order" }),
								/* @__PURE__ */ jsx("th", { children: "Customer" }),
								/* @__PURE__ */ jsx("th", { children: "Items" }),
								/* @__PURE__ */ jsx("th", { children: "Total" }),
								/* @__PURE__ */ jsx("th", { children: "Created" }),
								/* @__PURE__ */ jsx("th", { children: "Status" }),
								/* @__PURE__ */ jsx("th", {
									className: "text-right",
									children: "Actions"
								})
							] }) }), /* @__PURE__ */ jsx("tbody", { children: displayedCommerceOrders.map((order) => {
								const itemCount = order.items?.reduce((total, item) => total + Number(item.quantity || 0), 0) ?? 0;
								const isPending = String(order.status).toLowerCase() === "pending";
								return /* @__PURE__ */ jsxs("tr", { children: [
									/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", {
										className: "font-mono text-[12px] font-semibold text-charcoal",
										children: order.orderNumber || order.id.slice(0, 8)
									}) }),
									/* @__PURE__ */ jsxs("td", { children: [/* @__PURE__ */ jsx("span", {
										className: "font-semibold text-charcoal",
										children: order.user?.name || "Customer"
									}), /* @__PURE__ */ jsx("p", {
										className: "mt-2 text-[12px] text-pewter",
										children: order.user?.phone || order.user?.email || "Contact pending"
									})] }),
									/* @__PURE__ */ jsx("td", { children: itemCount || order.items?.length || 0 }),
									/* @__PURE__ */ jsx("td", { children: formatCurrency(order.total) }),
									/* @__PURE__ */ jsx("td", { children: formatDateTime(order.createdAt) }),
									/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(StatusPill, {
										tone: statusTone(String(order.status)),
										children: order.status
									}) }),
									/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("div", {
										className: "flex items-center justify-end gap-8",
										children: isPending ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("button", {
											type: "button",
											disabled: isBusy,
											onClick: () => void onCommerceStatusChange(order.id, "processing"),
											className: "admin-primary-button h-32 px-10 text-[12px]",
											children: [/* @__PURE__ */ jsx(Check, {
												className: "h-[12px] w-[12px]",
												strokeWidth: 1.9
											}), "Accept"]
										}), /* @__PURE__ */ jsx("button", {
											type: "button",
											disabled: isBusy,
											onClick: () => void onCommerceStatusChange(order.id, "cancelled"),
											className: "admin-danger-button h-32 px-10 text-[12px]",
											children: "Reject"
										})] }) : /* @__PURE__ */ jsx("span", {
											className: "text-[12px] font-semibold text-pewter",
											children: "Processed"
										})
									}) })
								] }, order.id);
							}) })]
						})
					}),
					/* @__PURE__ */ jsx("div", {
						className: "grid gap-10 md:hidden",
						children: displayedCommerceOrders.map((order) => {
							const isPending = String(order.status).toLowerCase() === "pending";
							return /* @__PURE__ */ jsxs("div", {
								className: "admin-data-row border-l-[4px] border-l-vivid-lime p-14",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex flex-wrap items-start justify-between gap-8",
										children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
											className: "font-mono text-[12px] font-semibold text-charcoal",
											children: order.orderNumber || order.id.slice(0, 8)
										}), /* @__PURE__ */ jsx("p", {
											className: "mt-3 text-[14px] font-semibold text-charcoal",
											children: order.user?.name || "Customer"
										})] }), /* @__PURE__ */ jsx(StatusPill, {
											tone: statusTone(String(order.status)),
											children: order.status
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "mt-12 grid grid-cols-2 gap-8",
										children: [
											/* @__PURE__ */ jsx(Field, {
												label: "Total",
												value: formatCurrency(order.total)
											}),
											/* @__PURE__ */ jsx(Field, {
												label: "Created",
												value: formatDateTime(order.createdAt)
											}),
											/* @__PURE__ */ jsx(Field, {
												label: "Contact",
												value: order.user?.phone || order.user?.email || "Pending"
											}),
											/* @__PURE__ */ jsx(Field, {
												label: "Items",
												value: String(order.items?.length || 0)
											})
										]
									}),
									isPending && /* @__PURE__ */ jsxs("div", {
										className: "mt-12 flex gap-8",
										children: [/* @__PURE__ */ jsx("button", {
											type: "button",
											disabled: isBusy,
											onClick: () => void onCommerceStatusChange(order.id, "processing"),
											className: "admin-primary-button h-32 px-10 text-[12px] flex-1",
											children: "Accept"
										}), /* @__PURE__ */ jsx("button", {
											type: "button",
											disabled: isBusy,
											onClick: () => void onCommerceStatusChange(order.id, "cancelled"),
											className: "admin-danger-button h-32 px-10 text-[12px] flex-1",
											children: "Reject"
										})]
									})
								]
							}, order.id);
						})
					})
				]
			}) : /* @__PURE__ */ jsx(EmptyState, { title: "No customer orders found" }),
			orders.length ? /* @__PURE__ */ jsxs("section", { children: [
				/* @__PURE__ */ jsxs("div", {
					className: "admin-section-heading",
					children: [/* @__PURE__ */ jsx("h3", { children: "Dispatch orders" }), /* @__PURE__ */ jsxs("span", { children: [displayedOrders.length, " shown"] })]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "admin-table-wrap hidden md:block",
					children: /* @__PURE__ */ jsxs("table", {
						className: "admin-table",
						children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
							/* @__PURE__ */ jsx("th", { children: "Order" }),
							/* @__PURE__ */ jsx("th", { children: "Customer" }),
							/* @__PURE__ */ jsx("th", { children: "Address" }),
							/* @__PURE__ */ jsx("th", { children: "Date" }),
							/* @__PURE__ */ jsx("th", { children: "Status" }),
							/* @__PURE__ */ jsx("th", {
								className: "text-right",
								children: "Action"
							})
						] }) }), /* @__PURE__ */ jsx("tbody", { children: displayedOrders.map((order) => /* @__PURE__ */ jsxs("tr", { children: [
							/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", {
								className: "font-mono text-[12px] font-semibold text-charcoal",
								children: order.id.slice(0, 8)
							}) }),
							/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", {
								className: "font-semibold text-charcoal",
								children: order.subscription?.user?.name || "Customer"
							}) }),
							/* @__PURE__ */ jsx("td", { children: order.subscription?.user?.addresses?.[0]?.streetAddress || "Address pending" }),
							/* @__PURE__ */ jsx("td", { children: formatDate(order.deliveryDate) }),
							/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(StatusPill, {
								tone: statusTone(order.status),
								children: order.status
							}) }),
							/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("div", {
								className: "flex justify-end",
								children: order.status === "pending" ? /* @__PURE__ */ jsxs("button", {
									type: "button",
									disabled: isBusy,
									onClick: () => onDeliver(order.id),
									className: "admin-primary-button h-32 px-10 text-[12px]",
									children: [/* @__PURE__ */ jsx(PackageCheck, {
										className: "h-[12px] w-[12px]",
										strokeWidth: 1.9
									}), "Mark Delivered"]
								}) : /* @__PURE__ */ jsx("span", {
									className: "text-[12px] font-semibold text-forest-ink",
									children: "Closed"
								})
							}) })
						] }, order.id)) })]
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "grid gap-10 md:hidden",
					children: displayedOrders.map((order) => /* @__PURE__ */ jsxs("div", {
						className: "admin-data-row border-l-[4px] border-l-sky-card p-14",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex flex-wrap items-start justify-between gap-8",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
									className: "text-[14px] font-semibold text-charcoal",
									children: order.subscription?.user?.name || "Customer"
								}), /* @__PURE__ */ jsx("p", {
									className: "mt-3 text-[12px] text-graphite",
									children: order.subscription?.user?.addresses?.[0]?.streetAddress || "Address pending"
								})] }), /* @__PURE__ */ jsx(StatusPill, {
									tone: statusTone(order.status),
									children: order.status
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-12 grid grid-cols-2 gap-8",
								children: [/* @__PURE__ */ jsx(Field, {
									label: "Delivery date",
									value: formatDate(order.deliveryDate)
								}), /* @__PURE__ */ jsx(Field, {
									label: "Quantity",
									value: String(order.quantity)
								})]
							}),
							order.status === "pending" ? /* @__PURE__ */ jsxs("button", {
								type: "button",
								disabled: isBusy,
								onClick: () => onDeliver(order.id),
								className: "admin-primary-button mt-14 h-34 w-full px-11 text-[12px]",
								children: [/* @__PURE__ */ jsx(PackageCheck, {
									className: "h-[12px] w-[12px]",
									strokeWidth: 1.9
								}), "Mark Delivered"]
							}) : null
						]
					}, order.id))
				})
			] }) : /* @__PURE__ */ jsx("div", {
				className: "mt-12",
				children: /* @__PURE__ */ jsx(EmptyState, { title: "No dispatch orders found" })
			})
		]
	});
}
var emptyCategoryForm = {
	name: "",
	slug: "",
	description: "",
	imageUrl: "",
	isActive: true,
	sortOrder: "0"
};
function slugFromName(value) {
	return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function CategoriesPanel({ categories, products, isBusy, onCreate, onUpdate, onDelete }) {
	const [editingId, setEditingId] = useState("");
	const [form, setForm] = useState(emptyCategoryForm);
	const isEditing = Boolean(editingId);
	const categoryProductCounts = useMemo(() => {
		const counts = /* @__PURE__ */ new Map();
		for (const product of products) {
			const categoryId = product.categoryId || "";
			if (!categoryId) continue;
			counts.set(categoryId, (counts.get(categoryId) || 0) + 1);
		}
		return counts;
	}, [products]);
	const activeCategories = categories.filter((category) => category.isActive);
	const archivedCategories = categories.length - activeCategories.length;
	function updateField(key, value) {
		setForm((current) => ({
			...current,
			[key]: value,
			...key === "name" && !isEditing ? { slug: slugFromName(String(value)) } : {}
		}));
	}
	function resetForm() {
		setEditingId("");
		setForm(emptyCategoryForm);
	}
	function startEdit(category) {
		setEditingId(category.id);
		setForm({
			name: category.name,
			slug: category.slug,
			description: category.description || "",
			imageUrl: category.imageUrl || "",
			isActive: category.isActive,
			sortOrder: String(category.sortOrder ?? 0)
		});
	}
	async function handleSubmit(event) {
		event.preventDefault();
		const payload = {
			name: form.name.trim(),
			slug: slugFromName(form.slug || form.name),
			description: form.description?.trim() || "",
			imageUrl: form.imageUrl?.trim() || "",
			isActive: form.isActive,
			sortOrder: Number(form.sortOrder || 0)
		};
		if (isEditing) await onUpdate(editingId, payload);
		else await onCreate(payload);
		resetForm();
	}
	async function handleArchive(category) {
		if (!window.confirm(`Archive ${category.name}? Products will remain available.`)) return;
		await onDelete(category.id);
		if (editingId === category.id) resetForm();
	}
	return /* @__PURE__ */ jsxs(Panel, {
		title: "Categories",
		kicker: `${categories.length} catalog groups`,
		actionIcon: Tags,
		actionText: "Product taxonomy",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "admin-intel-grid mb-16",
				children: [
					/* @__PURE__ */ jsx(IntelCard, {
						label: "Active categories",
						value: activeCategories.length,
						detail: "Shown in commerce flows"
					}),
					/* @__PURE__ */ jsx(IntelCard, {
						label: "Archived",
						value: archivedCategories,
						detail: "Hidden from product assignment"
					}),
					/* @__PURE__ */ jsx(IntelCard, {
						label: "Unassigned products",
						value: products.filter((product) => !product.categoryId).length,
						detail: "Need catalog cleanup"
					})
				]
			}),
			/* @__PURE__ */ jsxs("form", {
				onSubmit: handleSubmit,
				className: "admin-form-card mb-16",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-14 flex flex-col gap-10 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
						className: "text-caption font-semibold uppercase tracking-[0.18em] text-forest-ink",
						children: isEditing ? "Edit category" : "New category"
					}), /* @__PURE__ */ jsx("h3", {
						className: "mt-2 font-reckless text-[28px] font-medium leading-none text-charcoal",
						children: isEditing ? "Refine catalog grouping" : "Create production category"
					})] }), isEditing ? /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: resetForm,
						className: "admin-secondary-button",
						children: [/* @__PURE__ */ jsx(X, {
							className: "h-[12px] w-[12px]",
							strokeWidth: 1.9
						}), "Cancel"]
					}) : null]
				}), /* @__PURE__ */ jsxs("div", {
					className: "grid gap-10 md:grid-cols-2 xl:grid-cols-6",
					children: [
						/* @__PURE__ */ jsx("input", {
							required: true,
							value: form.name,
							onChange: (event) => updateField("name", event.target.value),
							placeholder: "Category name",
							className: "admin-input xl:col-span-2"
						}),
						/* @__PURE__ */ jsx("input", {
							required: true,
							value: form.slug,
							onChange: (event) => updateField("slug", event.target.value),
							placeholder: "category-slug",
							className: "admin-input xl:col-span-2"
						}),
						/* @__PURE__ */ jsx("input", {
							type: "number",
							value: form.sortOrder,
							onChange: (event) => updateField("sortOrder", event.target.value),
							placeholder: "Sort order",
							className: "admin-input"
						}),
						/* @__PURE__ */ jsxs("label", {
							className: "admin-checkbox-field",
							children: [/* @__PURE__ */ jsx("input", {
								type: "checkbox",
								checked: form.isActive,
								onChange: (event) => updateField("isActive", event.target.checked)
							}), "Active"]
						}),
						/* @__PURE__ */ jsx("input", {
							value: form.imageUrl,
							onChange: (event) => updateField("imageUrl", event.target.value),
							placeholder: "Image URL",
							className: "admin-input md:col-span-2 xl:col-span-3"
						}),
						/* @__PURE__ */ jsx("textarea", {
							value: form.description,
							onChange: (event) => updateField("description", event.target.value),
							placeholder: "Category description",
							className: "admin-textarea md:col-span-2 xl:col-span-3"
						}),
						/* @__PURE__ */ jsxs("button", {
							type: "submit",
							disabled: isBusy,
							className: "admin-primary-button h-38 xl:col-span-2",
							children: [isEditing ? /* @__PURE__ */ jsx(Pencil, {
								className: "h-[12px] w-[12px]",
								strokeWidth: 1.9
							}) : /* @__PURE__ */ jsx(Plus, {
								className: "h-[12px] w-[12px]",
								strokeWidth: 1.9
							}), isEditing ? "Save Category" : "Add Category"]
						})
					]
				})]
			}),
			categories.length ? /* @__PURE__ */ jsx("div", {
				className: "grid gap-12 md:grid-cols-2 2xl:grid-cols-3",
				children: categories.map((category) => /* @__PURE__ */ jsxs("article", {
					className: "admin-category-card",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-start justify-between gap-10",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
								className: "text-[12px] font-semibold uppercase tracking-[0.14em] text-forest-ink",
								children: category.slug
							}), /* @__PURE__ */ jsx("h3", { children: category.name })] }), /* @__PURE__ */ jsx(StatusPill, {
								tone: category.isActive ? "success" : "neutral",
								children: category.isActive ? "Active" : "Archived"
							})]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-10 text-[13px] leading-relaxed text-graphite",
							children: category.description || "No category description added yet."
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-14 grid grid-cols-2 gap-8",
							children: [/* @__PURE__ */ jsx(Field, {
								label: "Products",
								value: String(categoryProductCounts.get(category.id) || 0)
							}), /* @__PURE__ */ jsx(Field, {
								label: "Sort order",
								value: String(category.sortOrder ?? 0)
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-16 grid grid-cols-2 gap-8",
							children: [/* @__PURE__ */ jsxs("button", {
								type: "button",
								disabled: isBusy,
								onClick: () => startEdit(category),
								className: "admin-secondary-button",
								children: [/* @__PURE__ */ jsx(Pencil, {
									className: "h-[12px] w-[12px]",
									strokeWidth: 1.9
								}), "Edit"]
							}), /* @__PURE__ */ jsxs("button", {
								type: "button",
								disabled: isBusy || !category.isActive,
								onClick: () => void handleArchive(category),
								className: "admin-danger-button",
								children: [/* @__PURE__ */ jsx(Trash2, {
									className: "h-[12px] w-[12px]",
									strokeWidth: 1.9
								}), "Archive"]
							})]
						})
					]
				}, category.id))
			}) : /* @__PURE__ */ jsx(EmptyState, { title: "No categories configured yet" })
		]
	});
}
function CustomersPanel({ customers, subscriptions }) {
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const subscriptionsByUser = /* @__PURE__ */ new Map();
	for (const subscription of subscriptions) {
		const existing = subscriptionsByUser.get(subscription.userId) || [];
		existing.push(subscription);
		subscriptionsByUser.set(subscription.userId, existing);
	}
	const customerProfiles = customers.map((customer) => {
		const customerSubscriptions = subscriptionsByUser.get(customer.id) || [];
		const activePlans = customerSubscriptions.filter((subscription) => subscription.status === "active");
		const pendingPlans = customerSubscriptions.filter((subscription) => subscription.status === "pending");
		const pausedPlans = customerSubscriptions.filter((subscription) => subscription.status === "paused");
		const createdAt = customer.createdAt ? new Date(customer.createdAt) : null;
		const isNew = createdAt != null && Date.now() - createdAt.getTime() < 336 * 60 * 60 * 1e3;
		const needsAttention = pendingPlans.length > 0 || pausedPlans.length > 0 || !customer.addresses?.length;
		return {
			customer,
			activePlans,
			pendingPlans,
			pausedPlans,
			totalPlans: customerSubscriptions.length,
			isNew,
			needsAttention
		};
	}).filter((profile) => {
		const haystack = [
			profile.customer.name,
			profile.customer.phone,
			profile.customer.addresses?.map((address) => address.streetAddress).join(" ")
		].join(" ").toLowerCase();
		const matchesQuery = query ? haystack.includes(query.toLowerCase()) : true;
		const matchesStatus = statusFilter === "all" ? true : statusFilter === "active" ? profile.activePlans.length > 0 : statusFilter === "attention" ? profile.needsAttention : profile.isNew;
		return matchesQuery && matchesStatus;
	});
	const activeCustomers = customerProfiles.filter((profile) => profile.activePlans.length > 0);
	const attentionCustomers = customerProfiles.filter((profile) => profile.needsAttention);
	const averagePlans = customers.length === 0 ? 0 : Math.round(subscriptions.length / customers.length * 10) / 10;
	return /* @__PURE__ */ jsxs(Panel, {
		title: "Customer Management",
		kicker: `${customers.length} customers`,
		actionIcon: Users,
		actionText: "Profiles and order history",
		children: [
			/* @__PURE__ */ jsx(ModuleControlStrip, { controls: [
				"Customer list",
				"Customer profile",
				"Order history",
				"Addresses",
				"Loyalty points",
				"Support tickets"
			] }),
			/* @__PURE__ */ jsxs("div", {
				className: "admin-intel-grid mb-16",
				children: [
					/* @__PURE__ */ jsx(IntelCard, {
						label: "Active customers",
						value: activeCustomers.length,
						detail: "Have at least one live subscription"
					}),
					/* @__PURE__ */ jsx(IntelCard, {
						label: "Need attention",
						value: attentionCustomers.length,
						detail: "Pending, paused, or missing address"
					}),
					/* @__PURE__ */ jsx(IntelCard, {
						label: "Avg plans",
						value: averagePlans,
						detail: "Subscriptions per customer"
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "admin-filter-bar mb-16",
				children: [/* @__PURE__ */ jsxs("label", {
					className: "admin-filter-search",
					children: [/* @__PURE__ */ jsx(Search, {
						className: "h-[14px] w-[14px]",
						strokeWidth: 1.9
					}), /* @__PURE__ */ jsx("input", {
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: "Search name, phone, or address"
					})]
				}), /* @__PURE__ */ jsxs("select", {
					value: statusFilter,
					onChange: (event) => setStatusFilter(event.target.value),
					className: "admin-table-select",
					children: [
						/* @__PURE__ */ jsx("option", {
							value: "all",
							children: "All customers"
						}),
						/* @__PURE__ */ jsx("option", {
							value: "active",
							children: "Active customers"
						}),
						/* @__PURE__ */ jsx("option", {
							value: "attention",
							children: "Needs attention"
						}),
						/* @__PURE__ */ jsx("option", {
							value: "new",
							children: "New customers"
						})
					]
				})]
			}),
			customers.length ? /* @__PURE__ */ jsx("div", {
				className: "grid gap-12",
				children: customerProfiles.map((profile) => /* @__PURE__ */ jsxs("article", {
					className: "admin-customer-card",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex flex-wrap items-center gap-8",
									children: [
										/* @__PURE__ */ jsx("h3", { children: profile.customer.name }),
										profile.isNew ? /* @__PURE__ */ jsx(StatusPill, {
											tone: "success",
											children: "New"
										}) : null,
										profile.needsAttention ? /* @__PURE__ */ jsx(StatusPill, {
											tone: "warning",
											children: "Review"
										}) : null
									]
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-4 text-[13px] text-graphite",
									children: profile.customer.phone
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-6 text-[13px] leading-relaxed text-pewter",
									children: profile.customer.addresses?.[0]?.streetAddress || "Address missing"
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "admin-customer-metrics",
							children: [
								/* @__PURE__ */ jsx(Field, {
									label: "Active",
									value: String(profile.activePlans.length)
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Pending",
									value: String(profile.pendingPlans.length)
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Paused",
									value: String(profile.pausedPlans.length)
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Addresses",
									value: String(profile.customer.addresses?.length ?? 0)
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "admin-customer-products",
							children: [(subscriptionsByUser.get(profile.customer.id) || []).slice(0, 3).map((subscription) => /* @__PURE__ */ jsx("span", { children: titleCase(subscription.productType) }, subscription.id)), profile.totalPlans === 0 ? /* @__PURE__ */ jsx("span", { children: "No plans yet" }) : null]
						})
					]
				}, profile.customer.id))
			}) : /* @__PURE__ */ jsx(EmptyState, { title: "No customers found" })
		]
	});
}
function DeliveryPartnersPanel({ partners }) {
	return /* @__PURE__ */ jsxs(Panel, {
		title: "Delivery Partner Module",
		kicker: `${partners.length} partners`,
		actionIcon: Truck,
		actionText: "Partner operations",
		children: [/* @__PURE__ */ jsx(ModuleControlStrip, { controls: [
			"Add delivery partner",
			"Partner verification",
			"Live tracking",
			"Assign orders",
			"Earnings dashboard",
			"Delivery performance",
			"Availability status"
		] }), partners.length ? /* @__PURE__ */ jsx("div", {
			className: "grid gap-10 md:grid-cols-2 xl:grid-cols-3",
			children: partners.map((partner) => /* @__PURE__ */ jsxs("div", {
				className: "admin-data-row border-l-[4px] border-l-forest-ink p-14",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-[14px] font-semibold text-charcoal",
						children: partner.name
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-3 text-[12px] text-graphite",
						children: partner.phone
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-12 flex items-center justify-between gap-8",
						children: [/* @__PURE__ */ jsx(StatusPill, {
							tone: "success",
							children: "Verified"
						}), /* @__PURE__ */ jsx("span", {
							className: "text-[12px] font-semibold text-pewter",
							children: "Available"
						})]
					})
				]
			}, partner.id))
		}) : /* @__PURE__ */ jsx(EmptyState, { title: "No delivery partners found" })]
	});
}
function ProductionArchitecturePanel() {
	const tableCount = databaseDomains.reduce((total, domain) => total + domain.tables.length, 0);
	const apiCount = productionApiGroups.reduce((total, group) => total + Number(group.count.replace(/\D/g, "") || 0), 0);
	return /* @__PURE__ */ jsxs(Panel, {
		title: "Production Architecture",
		kicker: "Full-stack operating model",
		actionIcon: Database,
		actionText: "25-35 table target",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "admin-architecture-flow mb-16",
				children: productionArchitectureLayers.map((layer) => {
					const Icon = layer.icon;
					return /* @__PURE__ */ jsxs("article", {
						className: "admin-architecture-node",
						children: [/* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(Icon, {
							className: "h-[17px] w-[17px]",
							strokeWidth: 1.9
						}) }), /* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx("p", { children: layer.title }),
							/* @__PURE__ */ jsx("h3", { children: layer.detail }),
							/* @__PURE__ */ jsx("div", {
								className: "admin-chip-list",
								children: layer.items.map((item) => /* @__PURE__ */ jsx("span", { children: item }, item))
							})
						] })]
					}, layer.title);
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "admin-role-summary-grid mb-16",
				children: [
					/* @__PURE__ */ jsx(IntelCard, {
						label: "Database tables",
						value: `${tableCount}+`,
						detail: "Modeled by domain"
					}),
					/* @__PURE__ */ jsx(IntelCard, {
						label: "API endpoints",
						value: `${apiCount}+`,
						detail: "Production surface area"
					}),
					/* @__PURE__ */ jsx(IntelCard, {
						label: "RBAC roles",
						value: "6",
						detail: "Super Admin, Admin, Manager, Support, Delivery Partner, Customer"
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "admin-architecture-section mb-16",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "admin-role-section-head",
					children: [/* @__PURE__ */ jsx("p", { children: "Database domains" }), /* @__PURE__ */ jsx("h3", { children: "User, product, order, payment, delivery, marketing, support, admin, analytics" })]
				}), /* @__PURE__ */ jsx("div", {
					className: "admin-db-domain-grid",
					children: databaseDomains.map((domain) => /* @__PURE__ */ jsxs("article", {
						className: "admin-db-domain-card",
						children: [/* @__PURE__ */ jsx("h4", { children: domain.title }), /* @__PURE__ */ jsx("div", {
							className: "admin-chip-list",
							children: domain.tables.map((table) => /* @__PURE__ */ jsx("span", { children: table }, table))
						})]
					}, domain.title))
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid gap-16 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]",
				children: [/* @__PURE__ */ jsxs("section", {
					className: "admin-architecture-section",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "admin-role-section-head",
						children: [/* @__PURE__ */ jsx("p", { children: "Infrastructure" }), /* @__PURE__ */ jsx("h3", { children: "Deployment-ready stack" })]
					}), /* @__PURE__ */ jsx("div", {
						className: "admin-infra-grid",
						children: infrastructureItems.map((item) => {
							const Icon = item.icon;
							return /* @__PURE__ */ jsxs("article", {
								className: "admin-infra-card",
								children: [/* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(Icon, {
									className: "h-[15px] w-[15px]",
									strokeWidth: 1.9
								}) }), /* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx("p", { children: item.title }),
									/* @__PURE__ */ jsx("strong", { children: item.value }),
									/* @__PURE__ */ jsx("small", { children: item.detail })
								] })]
							}, item.title);
						})
					})]
				}), /* @__PURE__ */ jsxs("section", {
					className: "admin-architecture-section",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "admin-role-section-head",
						children: [/* @__PURE__ */ jsx("p", { children: "API inventory" }), /* @__PURE__ */ jsx("h3", { children: "120+ endpoint production target" })]
					}), /* @__PURE__ */ jsx("div", {
						className: "admin-api-grid",
						children: productionApiGroups.map((group) => /* @__PURE__ */ jsxs("article", {
							className: "admin-api-card",
							children: [
								/* @__PURE__ */ jsx("p", { children: group.title }),
								/* @__PURE__ */ jsx("strong", { children: group.count }),
								/* @__PURE__ */ jsx("span", { children: group.detail })
							]
						}, group.title))
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-16 grid gap-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ jsxs("section", {
					className: "admin-architecture-section",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "admin-role-section-head",
						children: [/* @__PURE__ */ jsx("p", { children: "Security must-haves" }), /* @__PURE__ */ jsx("h3", { children: "Authentication, authorization, and protection" })]
					}), /* @__PURE__ */ jsx("div", {
						className: "admin-security-group-grid",
						children: securityGroups.map((group) => /* @__PURE__ */ jsxs("article", {
							className: "admin-security-group-card",
							children: [/* @__PURE__ */ jsx("h4", { children: group.title }), /* @__PURE__ */ jsx("div", {
								className: "admin-chip-list",
								children: group.controls.map((control) => /* @__PURE__ */ jsx("span", { children: control }, control))
							})]
						}, group.title))
					})]
				}), /* @__PURE__ */ jsxs("section", {
					className: "admin-architecture-section",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "admin-role-section-head",
						children: [/* @__PURE__ */ jsx("p", { children: "Development order" }), /* @__PURE__ */ jsx("h3", { children: "Build sequence" })]
					}), /* @__PURE__ */ jsx("ol", {
						className: "admin-dev-order",
						children: developmentOrder.map((item, index) => /* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsx("span", { children: String(index + 1).padStart(2, "0") }), item] }, item))
					})]
				})]
			})
		]
	});
}
function UsersRolesPanel({ users, rolePermissions }) {
	const roleCounts = users.reduce((counts, user) => {
		counts[user.role] = (counts[user.role] || 0) + 1;
		return counts;
	}, {});
	const rolePermissionMap = rolePermissions.reduce((permissions, permission) => {
		permissions[permission.role] = permissions[permission.role] || [];
		permissions[permission.role].push(permission);
		return permissions;
	}, {});
	const operationalUsers = adminRoleBlueprints.reduce((total, blueprint) => total + (roleCounts[blueprint.role] || 0), 0);
	const configuredRoles = adminRoleBlueprints.filter((blueprint) => (rolePermissionMap[blueprint.role] || []).length > 0).length;
	return /* @__PURE__ */ jsxs(Panel, {
		title: "Users & Roles",
		kicker: `${adminRoleBlueprints.length} production panels`,
		actionIcon: UserCog,
		actionText: "Permissions",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "admin-role-summary-grid mb-16",
			children: [
				/* @__PURE__ */ jsx(IntelCard, {
					label: "Operational users",
					value: operationalUsers,
					detail: "Users assigned to admin-side roles"
				}),
				/* @__PURE__ */ jsx(IntelCard, {
					label: "Configured roles",
					value: `${configuredRoles}/${adminRoleBlueprints.length}`,
					detail: "Roles with backend permission rows"
				}),
				/* @__PURE__ */ jsx(IntelCard, {
					label: "Customer users",
					value: roleCounts.consumer || 0,
					detail: "Consumers stay out of admin panels"
				})
			]
		}), /* @__PURE__ */ jsx("div", {
			className: "admin-role-panel-grid",
			children: adminRoleBlueprints.map((blueprint) => {
				const Icon = blueprint.icon;
				const permissions = rolePermissionMap[blueprint.role] || [];
				const moduleNames = permissions.length ? Array.from(new Set(permissions.map((permission) => titleCase(permission.module)))) : blueprint.modules;
				const controlState = {
					View: permissions.length > 0 ? permissions.some((permission) => permission.canView) : blueprint.controls.includes("View"),
					Create: permissions.length > 0 ? permissions.some((permission) => permission.canCreate) : blueprint.controls.includes("Create"),
					Edit: permissions.length > 0 ? permissions.some((permission) => permission.canEdit) : blueprint.controls.includes("Edit"),
					Delete: permissions.length > 0 ? permissions.some((permission) => permission.canDelete) : blueprint.controls.includes("Delete"),
					Export: permissions.length > 0 ? permissions.some((permission) => permission.canExport) : blueprint.controls.includes("Export")
				};
				return /* @__PURE__ */ jsxs("section", {
					className: "admin-role-production-card",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "admin-role-panel-header",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "admin-role-icon",
									children: /* @__PURE__ */ jsx(Icon, {
										className: "h-[18px] w-[18px]",
										strokeWidth: 1.9
									})
								}),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", { children: blueprint.owner }), /* @__PURE__ */ jsx("h3", { children: blueprint.title })] }),
								/* @__PURE__ */ jsx(StatusPill, {
									tone: blueprint.risk === "Critical" ? "danger" : blueprint.risk === "High" ? "warning" : "success",
									children: blueprint.risk
								})
							]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "admin-role-description",
							children: blueprint.subtitle
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "admin-role-metric-row",
							children: [/* @__PURE__ */ jsx(Field, {
								label: "Users",
								value: String(roleCounts[blueprint.role] || 0)
							}), /* @__PURE__ */ jsx(Field, {
								label: "Permission rows",
								value: permissions.length ? String(permissions.length) : "Blueprint"
							})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "admin-role-permission-grid",
							"aria-label": `${blueprint.title} controls`,
							children: adminControlLabels.map((control) => /* @__PURE__ */ jsxs("span", {
								className: controlState[control] ? "admin-role-control-enabled" : "admin-role-control-disabled",
								children: [/* @__PURE__ */ jsx(Check, {
									className: "h-[12px] w-[12px]",
									strokeWidth: 2
								}), control]
							}, control))
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "admin-role-scope",
							children: [/* @__PURE__ */ jsx("p", { children: "Panel scope" }), /* @__PURE__ */ jsx("div", { children: moduleNames.slice(0, 8).map((module) => /* @__PURE__ */ jsx("span", { children: module }, module)) })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "admin-role-guardrails",
							children: [/* @__PURE__ */ jsx("p", { children: "Production guardrails" }), /* @__PURE__ */ jsx("ul", { children: blueprint.guardrails.map((guardrail) => /* @__PURE__ */ jsx("li", { children: guardrail }, guardrail)) })]
						})
					]
				}, blueprint.role);
			})
		})]
	});
}
function RoleOperationsPanel({ blueprint, users, rolePermissions, data }) {
	const Icon = blueprint.icon;
	const assignedUsers = users.filter((user) => user.role === blueprint.role);
	const permissions = rolePermissions.filter((permission) => permission.role === blueprint.role);
	const moduleNames = permissions.length ? Array.from(new Set(permissions.map((permission) => titleCase(permission.module)))) : blueprint.modules;
	const workload = getRoleWorkload(blueprint.role, data);
	const controlState = adminControlLabels.reduce((state, control) => {
		const field = permissionControlFields[control];
		state[control] = permissions.length ? permissions.some((permission) => Boolean(permission[field])) : blueprint.controls.includes(control);
		return state;
	}, {
		View: false,
		Create: false,
		Edit: false,
		Delete: false,
		Export: false
	});
	return /* @__PURE__ */ jsxs(Panel, {
		title: `${blueprint.title} Panel`,
		kicker: `${assignedUsers.length} assigned users`,
		actionIcon: Icon,
		actionText: "Role workspace",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "admin-role-dashboard-hero mb-16",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "admin-role-icon",
						children: /* @__PURE__ */ jsx(Icon, {
							className: "h-[20px] w-[20px]",
							strokeWidth: 1.9
						})
					}),
					/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx("p", { children: blueprint.owner }),
						/* @__PURE__ */ jsx("h3", { children: blueprint.title }),
						/* @__PURE__ */ jsx("span", { children: blueprint.subtitle })
					] }),
					/* @__PURE__ */ jsx(StatusPill, {
						tone: blueprint.risk === "Critical" ? "danger" : blueprint.risk === "High" ? "warning" : "success",
						children: blueprint.risk
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "admin-role-summary-grid mb-16",
				children: [
					/* @__PURE__ */ jsx(IntelCard, {
						label: "Assigned users",
						value: assignedUsers.length,
						detail: "Users in this role"
					}),
					/* @__PURE__ */ jsx(IntelCard, {
						label: "Permission rows",
						value: permissions.length || "Blueprint",
						detail: "Backend access rules loaded"
					}),
					/* @__PURE__ */ jsx(IntelCard, {
						label: workload.label,
						value: workload.value,
						detail: workload.detail
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "admin-role-permission-grid mb-16",
				children: adminControlLabels.map((control) => /* @__PURE__ */ jsxs("span", {
					className: controlState[control] ? "admin-role-control-enabled" : "admin-role-control-disabled",
					children: [/* @__PURE__ */ jsx(Check, {
						className: "h-[12px] w-[12px]",
						strokeWidth: 2
					}), control]
				}, control))
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "admin-role-production-card mb-16",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "admin-role-section-head",
					children: [/* @__PURE__ */ jsx("p", { children: "Dashboard workspace" }), /* @__PURE__ */ jsxs("h3", { children: [blueprint.title, " controls"] })]
				}), /* @__PURE__ */ jsx(ModuleControlStrip, { controls: blueprint.dashboardWidgets })]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "admin-role-workspace-grid mb-16",
				children: [
					/* @__PURE__ */ jsxs("section", {
						className: "admin-role-workflow-card",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "admin-role-section-head",
							children: [/* @__PURE__ */ jsx("p", { children: "Workflows" }), /* @__PURE__ */ jsx("h3", { children: "Daily actions" })]
						}), /* @__PURE__ */ jsx("ul", { children: blueprint.workflows.map((workflow) => /* @__PURE__ */ jsx("li", { children: workflow }, workflow)) })]
					}),
					/* @__PURE__ */ jsxs("section", {
						className: "admin-role-workflow-card",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "admin-role-section-head",
							children: [/* @__PURE__ */ jsx("p", { children: "Data ownership" }), /* @__PURE__ */ jsx("h3", { children: "Tables touched" })]
						}), /* @__PURE__ */ jsx("div", {
							className: "admin-chip-list",
							children: blueprint.dataTables.map((table) => /* @__PURE__ */ jsx("span", { children: table }, table))
						})]
					}),
					/* @__PURE__ */ jsxs("section", {
						className: "admin-role-workflow-card",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "admin-role-section-head",
							children: [/* @__PURE__ */ jsx("p", { children: "API surface" }), /* @__PURE__ */ jsx("h3", { children: blueprint.apiScope })]
						}), /* @__PURE__ */ jsx("div", {
							className: "admin-chip-list",
							children: blueprint.securityControls.map((control) => /* @__PURE__ */ jsx("span", { children: control }, control))
						})]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid gap-14 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.45fr)]",
				children: [/* @__PURE__ */ jsxs("section", {
					className: "admin-role-production-card",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "admin-role-section-head",
						children: [/* @__PURE__ */ jsx("p", { children: "Module permissions" }), /* @__PURE__ */ jsxs("h3", { children: [moduleNames.length, " active modules"] })]
					}), permissions.length ? /* @__PURE__ */ jsx("div", {
						className: "admin-table-wrap",
						children: /* @__PURE__ */ jsxs("table", {
							className: "admin-table",
							children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", { children: "Module" }),
								/* @__PURE__ */ jsx("th", { children: "View" }),
								/* @__PURE__ */ jsx("th", { children: "Create" }),
								/* @__PURE__ */ jsx("th", { children: "Edit" }),
								/* @__PURE__ */ jsx("th", { children: "Delete" }),
								/* @__PURE__ */ jsx("th", { children: "Export" })
							] }) }), /* @__PURE__ */ jsx("tbody", { children: permissions.map((permission) => /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: titleCase(permission.module) }), adminControlLabels.map((control) => /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(StatusPill, {
								tone: permission[permissionControlFields[control]] ? "success" : "neutral",
								children: permission[permissionControlFields[control]] ? "Yes" : "No"
							}) }, control))] }, permission.id)) })]
						})
					}) : /* @__PURE__ */ jsxs("div", {
						className: "admin-role-scope",
						children: [/* @__PURE__ */ jsx("p", { children: "Blueprint modules" }), /* @__PURE__ */ jsx("div", { children: moduleNames.map((module) => /* @__PURE__ */ jsx("span", { children: module }, module)) })]
					})]
				}), /* @__PURE__ */ jsxs("section", {
					className: "admin-role-production-card",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "admin-role-section-head",
							children: [/* @__PURE__ */ jsx("p", { children: "Assigned people" }), /* @__PURE__ */ jsx("h3", { children: assignedUsers.length ? "Role members" : "No users assigned" })]
						}),
						assignedUsers.length ? /* @__PURE__ */ jsx("div", {
							className: "admin-role-user-list",
							children: assignedUsers.map((user) => /* @__PURE__ */ jsxs("article", {
								className: "admin-role-user-card",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("strong", { children: user.name }), /* @__PURE__ */ jsx("span", { children: user.phone })] }), /* @__PURE__ */ jsx(StatusPill, {
									tone: "success",
									children: titleCase(user.role)
								})]
							}, user.id))
						}) : /* @__PURE__ */ jsx(EmptyState, { title: `No ${blueprint.title} users assigned yet` }),
						/* @__PURE__ */ jsxs("div", {
							className: "admin-role-guardrails mt-14",
							children: [/* @__PURE__ */ jsx("p", { children: "Production guardrails" }), /* @__PURE__ */ jsx("ul", { children: blueprint.guardrails.map((guardrail) => /* @__PURE__ */ jsx("li", { children: guardrail }, guardrail)) })]
						})
					]
				})]
			})
		]
	});
}
function getRoleWorkload(role, data) {
	if (role === "super_admin") return {
		label: "Security events",
		value: data.auditLogs.length + data.loginHistory.length,
		detail: "Audit and login events"
	};
	if (role === "admin") return {
		label: "Operational queue",
		value: data.orders.length + data.commerceOrders.length + data.leads.length,
		detail: "Orders and leads in the system"
	};
	if (role === "manager") return {
		label: "Revenue tracked",
		value: formatCurrency(data.summary.dashboard?.totalRevenue || 0),
		detail: "Paid and settled payment total"
	};
	if (role === "customer_support") return {
		label: "Customers",
		value: data.users.filter((user) => user.role === "consumer").length,
		detail: "Customer profiles available"
	};
	if (role === "inventory_manager") return {
		label: "Catalog scope",
		value: `${data.products.length}/${data.categories.length}`,
		detail: "Products / categories"
	};
	if (role === "delivery_manager") return {
		label: "Delivery queue",
		value: data.orders.filter((order) => [
			"pending",
			"assigned",
			"out_for_delivery"
		].includes(order.status)).length,
		detail: "Pending or active deliveries"
	};
	return {
		label: "Workspace",
		value: 0,
		detail: "No workload mapped"
	};
}
function SecurityLogsPanel({ auditLogs, loginHistory, settings }) {
	const [moduleFilter, setModuleFilter] = useState("all");
	const highRiskActions = new Set([
		"delete",
		"delete_setting",
		"reject",
		"cancel",
		"request_refund",
		"update_setting"
	]);
	const failedLogins = loginHistory.filter((login) => login.status !== "success");
	const highRiskLogs = auditLogs.filter((log) => highRiskActions.has(log.action));
	const securitySettings = settings.filter((setting) => setting.group === "security");
	const modules = Array.from(new Set(auditLogs.map((log) => log.module))).sort();
	const filteredAuditLogs = moduleFilter === "all" ? auditLogs : auditLogs.filter((log) => log.module === moduleFilter);
	return /* @__PURE__ */ jsxs(Panel, {
		title: "Audit Logs",
		kicker: `${auditLogs.length + loginHistory.length} events`,
		actionIcon: Shield,
		actionText: "Timeline",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "admin-risk-grid mb-16",
				children: [
					/* @__PURE__ */ jsx(RiskCard, {
						label: "Failed logins",
						value: failedLogins.length,
						detail: "Review repeated failures and unknown devices",
						tone: failedLogins.length ? "warning" : "safe"
					}),
					/* @__PURE__ */ jsx(RiskCard, {
						label: "High-risk changes",
						value: highRiskLogs.length,
						detail: "Deletes, cancellations, refunds, and setting changes",
						tone: highRiskLogs.length ? "warning" : "safe"
					}),
					/* @__PURE__ */ jsx(RiskCard, {
						label: "Security settings",
						value: securitySettings.length,
						detail: "Persistent controls loaded from backend",
						tone: "safe"
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "admin-security-control mb-16",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", { children: "Production controls" }), /* @__PURE__ */ jsx("h3", { children: "Audit every privileged action before it becomes a business incident." })] }), /* @__PURE__ */ jsxs("div", {
					className: "admin-security-chips",
					children: [
						/* @__PURE__ */ jsx("span", { children: "HttpOnly session" }),
						/* @__PURE__ */ jsx("span", { children: "CSRF checked writes" }),
						/* @__PURE__ */ jsx("span", { children: "Rate-limited login" }),
						/* @__PURE__ */ jsx("span", { children: "Persistent audit trail" })
					]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mb-16 rounded-[8px] border border-forest-ink/10 bg-[#f8fafc] p-14",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
						className: "text-[11px] font-semibold uppercase tracking-[0.16em] text-forest-ink",
						children: "Filter Panel"
					}), /* @__PURE__ */ jsx("h3", {
						className: "mt-3 font-reckless text-[30px] font-medium leading-none text-charcoal",
						children: "Audit timeline"
					})] }), /* @__PURE__ */ jsxs("label", {
						className: "grid gap-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-pewter",
						children: ["Module", /* @__PURE__ */ jsxs("select", {
							value: moduleFilter,
							onChange: (event) => setModuleFilter(event.target.value),
							className: "admin-table-select",
							children: [/* @__PURE__ */ jsx("option", {
								value: "all",
								children: "All modules"
							}), modules.map((module) => /* @__PURE__ */ jsx("option", {
								value: module,
								children: titleCase(module)
							}, module))]
						})]
					})]
				})
			}),
			filteredAuditLogs.length ? /* @__PURE__ */ jsx("div", {
				className: "mb-18 grid gap-10",
				children: filteredAuditLogs.slice(0, 60).map((log) => /* @__PURE__ */ jsxs("article", {
					className: "grid gap-10 rounded-[8px] border border-forest-ink/10 bg-pure-white p-14 shadow-sm sm:grid-cols-[92px_minmax(0,1fr)]",
					children: [/* @__PURE__ */ jsx("time", {
						className: "text-[13px] font-semibold text-forest-ink",
						children: formatTimeOnly(log.createdAt)
					}), /* @__PURE__ */ jsxs("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex flex-wrap items-center gap-8",
								children: [/* @__PURE__ */ jsxs("p", {
									className: "text-[14px] font-semibold text-charcoal",
									children: [
										log.actorId ? "Admin" : "System",
										" ",
										titleCase(log.action)
									]
								}), /* @__PURE__ */ jsx(StatusPill, {
									tone: highRiskActions.has(log.action) ? "warning" : "neutral",
									children: titleCase(log.module)
								})]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-5 text-[12px] text-graphite",
								children: log.entityType ? `${log.entityType}:${log.entityId || "n/a"}` : "System event"
							}),
							log.metadata ? /* @__PURE__ */ jsx("p", {
								className: "mt-5 truncate text-[12px] text-pewter",
								children: JSON.stringify(log.metadata)
							}) : null
						]
					})]
				}, log.id))
			}) : /* @__PURE__ */ jsx(EmptyState, { title: "No audit logs recorded yet" }),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-18",
				children: [/* @__PURE__ */ jsx("h3", {
					className: "mb-12 font-reckless text-[30px] font-medium leading-none text-charcoal",
					children: "Login history"
				}), loginHistory.length ? /* @__PURE__ */ jsx("div", {
					className: "grid gap-10",
					children: loginHistory.slice(0, 18).map((login) => /* @__PURE__ */ jsxs("div", {
						className: "admin-login-row",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", { children: formatDateTime(login.createdAt) }), /* @__PURE__ */ jsx("span", { children: login.userAgent || "Unknown device" })] }),
							/* @__PURE__ */ jsx(Field, {
								label: "Role",
								value: login.role || "admin"
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "IP address",
								value: login.ipAddress || "Unavailable"
							}),
							/* @__PURE__ */ jsx(StatusPill, {
								tone: login.status === "success" ? "success" : "danger",
								children: login.status
							})
						]
					}, login.id))
				}) : /* @__PURE__ */ jsx(EmptyState, { title: "No login events recorded yet" })]
			})
		]
	});
}
var settingGroups = [
	{
		id: "store",
		title: "Store Information",
		icon: Store
	},
	{
		id: "commerce",
		title: "Tax & Delivery",
		icon: IndianRupee
	},
	{
		id: "payments",
		title: "Payment Gateway",
		icon: CreditCard
	},
	{
		id: "notifications",
		title: "Notifications",
		icon: Bell
	},
	{
		id: "security",
		title: "Security",
		icon: ShieldCheck
	}
];
function settingInputValue(value) {
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	return JSON.stringify(value ?? "", null, 2);
}
function parseSettingInput(value) {
	const trimmed = value.trim();
	if (!trimmed) return "";
	if (/^(\{|\[|true$|false$|null$|-?\d)/i.test(trimmed)) try {
		return JSON.parse(trimmed);
	} catch {
		return value;
	}
	return value;
}
function SettingsPanel({ settings, isBusy, onSave }) {
	const [drafts, setDrafts] = useState(() => Object.fromEntries(settings.map((setting) => [setting.key, settingInputValue(setting.value)])));
	useEffect(() => {
		setDrafts(Object.fromEntries(settings.map((setting) => [setting.key, settingInputValue(setting.value)])));
	}, [settings]);
	function updateDraft(key, value) {
		setDrafts((current) => ({
			...current,
			[key]: value
		}));
	}
	async function handleSave(setting) {
		await onSave(setting.key, {
			group: setting.group,
			label: setting.label,
			value: parseSettingInput(drafts[setting.key] ?? ""),
			isSecret: setting.isSecret
		});
	}
	return /* @__PURE__ */ jsxs(Panel, {
		title: "Settings",
		kicker: `${settings.length} production controls`,
		actionIcon: Settings,
		actionText: "Store configuration",
		children: [/* @__PURE__ */ jsx("div", {
			className: "admin-settings-overview mb-16",
			children: settingGroups.map((group) => {
				const Icon = group.icon;
				const count = settings.filter((setting) => setting.group === group.id).length;
				return /* @__PURE__ */ jsxs("div", {
					className: "admin-settings-group-card",
					children: [/* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(Icon, {
						className: "h-[16px] w-[16px]",
						strokeWidth: 1.9
					}) }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", { children: group.title }), /* @__PURE__ */ jsx("strong", { children: count })] })]
				}, group.id);
			})
		}), /* @__PURE__ */ jsx("div", {
			className: "grid gap-18",
			children: settingGroups.map((group) => {
				const groupSettings = settings.filter((setting) => setting.group === group.id);
				if (!groupSettings.length) return null;
				return /* @__PURE__ */ jsxs("section", {
					className: "admin-settings-section",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "admin-settings-section-head",
						children: [/* @__PURE__ */ jsx("p", { children: group.title }), /* @__PURE__ */ jsxs("span", { children: [groupSettings.length, " settings"] })]
					}), /* @__PURE__ */ jsx("div", {
						className: "grid gap-12 xl:grid-cols-2",
						children: groupSettings.map((setting) => /* @__PURE__ */ jsxs("article", {
							className: "admin-setting-card",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "mb-10 flex items-start justify-between gap-10",
									children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", { children: setting.label }), /* @__PURE__ */ jsx("p", { children: setting.key })] }), setting.isSecret ? /* @__PURE__ */ jsx(StatusPill, {
										tone: "warning",
										children: "Secret"
									}) : null]
								}),
								/* @__PURE__ */ jsx("textarea", {
									value: drafts[setting.key] ?? "",
									onChange: (event) => updateDraft(setting.key, event.target.value),
									className: "admin-textarea min-h-[92px]"
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "mt-10 flex items-center justify-between gap-10",
									children: [/* @__PURE__ */ jsxs("span", {
										className: "text-[12px] text-pewter",
										children: ["Updated ", setting.updatedAt ? formatDateTime(setting.updatedAt) : "never"]
									}), /* @__PURE__ */ jsxs("button", {
										type: "button",
										disabled: isBusy,
										onClick: () => void handleSave(setting),
										className: "admin-primary-button",
										children: [/* @__PURE__ */ jsx(Check, {
											className: "h-[12px] w-[12px]",
											strokeWidth: 1.9
										}), "Save"]
									})]
								})
							]
						}, setting.key))
					})]
				}, group.id);
			})
		})]
	});
}
function InventoryDashboardPanel({ products, inventoryItems, onCreate, onAdjust, onDelete }) {
	const [draft, setDraft] = useState({
		productId: products[0]?.id || "",
		currentStock: "0",
		reservedStock: "0",
		reorderLevel: "10",
		unit: products[0]?.unit || "unit",
		warehouseName: "Main warehouse",
		sku: ""
	});
	useEffect(() => {
		if (!products.length) return;
		setDraft((current) => {
			const selected = products.find((product) => product.id === current.productId) || products[0];
			return {
				...current,
				productId: selected.id,
				unit: selected.unit || current.unit || "unit"
			};
		});
	}, [products]);
	const inventoryRows = useMemo(() => inventoryItems.map((item) => {
		const product = item.product || products.find((entry) => entry.id === item.productId);
		if (!product) return null;
		const currentStock = Number(item.currentStock || 0);
		const reservedStock = Number(item.reservedStock || 0);
		const reorderLevel = Number(item.reorderLevel || 0);
		const availableStock = Math.max(currentStock - reservedStock, 0);
		const status = String(item.status || "").includes("out") || availableStock <= 0 ? "out" : availableStock <= reorderLevel ? "low" : "healthy";
		return {
			id: item.id,
			name: item.variant?.name || product.name,
			unit: item.unit || product.unit || "unit",
			currentStock,
			reservedStock,
			availableStock,
			reorderLevel,
			status,
			productId: product.id
		};
	}).filter(Boolean), [inventoryItems, products]);
	const healthyCount = inventoryRows.filter((item) => item.status === "healthy").length;
	const lowCount = inventoryRows.filter((item) => item.status === "low").length;
	const outCount = inventoryRows.filter((item) => item.status === "out").length;
	async function handleCreate(event) {
		event.preventDefault();
		await onCreate({
			productId: draft.productId,
			currentStock: Number(draft.currentStock || 0),
			reservedStock: Number(draft.reservedStock || 0),
			reorderLevel: Number(draft.reorderLevel || 0),
			unit: draft.unit.trim(),
			sku: draft.sku.trim() || void 0,
			warehouseName: draft.warehouseName.trim() || void 0
		});
		const first = products.find((product) => product.id === draft.productId) || products[0];
		setDraft({
			productId: first?.id || "",
			currentStock: "0",
			reservedStock: "0",
			reorderLevel: "10",
			unit: first?.unit || "unit",
			warehouseName: "Main warehouse",
			sku: ""
		});
	}
	async function topUpStock(item) {
		const quantityText = window.prompt(`Add how much stock for ${item.name}?`, "1");
		if (!quantityText) return;
		const quantity = Number(quantityText);
		if (!Number.isFinite(quantity) || quantity <= 0) return;
		await onAdjust(item.id, {
			movementType: "in",
			quantity,
			reason: "Manual stock top-up",
			referenceType: "admin-panel"
		});
	}
	async function removeStock(item) {
		if (!window.confirm(`Delete ${item.name} from stock?`)) return;
		await onDelete(item.id);
	}
	return /* @__PURE__ */ jsxs(Panel, {
		title: "Inventory Dashboard",
		kicker: `${inventoryRows.length} stock items`,
		actionIcon: Warehouse,
		actionText: `${lowCount + outCount} alerts`,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "admin-intel-grid mb-16",
				children: [
					/* @__PURE__ */ jsx(IntelCard, {
						label: "Healthy",
						value: healthyCount,
						detail: "Available above reorder point"
					}),
					/* @__PURE__ */ jsx(IntelCard, {
						label: "Low stock",
						value: lowCount,
						detail: "Needs purchase planning"
					}),
					/* @__PURE__ */ jsx(IntelCard, {
						label: "Out of stock",
						value: outCount,
						detail: "Cannot fulfill demand"
					})
				]
			}),
			/* @__PURE__ */ jsxs("form", {
				onSubmit: handleCreate,
				className: "admin-form-card mb-16",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-10 flex items-center justify-between gap-10",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
						className: "text-caption font-semibold uppercase tracking-[0.18em] text-forest-ink",
						children: "Stock entry"
					}), /* @__PURE__ */ jsx("h3", {
						className: "mt-2 font-inter text-[16px] font-semibold tracking-normal text-charcoal",
						children: "Add a stock item"
					})] }), /* @__PURE__ */ jsx("span", {
						className: "text-[12px] text-pewter",
						children: "Create, then adjust from the cards below"
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "grid gap-10 md:grid-cols-2 xl:grid-cols-6",
					children: [
						/* @__PURE__ */ jsx("select", {
							value: draft.productId,
							onChange: (event) => {
								const selected = products.find((product) => product.id === event.target.value);
								setDraft((current) => ({
									...current,
									productId: event.target.value,
									unit: selected?.unit || current.unit
								}));
							},
							className: "admin-input xl:col-span-2",
							children: products.map((product) => /* @__PURE__ */ jsx("option", {
								value: product.id,
								children: product.name
							}, product.id))
						}),
						/* @__PURE__ */ jsx("input", {
							value: draft.currentStock,
							onChange: (event) => setDraft((current) => ({
								...current,
								currentStock: event.target.value
							})),
							min: "0",
							step: "1",
							type: "number",
							placeholder: "Current stock",
							className: "admin-input"
						}),
						/* @__PURE__ */ jsx("input", {
							value: draft.reservedStock,
							onChange: (event) => setDraft((current) => ({
								...current,
								reservedStock: event.target.value
							})),
							min: "0",
							step: "1",
							type: "number",
							placeholder: "Reserved",
							className: "admin-input"
						}),
						/* @__PURE__ */ jsx("input", {
							value: draft.reorderLevel,
							onChange: (event) => setDraft((current) => ({
								...current,
								reorderLevel: event.target.value
							})),
							min: "0",
							step: "1",
							type: "number",
							placeholder: "Reorder level",
							className: "admin-input"
						}),
						/* @__PURE__ */ jsx("input", {
							value: draft.unit,
							onChange: (event) => setDraft((current) => ({
								...current,
								unit: event.target.value
							})),
							placeholder: "Unit",
							className: "admin-input"
						}),
						/* @__PURE__ */ jsx("input", {
							value: draft.warehouseName,
							onChange: (event) => setDraft((current) => ({
								...current,
								warehouseName: event.target.value
							})),
							placeholder: "Warehouse",
							className: "admin-input xl:col-span-2"
						}),
						/* @__PURE__ */ jsx("input", {
							value: draft.sku,
							onChange: (event) => setDraft((current) => ({
								...current,
								sku: event.target.value
							})),
							placeholder: "SKU (optional)",
							className: "admin-input xl:col-span-2"
						}),
						/* @__PURE__ */ jsxs("button", {
							type: "submit",
							className: "admin-primary-button h-38 xl:col-span-2",
							children: [/* @__PURE__ */ jsx(Plus, {
								className: "h-[12px] w-[12px]",
								strokeWidth: 1.9
							}), "Add stock"]
						})
					]
				})]
			}),
			inventoryRows.length ? /* @__PURE__ */ jsx("div", {
				className: "grid gap-12 md:grid-cols-2 xl:grid-cols-3",
				children: inventoryRows.map((item) => {
					const status = inventoryStatusMeta(item.status);
					return /* @__PURE__ */ jsxs("article", {
						className: "rounded-[8px] border border-forest-ink/10 bg-pure-white p-16 shadow-sm",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-start justify-between gap-10",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
									className: "text-[15px] font-semibold text-charcoal",
									children: item.name
								}), /* @__PURE__ */ jsxs("p", {
									className: "mt-3 text-[12px] text-graphite",
									children: [
										"Reorder below ",
										formatNumber(item.reorderLevel),
										" ",
										item.unit
									]
								})] }), /* @__PURE__ */ jsx(StatusPill, {
									tone: status.tone,
									children: status.label
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-14 grid grid-cols-3 gap-8",
								children: [
									/* @__PURE__ */ jsx(Field, {
										label: "Current",
										value: `${formatNumber(item.currentStock)} ${item.unit}`
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Reserved",
										value: `${formatNumber(item.reservedStock)} ${item.unit}`
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Available",
										value: `${formatNumber(item.availableStock)} ${item.unit}`
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-14 flex items-center justify-end gap-8",
								children: [/* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: () => void topUpStock(item),
									className: "admin-secondary-button h-32 px-10 text-[12px]",
									children: [/* @__PURE__ */ jsx(Plus, {
										className: "h-[12px] w-[12px]",
										strokeWidth: 1.9
									}), "Add"]
								}), /* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: () => void removeStock(item),
									className: "admin-danger-button",
									children: [/* @__PURE__ */ jsx(Trash2, {
										className: "h-[12px] w-[12px]",
										strokeWidth: 1.9
									}), "Delete"]
								})]
							})
						]
					}, item.id);
				})
			}) : /* @__PURE__ */ jsx(EmptyState, { title: "No inventory items found" })
		]
	});
}
function AnalyticsDashboardPanel({ data, metrics }) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);
	const resolvedMetrics = metrics ?? buildCrmMetrics(data);
	const averagePrice = data.products.reduce((total, product) => total + Number(product.price || 0), 0) / Math.max(data.products.filter((product) => product.price != null).length, 1);
	const revenueTrend = resolvedMetrics.salesGrowth.map((point) => ({
		...point,
		revenue: Math.round(point.salesUnits * averagePrice)
	}));
	const inventoryRows = getInventoryRows(data.products, data.subscriptions);
	const inventoryHealth = [
		{
			name: "Healthy",
			value: inventoryRows.filter((item) => item.status === "healthy").length,
			color: "#16A34A"
		},
		{
			name: "Low Stock",
			value: inventoryRows.filter((item) => item.status === "low").length,
			color: "#F59E0B"
		},
		{
			name: "Out of Stock",
			value: inventoryRows.filter((item) => item.status === "out").length,
			color: "#DC2626"
		}
	];
	const conversionDonut = [{
		name: "Converted",
		value: resolvedMetrics.conversionRate,
		color: "#2563EB"
	}, {
		name: "Open",
		value: Math.max(100 - resolvedMetrics.conversionRate, 0),
		color: "#CBD5E1"
	}];
	if (!mounted) return /* @__PURE__ */ jsxs("div", {
		className: "grid gap-18",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "grid gap-18 xl:grid-cols-2",
			children: [/* @__PURE__ */ jsx(ChartCard, {
				title: "Orders Trend",
				kicker: "Operational volume",
				icon: ShoppingCart,
				children: /* @__PURE__ */ jsx("div", {
					className: "h-[260px] flex items-center justify-center bg-ash-gray/10 animate-pulse rounded-cards",
					children: /* @__PURE__ */ jsx("span", {
						className: "text-body-sm text-pewter",
						children: "Loading chart..."
					})
				})
			}), /* @__PURE__ */ jsx(ChartCard, {
				title: "Revenue Trend",
				kicker: "Estimated value",
				icon: IndianRupee,
				children: /* @__PURE__ */ jsx("div", {
					className: "h-[260px] flex items-center justify-center bg-ash-gray/10 animate-pulse rounded-cards",
					children: /* @__PURE__ */ jsx("span", {
						className: "text-body-sm text-pewter",
						children: "Loading chart..."
					})
				})
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "grid gap-18 xl:grid-cols-2",
			children: [/* @__PURE__ */ jsx(ChartCard, {
				title: "Lead Conversion",
				kicker: "Subscriber pipeline",
				icon: UserPlus,
				children: /* @__PURE__ */ jsx("div", {
					className: "h-[220px] flex items-center justify-center bg-ash-gray/10 animate-pulse rounded-cards",
					children: /* @__PURE__ */ jsx("span", {
						className: "text-body-sm text-pewter",
						children: "Loading chart..."
					})
				})
			}), /* @__PURE__ */ jsx(ChartCard, {
				title: "Inventory Health",
				kicker: "Stock readiness",
				icon: Warehouse,
				children: /* @__PURE__ */ jsx("div", {
					className: "h-[120px] flex items-center justify-center bg-ash-gray/10 animate-pulse rounded-cards",
					children: /* @__PURE__ */ jsx("span", {
						className: "text-body-sm text-pewter",
						children: "Loading data..."
					})
				})
			})]
		})]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "grid gap-18",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "grid gap-18 xl:grid-cols-2",
			children: [/* @__PURE__ */ jsx(ChartCard, {
				title: "Orders Trend",
				kicker: "Operational volume",
				icon: ShoppingCart,
				children: /* @__PURE__ */ jsx("div", {
					className: "h-[260px]",
					children: /* @__PURE__ */ jsx(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ jsxs(AreaChart, {
							data: resolvedMetrics.salesGrowth,
							children: [
								/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
									id: "analyticsOrdersGradient",
									x1: "0",
									x2: "0",
									y1: "0",
									y2: "1",
									children: [/* @__PURE__ */ jsx("stop", {
										offset: "5%",
										stopColor: "#2563EB",
										stopOpacity: .24
									}), /* @__PURE__ */ jsx("stop", {
										offset: "95%",
										stopColor: "#2563EB",
										stopOpacity: .03
									})]
								}) }),
								/* @__PURE__ */ jsx(CartesianGrid, {
									vertical: false,
									stroke: "#e5e7eb",
									strokeDasharray: "3 3"
								}),
								/* @__PURE__ */ jsx(XAxis, {
									dataKey: "label",
									axisLine: false,
									tickLine: false,
									tick: { fontSize: 11 }
								}),
								/* @__PURE__ */ jsx(YAxis, {
									allowDecimals: false,
									axisLine: false,
									tickLine: false,
									tick: { fontSize: 11 }
								}),
								/* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(ChartTooltip, {}) }),
								/* @__PURE__ */ jsx(Area, {
									type: "monotone",
									dataKey: "salesUnits",
									name: "Order units",
									stroke: "#2563EB",
									strokeWidth: 2,
									fill: "url(#analyticsOrdersGradient)"
								})
							]
						})
					})
				})
			}), /* @__PURE__ */ jsx(ChartCard, {
				title: "Revenue Trend",
				kicker: "Estimated value",
				icon: IndianRupee,
				children: /* @__PURE__ */ jsx("div", {
					className: "h-[260px]",
					children: /* @__PURE__ */ jsx(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ jsxs(LineChart, {
							data: revenueTrend,
							children: [
								/* @__PURE__ */ jsx(CartesianGrid, {
									vertical: false,
									stroke: "#e5e7eb",
									strokeDasharray: "3 3"
								}),
								/* @__PURE__ */ jsx(XAxis, {
									dataKey: "label",
									axisLine: false,
									tickLine: false,
									tick: { fontSize: 11 }
								}),
								/* @__PURE__ */ jsx(YAxis, {
									axisLine: false,
									tickLine: false,
									tick: { fontSize: 11 }
								}),
								/* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(ChartTooltip, {}) }),
								/* @__PURE__ */ jsx(Line, {
									type: "monotone",
									dataKey: "revenue",
									name: "Revenue",
									stroke: "#16A34A",
									strokeWidth: 2,
									dot: {
										r: 3,
										strokeWidth: 2
									}
								})
							]
						})
					})
				})
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "grid gap-18 xl:grid-cols-2",
			children: [/* @__PURE__ */ jsx(ChartCard, {
				title: "Lead Conversion",
				kicker: "Subscriber pipeline",
				icon: UserPlus,
				children: /* @__PURE__ */ jsxs("div", {
					className: "grid gap-16 md:grid-cols-[220px_minmax(0,1fr)] md:items-center",
					children: [/* @__PURE__ */ jsx("div", {
						className: "h-[220px]",
						children: /* @__PURE__ */ jsx(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ jsxs(PieChart, { children: [/* @__PURE__ */ jsx(Pie, {
								data: conversionDonut,
								dataKey: "value",
								innerRadius: 62,
								outerRadius: 92,
								paddingAngle: 4,
								children: conversionDonut.map((entry) => /* @__PURE__ */ jsx(Cell, { fill: entry.color }, entry.name))
							}), /* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(ChartTooltip, {}) })] })
						})
					}), /* @__PURE__ */ jsxs("div", {
						className: "grid gap-10",
						children: [/* @__PURE__ */ jsx(CrmSignal, {
							label: "Conversion",
							value: `${resolvedMetrics.conversionRate}%`,
							detail: "Active subscribers from open pipeline"
						}), /* @__PURE__ */ jsx(CrmSignal, {
							label: "Pending units",
							value: resolvedMetrics.pendingUnits,
							detail: "Awaiting sales decision"
						})]
					})]
				})
			}), /* @__PURE__ */ jsx(ChartCard, {
				title: "Inventory Health",
				kicker: "Stock readiness",
				icon: Warehouse,
				children: /* @__PURE__ */ jsx("div", {
					className: "grid gap-12",
					children: inventoryHealth.map((item) => /* @__PURE__ */ jsxs("div", {
						className: "admin-product-rank-row",
						children: [
							/* @__PURE__ */ jsx("span", { style: { backgroundColor: item.color } }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", { children: item.name }), /* @__PURE__ */ jsxs("small", { children: [item.value, " products"] })] }),
							/* @__PURE__ */ jsx("strong", { children: item.value })
						]
					}, item.name))
				})
			})]
		})]
	});
}
function IntelCard({ label, value, detail }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "admin-intel-card",
		children: [
			/* @__PURE__ */ jsx("p", { children: label }),
			/* @__PURE__ */ jsx("strong", { children: value }),
			/* @__PURE__ */ jsx("span", { children: detail })
		]
	});
}
function RiskCard({ label, value, detail, tone }) {
	return /* @__PURE__ */ jsxs("div", {
		className: `admin-risk-card admin-risk-card-${tone}`,
		children: [
			/* @__PURE__ */ jsx("p", { children: label }),
			/* @__PURE__ */ jsx("strong", { children: value }),
			/* @__PURE__ */ jsx("span", { children: detail })
		]
	});
}
function FeatureModulePanel({ module }) {
	const Icon = module.icon;
	return /* @__PURE__ */ jsxs(Panel, {
		title: module.title,
		kicker: module.kicker,
		actionIcon: Icon,
		actionText: "Platform module",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "admin-module-hero",
				children: [/* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(Icon, {
					className: "h-[20px] w-[20px]",
					strokeWidth: 1.9
				}) }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", { children: module.title }), /* @__PURE__ */ jsx("p", { children: module.summary })] })]
			}),
			/* @__PURE__ */ jsx(ModuleControlStrip, { controls: module.controls }),
			module.reports?.length ? /* @__PURE__ */ jsx(ModuleControlStrip, { controls: module.reports }) : null
		]
	});
}
function ModuleControlStrip({ controls, activeControl, onControlSelect }) {
	return /* @__PURE__ */ jsx("div", {
		className: "admin-module-control-grid",
		children: controls.map((control) => {
			const isActive = activeControl === control;
			return /* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => onControlSelect?.(control),
				className: `admin-module-control w-full text-left flex items-center gap-6 ${isActive ? "admin-module-control-active bg-forest-ink/10 font-semibold text-forest-ink" : ""}`,
				children: [/* @__PURE__ */ jsx(Check, {
					className: `h-[13px] w-[13px] ${isActive ? "text-forest-ink" : "text-pewter"}`,
					strokeWidth: 2
				}), /* @__PURE__ */ jsx("span", { children: control })]
			}, control);
		})
	});
}
function getTopProducts(subscriptions) {
	const productMap = /* @__PURE__ */ new Map();
	for (const subscription of subscriptions) {
		if (subscription.status === "terminated") continue;
		const product = titleCase(subscription.productType || "Product");
		productMap.set(product, (productMap.get(product) || 0) + Number(subscription.quantity || 0));
	}
	const rows = Array.from(productMap.entries()).map(([name, units]) => ({
		name,
		units
	})).sort((a, b) => b.units - a.units).slice(0, 5);
	const total = rows.reduce((sum, product) => sum + product.units, 0) || 1;
	return rows.length ? rows.map((product) => ({
		...product,
		share: Math.round(product.units / total * 100)
	})) : [{
		name: "No active products",
		units: 0,
		share: 0
	}];
}
function getRecentActivities(data) {
	return [
		...data.leads.slice(0, 4).map((lead) => ({
			type: "lead",
			title: `New lead: ${lead.name}`,
			meta: `${lead.productType} - ${lead.area}`,
			time: formatDateTime(lead.submittedAt),
			tone: "forest",
			sort: new Date(lead.submittedAt).getTime()
		})),
		...data.orders.slice(0, 4).map((order) => ({
			type: "order",
			title: `Order ${order.status}`,
			meta: order.subscription?.user?.name || "Customer",
			time: formatDate(order.deliveryDate),
			tone: order.status === "delivered" ? "green" : "amber",
			sort: new Date(order.deliveryDate).getTime()
		})),
		...data.notifications.slice(0, 3).map((notification) => ({
			type: "notification",
			title: `${titleCase(notification.type)} notification`,
			meta: getNotificationRecipient(notification),
			time: formatDateTime(notification.createdAt),
			tone: "sky",
			sort: new Date(notification.createdAt).getTime()
		}))
	].sort((a, b) => b.sort - a.sort).slice(0, 6);
}
function ChartCard({ title, kicker, icon: Icon, meta, children }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "crm-chart-card",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "mb-14 flex items-start justify-between gap-12",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
				className: "text-[11px] font-semibold uppercase tracking-[0.16em] text-forest-ink",
				children: kicker
			}), /* @__PURE__ */ jsx("h2", {
				className: "mt-3 font-reckless text-[26px] font-medium leading-[1.08] tracking-normal text-charcoal",
				children: title
			})] }), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-8",
				children: [meta ? /* @__PURE__ */ jsx("span", {
					className: "rounded-[999px] bg-forest-ink/10 px-9 py-4 text-[11px] font-semibold text-forest-ink",
					children: meta
				}) : null, /* @__PURE__ */ jsx("span", {
					className: "inline-flex h-30 w-30 items-center justify-center rounded-[8px] bg-forest-ink text-pure-white",
					children: /* @__PURE__ */ jsx(Icon, {
						className: "h-[13px] w-[13px]",
						strokeWidth: 1.9
					})
				})]
			})]
		}), children]
	});
}
function CrmSignal({ label, value, detail }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-[8px] border border-forest-ink/10 bg-pure-white/85 p-16 shadow-sm",
		children: [
			/* @__PURE__ */ jsx("p", {
				className: "text-[11px] font-semibold uppercase tracking-[0.16em] text-pewter",
				children: label
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-7 font-reckless text-[34px] font-medium leading-none tracking-normal text-charcoal",
				children: value
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-3 text-[13px] text-graphite",
				children: detail
			})
		]
	});
}
function ChartTooltip({ active, payload, label }) {
	if (!active || !payload?.length) return null;
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-[8px] border border-forest-ink/10 bg-pure-white px-12 py-10 shadow-lg",
		children: [label ? /* @__PURE__ */ jsx("p", {
			className: "mb-6 text-[12px] font-semibold text-charcoal",
			children: label
		}) : null, /* @__PURE__ */ jsx("div", {
			className: "grid gap-4",
			children: payload.map((item) => /* @__PURE__ */ jsxs("p", {
				className: "flex items-center gap-8 text-[12px] text-graphite",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "h-9 w-9 rounded-[3px]",
						style: { backgroundColor: item.color || "#07503f" }
					}),
					/* @__PURE__ */ jsx("span", { children: item.name }),
					/* @__PURE__ */ jsx("span", {
						className: "font-semibold text-charcoal",
						children: item.value
					})
				]
			}, `${item.name}-${item.value}`))
		})]
	});
}
function createLeadDraft(product = "milk") {
	return {
		name: "",
		phone: "",
		area: "",
		product,
		requestType: "subscription",
		quantity: "1",
		plan: "daily",
		notes: ""
	};
}
function LeadsPanel({ leads, products, pendingSubscriptions, isBusy, onActivate, onReject, onCapture, onDelete }) {
	const subscriptionById = new Map(pendingSubscriptions.map((subscription) => [subscription.id, subscription]));
	const productOptions = useMemo(() => {
		const seen = /* @__PURE__ */ new Set();
		return products.map((product) => product.productType || product.name).filter((product) => {
			const normalized = product.trim();
			if (!normalized || seen.has(normalized)) return false;
			seen.add(normalized);
			return true;
		});
	}, [products]);
	const [draft, setDraft] = useState(createLeadDraft(productOptions[0] || "milk"));
	useEffect(() => {
		if (!productOptions.length) return;
		setDraft((current) => productOptions.includes(current.product) ? current : {
			...current,
			product: productOptions[0]
		});
	}, [productOptions]);
	async function handleCaptureSubmit(event) {
		event.preventDefault();
		await onCapture({
			name: draft.name.trim(),
			phone: draft.phone.trim(),
			area: draft.area.trim(),
			product: draft.product,
			requestType: draft.requestType,
			quantity: Number(draft.quantity || 1),
			plan: draft.plan,
			source: "admin-panel",
			notes: draft.notes.trim()
		});
		setDraft(createLeadDraft(productOptions[0] || "milk"));
	}
	async function handleDeleteLead(id) {
		if (!window.confirm("Delete this lead?")) return;
		await onDelete(id);
	}
	return /* @__PURE__ */ jsxs(Panel, {
		title: "Lead queue",
		kicker: `${leads.length} captured`,
		actionIcon: RefreshCcw,
		actionText: "Live from backend",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "mb-16 rounded-[16px] border border-forest-ink/10 bg-bone/35 p-16 shadow-sm",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "mb-12 flex items-center justify-between gap-10",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
					className: "text-[11px] font-semibold uppercase tracking-[0.16em] text-pewter",
					children: "Quick capture"
				}), /* @__PURE__ */ jsx("h3", {
					className: "mt-3 text-[15px] font-semibold text-charcoal",
					children: "Add a lead manually"
				})] }), /* @__PURE__ */ jsxs("div", {
					className: "inline-flex items-center gap-8 rounded-full bg-forest-ink/10 px-10 py-6 text-[11px] font-semibold text-forest-ink",
					children: [/* @__PURE__ */ jsx(Plus, {
						className: "h-[12px] w-[12px]",
						strokeWidth: 2
					}), "Admin input"]
				})]
			}), /* @__PURE__ */ jsxs("form", {
				onSubmit: handleCaptureSubmit,
				className: "grid gap-10 md:grid-cols-2 xl:grid-cols-6",
				children: [
					/* @__PURE__ */ jsx("input", {
						value: draft.name,
						onChange: (event) => setDraft((current) => ({
							...current,
							name: event.target.value
						})),
						required: true,
						placeholder: "Customer name",
						className: "admin-input xl:col-span-2"
					}),
					/* @__PURE__ */ jsx("input", {
						value: draft.phone,
						onChange: (event) => setDraft((current) => ({
							...current,
							phone: event.target.value
						})),
						required: true,
						placeholder: "Phone number",
						className: "admin-input xl:col-span-2"
					}),
					/* @__PURE__ */ jsx("input", {
						value: draft.area,
						onChange: (event) => setDraft((current) => ({
							...current,
							area: event.target.value
						})),
						required: true,
						placeholder: "Area / pincode",
						className: "admin-input xl:col-span-2"
					}),
					/* @__PURE__ */ jsx("select", {
						value: draft.product,
						onChange: (event) => setDraft((current) => ({
							...current,
							product: event.target.value
						})),
						className: "admin-input",
						children: productOptions.length ? productOptions.map((product) => /* @__PURE__ */ jsx("option", {
							value: product,
							children: product
						}, product)) : /* @__PURE__ */ jsx("option", {
							value: "milk",
							children: "Milk"
						})
					}),
					/* @__PURE__ */ jsx("input", {
						value: draft.quantity,
						onChange: (event) => setDraft((current) => ({
							...current,
							quantity: event.target.value
						})),
						type: "number",
						min: "1",
						max: "50",
						placeholder: "Qty",
						className: "admin-input"
					}),
					/* @__PURE__ */ jsxs("select", {
						value: draft.requestType,
						onChange: (event) => setDraft((current) => ({
							...current,
							requestType: event.target.value
						})),
						className: "admin-input",
						children: [/* @__PURE__ */ jsx("option", {
							value: "subscription",
							children: "Subscription"
						}), /* @__PURE__ */ jsx("option", {
							value: "order",
							children: "One-time order"
						})]
					}),
					/* @__PURE__ */ jsxs("select", {
						value: draft.plan,
						onChange: (event) => setDraft((current) => ({
							...current,
							plan: event.target.value
						})),
						className: "admin-input",
						children: [
							/* @__PURE__ */ jsx("option", {
								value: "daily",
								children: "Daily"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "alternate",
								children: "Alternate"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "custom",
								children: "Custom"
							})
						]
					}),
					/* @__PURE__ */ jsx("input", {
						value: draft.notes,
						onChange: (event) => setDraft((current) => ({
							...current,
							notes: event.target.value
						})),
						placeholder: "Notes",
						className: "admin-input xl:col-span-4"
					}),
					/* @__PURE__ */ jsxs("button", {
						type: "submit",
						disabled: isBusy,
						className: "admin-primary-button h-38 xl:col-span-2",
						children: [/* @__PURE__ */ jsx(Send, {
							className: "h-[12px] w-[12px]",
							strokeWidth: 1.9
						}), "Capture lead"]
					})
				]
			})]
		}), leads.length ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
			className: "admin-table-wrap hidden md:block",
			children: /* @__PURE__ */ jsxs("table", {
				className: "admin-table",
				children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("th", { children: "Customer Name" }),
					/* @__PURE__ */ jsx("th", { children: "Phone" }),
					/* @__PURE__ */ jsx("th", { children: "Location" }),
					/* @__PURE__ */ jsx("th", { children: "Requested Product" }),
					/* @__PURE__ */ jsx("th", { children: "Qty" }),
					/* @__PURE__ */ jsx("th", { children: "Plan" }),
					/* @__PURE__ */ jsx("th", { children: "Submission Date" }),
					/* @__PURE__ */ jsx("th", {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ jsx("tbody", { children: leads.map((lead) => {
					const isPending = subscriptionById.has(lead.subscriptionId);
					return /* @__PURE__ */ jsxs("tr", { children: [
						/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-8",
							children: [/* @__PURE__ */ jsx("span", {
								className: "font-semibold text-charcoal",
								children: lead.name
							}), /* @__PURE__ */ jsx(StatusPill, {
								tone: isPending ? "warning" : "neutral",
								children: isPending ? "pending" : lead.status || "captured"
							})]
						}) }),
						/* @__PURE__ */ jsx("td", { children: lead.phone }),
						/* @__PURE__ */ jsx("td", { children: lead.area }),
						/* @__PURE__ */ jsx("td", { children: lead.productType }),
						/* @__PURE__ */ jsx("td", { children: lead.quantity }),
						/* @__PURE__ */ jsx("td", { children: lead.scheduleType }),
						/* @__PURE__ */ jsx("td", { children: formatDateTime(lead.submittedAt) }),
						/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-end gap-8",
							children: [isPending ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("button", {
								type: "button",
								disabled: isBusy,
								onClick: () => onActivate(lead.subscriptionId),
								className: "admin-primary-button h-32 px-10 text-[12px]",
								children: [/* @__PURE__ */ jsx(Check, {
									className: "h-[12px] w-[12px]",
									strokeWidth: 1.9
								}), "Activate"]
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								disabled: isBusy,
								onClick: () => onReject(lead.subscriptionId),
								className: "admin-danger-button",
								children: "Reject"
							})] }) : /* @__PURE__ */ jsx("span", {
								className: "text-[12px] font-semibold text-pewter",
								children: "Processed"
							}), /* @__PURE__ */ jsxs("button", {
								type: "button",
								disabled: isBusy,
								onClick: () => void handleDeleteLead(lead.id),
								className: "admin-danger-button h-32 px-10 text-[12px]",
								children: [/* @__PURE__ */ jsx(Trash2, {
									className: "h-[12px] w-[12px]",
									strokeWidth: 1.9
								}), "Delete"]
							})]
						}) })
					] }, lead.id);
				}) })]
			})
		}), /* @__PURE__ */ jsx("div", {
			className: "grid gap-10 md:hidden",
			children: leads.map((lead) => {
				const isPending = subscriptionById.has(lead.subscriptionId);
				return /* @__PURE__ */ jsxs("div", {
					className: "admin-data-row border-l-[4px] border-l-amber-300 p-14",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center gap-8",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "font-inter text-[16px] font-semibold tracking-normal text-charcoal",
								children: lead.name
							}), /* @__PURE__ */ jsx(StatusPill, {
								tone: isPending ? "warning" : "neutral",
								children: isPending ? "pending" : lead.status || "captured"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-12 grid gap-8",
							children: [
								/* @__PURE__ */ jsx(Field, {
									label: "Phone",
									value: lead.phone
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Location",
									value: lead.area
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Product",
									value: lead.productType
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Quantity",
									value: String(lead.quantity)
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Plan",
									value: lead.scheduleType
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Submitted",
									value: formatDateTime(lead.submittedAt)
								}),
								lead.notes ? /* @__PURE__ */ jsx(Field, {
									label: "Notes",
									value: lead.notes
								}) : null
							]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "mt-14 flex items-center gap-8",
							children: isPending ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("button", {
								type: "button",
								disabled: isBusy,
								onClick: () => onActivate(lead.subscriptionId),
								className: "admin-primary-button h-34 flex-1 px-11 text-[12px]",
								children: [/* @__PURE__ */ jsx(Check, {
									className: "h-[12px] w-[12px]",
									strokeWidth: 1.9
								}), "Activate"]
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								disabled: isBusy,
								onClick: () => onReject(lead.subscriptionId),
								className: "admin-danger-button h-34 flex-1",
								children: "Reject"
							})] }) : /* @__PURE__ */ jsx("span", {
								className: "w-full rounded-[8px] border border-forest-ink/10 bg-[#eef2e3] py-6 text-center text-[13px] font-semibold text-pewter",
								children: "Processed"
							})
						}),
						/* @__PURE__ */ jsxs("button", {
							type: "button",
							disabled: isBusy,
							onClick: () => void handleDeleteLead(lead.id),
							className: "admin-danger-button mt-10 h-34 w-full",
							children: [/* @__PURE__ */ jsx(Trash2, {
								className: "h-[12px] w-[12px]",
								strokeWidth: 1.9
							}), "Delete lead"]
						})
					]
				}, lead.id);
			})
		})] }) : /* @__PURE__ */ jsx(EmptyState, { title: "No leads captured yet" })]
	});
}
function SubscriptionsPanel({ subscriptions, activeCount, isBusy, onStatusChange, onDelete }) {
	async function handleDeleteSubscription(id) {
		if (!window.confirm("Delete this subscription?")) return;
		await onDelete(id);
	}
	return /* @__PURE__ */ jsx(Panel, {
		title: "Subscriptions",
		kicker: `${activeCount} active`,
		actionIcon: Milk,
		actionText: "Customer plans",
		children: subscriptions.length ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
			className: "admin-table-wrap hidden md:block",
			children: /* @__PURE__ */ jsxs("table", {
				className: "admin-table",
				children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("th", { children: "Customer" }),
					/* @__PURE__ */ jsx("th", { children: "Phone" }),
					/* @__PURE__ */ jsx("th", { children: "Product" }),
					/* @__PURE__ */ jsx("th", { children: "Qty" }),
					/* @__PURE__ */ jsx("th", { children: "Schedule" }),
					/* @__PURE__ */ jsx("th", { children: "Status" }),
					/* @__PURE__ */ jsx("th", {
						className: "text-right",
						children: "Action"
					})
				] }) }), /* @__PURE__ */ jsx("tbody", { children: subscriptions.map((subscription) => /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", {
						className: "font-semibold text-charcoal",
						children: subscription.user?.name || "Customer"
					}) }),
					/* @__PURE__ */ jsx("td", { children: subscription.user?.phone || "Not set" }),
					/* @__PURE__ */ jsx("td", { children: subscription.productType }),
					/* @__PURE__ */ jsx("td", { children: subscription.quantity }),
					/* @__PURE__ */ jsx("td", { children: subscription.scheduleType }),
					/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(StatusPill, {
						tone: statusTone(subscription.status),
						children: subscription.status
					}) }),
					/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-end gap-8",
						children: [/* @__PURE__ */ jsxs("select", {
							value: subscription.status,
							disabled: isBusy,
							onChange: (event) => onStatusChange(subscription.id, event.target.value),
							className: "admin-table-select",
							children: [
								/* @__PURE__ */ jsx("option", {
									value: "pending",
									children: "Pending"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "active",
									children: "Active"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "paused",
									children: "Paused"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "terminated",
									children: "Terminated"
								})
							]
						}), /* @__PURE__ */ jsxs("button", {
							type: "button",
							disabled: isBusy,
							onClick: () => void handleDeleteSubscription(subscription.id),
							className: "admin-danger-button h-32 px-10 text-[12px]",
							children: [/* @__PURE__ */ jsx(Trash2, {
								className: "h-[12px] w-[12px]",
								strokeWidth: 1.9
							}), "Delete"]
						})]
					}) })
				] }, subscription.id)) })]
			})
		}), /* @__PURE__ */ jsx("div", {
			className: "grid gap-10 md:hidden",
			children: subscriptions.map((subscription) => /* @__PURE__ */ jsxs("div", {
				className: "admin-data-row border-l-[4px] border-l-sky-card p-14",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center justify-between gap-8",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							className: "text-[14px] font-semibold text-charcoal",
							children: subscription.user?.name || "Customer"
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-3 text-[12px] text-graphite",
							children: subscription.user?.phone || "Not set"
						})] }), /* @__PURE__ */ jsx(StatusPill, {
							tone: statusTone(subscription.status),
							children: subscription.status
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-12 grid grid-cols-2 gap-8",
						children: [
							/* @__PURE__ */ jsx(Field, {
								label: "Product",
								value: subscription.productType
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Quantity",
								value: String(subscription.quantity)
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Schedule",
								value: subscription.scheduleType
							})
						]
					}),
					/* @__PURE__ */ jsxs("select", {
						value: subscription.status,
						disabled: isBusy,
						onChange: (event) => onStatusChange(subscription.id, event.target.value),
						className: "admin-table-select mt-14 w-full",
						children: [
							/* @__PURE__ */ jsx("option", {
								value: "pending",
								children: "Pending"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "active",
								children: "Active"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "paused",
								children: "Paused"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "terminated",
								children: "Terminated"
							})
						]
					}),
					/* @__PURE__ */ jsxs("button", {
						type: "button",
						disabled: isBusy,
						onClick: () => void handleDeleteSubscription(subscription.id),
						className: "admin-danger-button mt-10 h-34 w-full",
						children: [/* @__PURE__ */ jsx(Trash2, {
							className: "h-[12px] w-[12px]",
							strokeWidth: 1.9
						}), "Delete subscription"]
					})
				]
			}, subscription.id))
		})] }) : /* @__PURE__ */ jsx(EmptyState, { title: "No subscriptions found" })
	});
}
var emptyProductForm = {
	code: "",
	name: "",
	productType: "",
	categoryId: "",
	unit: "litre",
	price: "",
	compareAtPrice: "",
	taxPercent: "",
	defaultQuantity: "1",
	defaultSchedule: "daily",
	description: "",
	tags: "",
	isActive: true,
	sortOrder: "0"
};
var productScheduleOptions = [
	"daily",
	"alternate",
	"custom",
	"weekly",
	"monthly"
];
var productDisplayOrder = [
	"milk",
	"curd",
	"ghee",
	"butter",
	"paneer",
	"cheese"
];
function productTagsToText(tags) {
	if (!tags) return "";
	if (Array.isArray(tags)) return tags.map(String).join(", ");
	if (typeof tags === "string") return tags;
	return JSON.stringify(tags);
}
function parseProductTags(value) {
	return value.split(",").map((tag) => tag.trim()).filter(Boolean);
}
function ProductsPanel({ products, categories, isBusy, onCreate, onUpdate, onDelete }) {
	const [editingId, setEditingId] = useState("");
	const [form, setForm] = useState(emptyProductForm);
	const isEditing = Boolean(editingId);
	const categoryMap = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories]);
	const alignedProducts = useMemo(() => {
		const byKey = /* @__PURE__ */ new Map();
		for (const product of products) {
			byKey.set(`${product.productType || product.name}`.toLowerCase(), product);
			byKey.set(`${product.name || product.productType}`.toLowerCase(), product);
		}
		return productDisplayOrder.map((productType) => {
			return byKey.get(productType) ?? {
				id: productType,
				name: titleCase(productType),
				productType,
				unit: productType === "milk" || productType === "curd" ? "litre" : "gram",
				isActive: false
			};
		});
	}, [products]);
	const activeProducts = products.filter((product) => product.isActive).length;
	const pricedProducts = products.filter((product) => product.price != null).length;
	const categorizedProducts = products.filter((product) => product.categoryId).length;
	const missingCommercials = products.filter((product) => product.isActive && (product.price == null || !product.categoryId)).length;
	function updateField(key, value) {
		setForm((current) => ({
			...current,
			[key]: value
		}));
	}
	function resetForm() {
		setEditingId("");
		setForm(emptyProductForm);
	}
	function startEdit(product) {
		setEditingId(product.id);
		setForm({
			code: product.code,
			name: product.name,
			productType: product.productType,
			categoryId: product.categoryId || "",
			unit: product.unit,
			price: product.price == null ? "" : String(product.price),
			compareAtPrice: product.compareAtPrice == null ? "" : String(product.compareAtPrice),
			taxPercent: product.taxPercent == null ? "" : String(product.taxPercent),
			defaultQuantity: String(product.defaultQuantity),
			defaultSchedule: product.defaultSchedule,
			description: product.description || "",
			tags: productTagsToText(product.tags),
			isActive: product.isActive,
			sortOrder: String(product.sortOrder || 0)
		});
	}
	async function handleSubmit(event) {
		event.preventDefault();
		const payload = {
			...form,
			defaultQuantity: Number(form.defaultQuantity),
			code: form.code.trim(),
			name: form.name.trim(),
			productType: form.productType.trim(),
			categoryId: form.categoryId || null,
			unit: form.unit.trim(),
			price: form.price.trim() ? Number(form.price) : null,
			compareAtPrice: form.compareAtPrice.trim() ? Number(form.compareAtPrice) : null,
			taxPercent: form.taxPercent.trim() ? Number(form.taxPercent) : null,
			description: form.description?.trim() || "",
			tags: parseProductTags(form.tags),
			sortOrder: Number(form.sortOrder || 0)
		};
		if (isEditing) await onUpdate(editingId, payload);
		else await onCreate(payload);
		resetForm();
	}
	async function handleDelete(product) {
		if (!window.confirm(`Archive ${product.name}? Existing subscriptions keep their product label.`)) return;
		await onDelete(product.id);
		if (editingId === product.id) resetForm();
	}
	return /* @__PURE__ */ jsxs(Panel, {
		title: "Products",
		kicker: `${products.length} catalog items`,
		actionIcon: PackageCheck,
		actionText: "Dynamic catalog",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "admin-product-readiness-grid mb-16",
				children: [
					/* @__PURE__ */ jsx(IntelCard, {
						label: "Active products",
						value: activeProducts,
						detail: "Visible catalog items ready for storefront and subscriptions"
					}),
					/* @__PURE__ */ jsx(IntelCard, {
						label: "Priced products",
						value: `${pricedProducts}/${products.length || 0}`,
						detail: "Items with a sale price configured"
					}),
					/* @__PURE__ */ jsx(IntelCard, {
						label: "Category coverage",
						value: `${categorizedProducts}/${products.length || 0}`,
						detail: "Products mapped to merchandising categories"
					}),
					/* @__PURE__ */ jsx(RiskCard, {
						label: "Commercial gaps",
						value: missingCommercials,
						detail: "Active items missing price or category",
						tone: missingCommercials ? "warning" : "safe"
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mb-16 grid gap-10 sm:grid-cols-2 xl:grid-cols-3",
				children: alignedProducts.map((product) => /* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between gap-12 rounded-[18px] border border-forest-ink/10 bg-white px-14 py-12 shadow-sm",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ jsx("p", {
							className: "truncate text-[14px] font-semibold text-charcoal",
							children: titleCase(product.name)
						}), /* @__PURE__ */ jsxs("p", {
							className: "text-[11px] uppercase tracking-[0.14em] text-pewter",
							children: [
								product.unit,
								" · ",
								product.productType
							]
						})]
					}), /* @__PURE__ */ jsx(StatusPill, {
						tone: product.isActive ? "success" : "neutral",
						children: product.isActive ? "Live" : "Draft"
					})]
				}, product.id))
			}),
			/* @__PURE__ */ jsxs("form", {
				onSubmit: handleSubmit,
				className: "admin-form-card mb-16",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-14 flex flex-col gap-10 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
						className: "text-caption font-semibold uppercase tracking-[0.18em] text-forest-ink",
						children: isEditing ? "Edit product" : "New product"
					}), /* @__PURE__ */ jsx("h3", {
						className: "mt-2 font-inter text-[16px] font-semibold tracking-normal text-charcoal",
						children: isEditing ? "Update catalog item" : "Create catalog item"
					})] }), isEditing ? /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: resetForm,
						className: "admin-secondary-button",
						children: [/* @__PURE__ */ jsx(X, {
							className: "h-[12px] w-[12px]",
							strokeWidth: 1.9
						}), "Cancel"]
					}) : null]
				}), /* @__PURE__ */ jsxs("div", {
					className: "grid gap-10 md:grid-cols-2 xl:grid-cols-6",
					children: [
						/* @__PURE__ */ jsx("input", {
							required: true,
							value: form.name,
							onChange: (event) => updateField("name", event.target.value),
							placeholder: "Product name",
							className: "admin-input xl:col-span-2"
						}),
						/* @__PURE__ */ jsx("input", {
							required: true,
							value: form.code,
							onChange: (event) => updateField("code", event.target.value),
							placeholder: "Code",
							className: "admin-input"
						}),
						/* @__PURE__ */ jsx("input", {
							required: true,
							value: form.productType,
							onChange: (event) => updateField("productType", event.target.value),
							placeholder: "Product type",
							className: "admin-input"
						}),
						/* @__PURE__ */ jsxs("select", {
							value: form.categoryId,
							onChange: (event) => updateField("categoryId", event.target.value),
							className: "admin-input",
							children: [/* @__PURE__ */ jsx("option", {
								value: "",
								children: "Select category"
							}), categories.map((category) => /* @__PURE__ */ jsx("option", {
								value: category.id,
								children: category.name
							}, category.id))]
						}),
						/* @__PURE__ */ jsx("input", {
							required: true,
							value: form.unit,
							onChange: (event) => updateField("unit", event.target.value),
							placeholder: "Unit",
							className: "admin-input"
						}),
						/* @__PURE__ */ jsx("input", {
							min: "0",
							step: "0.01",
							type: "number",
							value: form.price,
							onChange: (event) => updateField("price", event.target.value),
							placeholder: "Price INR",
							className: "admin-input"
						}),
						/* @__PURE__ */ jsx("input", {
							min: "0",
							step: "0.01",
							type: "number",
							value: form.compareAtPrice,
							onChange: (event) => updateField("compareAtPrice", event.target.value),
							placeholder: "Compare price",
							className: "admin-input"
						}),
						/* @__PURE__ */ jsx("input", {
							min: "0",
							step: "0.01",
							type: "number",
							value: form.taxPercent,
							onChange: (event) => updateField("taxPercent", event.target.value),
							placeholder: "Tax %",
							className: "admin-input"
						}),
						/* @__PURE__ */ jsx("input", {
							required: true,
							min: "1",
							step: "1",
							type: "number",
							value: form.defaultQuantity,
							onChange: (event) => updateField("defaultQuantity", event.target.value),
							placeholder: "Default qty",
							className: "admin-input"
						}),
						/* @__PURE__ */ jsx("select", {
							required: true,
							value: form.defaultSchedule,
							onChange: (event) => updateField("defaultSchedule", event.target.value),
							className: "admin-input",
							children: productScheduleOptions.map((schedule) => /* @__PURE__ */ jsx("option", {
								value: schedule,
								children: titleCase(schedule)
							}, schedule))
						}),
						/* @__PURE__ */ jsx("input", {
							min: "0",
							step: "1",
							type: "number",
							value: form.sortOrder,
							onChange: (event) => updateField("sortOrder", event.target.value),
							placeholder: "Sort order",
							className: "admin-input"
						}),
						/* @__PURE__ */ jsx("input", {
							value: form.tags,
							onChange: (event) => updateField("tags", event.target.value),
							placeholder: "Tags: organic, daily, family",
							className: "admin-input xl:col-span-2"
						}),
						/* @__PURE__ */ jsxs("label", {
							className: "admin-checkbox-field",
							children: [/* @__PURE__ */ jsx("input", {
								type: "checkbox",
								checked: form.isActive,
								onChange: (event) => updateField("isActive", event.target.checked)
							}), "Active"]
						}),
						/* @__PURE__ */ jsx("textarea", {
							value: form.description,
							onChange: (event) => updateField("description", event.target.value),
							placeholder: "Short product description",
							className: "admin-textarea md:col-span-2 xl:col-span-5"
						}),
						/* @__PURE__ */ jsxs("button", {
							type: "submit",
							disabled: isBusy,
							className: "admin-primary-button h-38 xl:col-span-2",
							children: [isEditing ? /* @__PURE__ */ jsx(Pencil, {
								className: "h-[12px] w-[12px]",
								strokeWidth: 1.9
							}) : /* @__PURE__ */ jsx(Plus, {
								className: "h-[12px] w-[12px]",
								strokeWidth: 1.9
							}), isEditing ? "Save Product" : "Add Product"]
						})
					]
				})]
			}),
			products.length ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
				className: "admin-table-wrap hidden md:block",
				children: /* @__PURE__ */ jsxs("table", {
					className: "admin-table",
					children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
						/* @__PURE__ */ jsx("th", { children: "Product" }),
						/* @__PURE__ */ jsx("th", { children: "Code" }),
						/* @__PURE__ */ jsx("th", { children: "Category" }),
						/* @__PURE__ */ jsx("th", { children: "Price" }),
						/* @__PURE__ */ jsx("th", { children: "Tax" }),
						/* @__PURE__ */ jsx("th", { children: "Unit" }),
						/* @__PURE__ */ jsx("th", { children: "Schedule" }),
						/* @__PURE__ */ jsx("th", { children: "Status" }),
						/* @__PURE__ */ jsx("th", {
							className: "text-right",
							children: "Actions"
						})
					] }) }), /* @__PURE__ */ jsx("tbody", { children: products.map((product) => /* @__PURE__ */ jsxs("tr", { children: [
						/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
							className: "font-semibold text-charcoal",
							children: product.name
						}), product.description ? /* @__PURE__ */ jsx("p", {
							className: "mt-3 max-w-[32ch] text-[12px] text-pewter",
							children: product.description
						}) : null] }) }),
						/* @__PURE__ */ jsx("td", { children: product.code }),
						/* @__PURE__ */ jsx("td", { children: product.categoryId ? categoryMap.get(product.categoryId) || "Unmapped" : "Unassigned" }),
						/* @__PURE__ */ jsx("td", { children: formatCurrency(product.price) }),
						/* @__PURE__ */ jsx("td", { children: product.taxPercent == null ? "Not set" : `${formatNumber(Number(product.taxPercent))}%` }),
						/* @__PURE__ */ jsx("td", { children: product.unit }),
						/* @__PURE__ */ jsxs("td", { children: [
							product.defaultQuantity,
							" / ",
							titleCase(product.defaultSchedule)
						] }),
						/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(StatusPill, {
							tone: product.isActive ? "success" : "neutral",
							children: product.isActive ? "Active" : "Inactive"
						}) }),
						/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-end gap-8",
							children: [/* @__PURE__ */ jsxs("button", {
								type: "button",
								disabled: isBusy,
								onClick: () => startEdit(product),
								className: "admin-secondary-button h-32 px-10 text-[12px]",
								children: [/* @__PURE__ */ jsx(Pencil, {
									className: "h-[12px] w-[12px]",
									strokeWidth: 1.9
								}), "Edit"]
							}), /* @__PURE__ */ jsxs("button", {
								type: "button",
								disabled: isBusy,
								onClick: () => void handleDelete(product),
								className: "admin-danger-button",
								children: [/* @__PURE__ */ jsx(Trash2, {
									className: "h-[12px] w-[12px]",
									strokeWidth: 1.9
								}), "Archive"]
							})]
						}) })
					] }, product.id)) })]
				})
			}), /* @__PURE__ */ jsx("div", {
				className: "grid gap-10 md:hidden",
				children: products.map((product) => /* @__PURE__ */ jsxs("div", {
					className: "admin-data-row border-l-[4px] border-l-sage-card p-14",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-start justify-between gap-8",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
								className: "text-[14px] font-semibold text-charcoal",
								children: product.name
							}), /* @__PURE__ */ jsx("p", {
								className: "mt-3 text-[12px] text-graphite",
								children: product.code
							})] }), /* @__PURE__ */ jsx(StatusPill, {
								tone: product.isActive ? "success" : "neutral",
								children: product.isActive ? "Active" : "Inactive"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-12 grid grid-cols-2 gap-8",
							children: [
								/* @__PURE__ */ jsx(Field, {
									label: "Type",
									value: product.productType
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Category",
									value: product.categoryId ? categoryMap.get(product.categoryId) || "Unmapped" : "Unassigned"
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Price",
									value: formatCurrency(product.price)
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Tax",
									value: product.taxPercent == null ? "Not set" : `${formatNumber(Number(product.taxPercent))}%`
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Unit",
									value: product.unit
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Default qty",
									value: String(product.defaultQuantity)
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Schedule",
									value: titleCase(product.defaultSchedule)
								})
							]
						}),
						product.description ? /* @__PURE__ */ jsx("p", {
							className: "mt-12 text-[13px] leading-relaxed text-graphite",
							children: product.description
						}) : null,
						/* @__PURE__ */ jsxs("div", {
							className: "mt-14 grid grid-cols-2 gap-8",
							children: [/* @__PURE__ */ jsxs("button", {
								type: "button",
								disabled: isBusy,
								onClick: () => startEdit(product),
								className: "admin-secondary-button h-34 px-11 text-[12px]",
								children: [/* @__PURE__ */ jsx(Pencil, {
									className: "h-[12px] w-[12px]",
									strokeWidth: 1.9
								}), "Edit"]
							}), /* @__PURE__ */ jsxs("button", {
								type: "button",
								disabled: isBusy,
								onClick: () => void handleDelete(product),
								className: "admin-danger-button h-34",
								children: [/* @__PURE__ */ jsx(Trash2, {
									className: "h-[12px] w-[12px]",
									strokeWidth: 1.9
								}), "Archive"]
							})]
						})
					]
				}, product.id))
			})] }) : /* @__PURE__ */ jsx(EmptyState, { title: "No products found" })
		]
	});
}
function DispatchPanel({ orders, pendingOrders, dispatchDate, setDispatchDate, isBusy, onRun, onDeliver }) {
	const displayedOrders = orders.slice(0, 30);
	return /* @__PURE__ */ jsxs(Panel, {
		title: "Dispatch",
		kicker: `${pendingOrders.length} pending`,
		actionIcon: Truck,
		actionText: "Delivery runs",
		children: [/* @__PURE__ */ jsxs("form", {
			onSubmit: onRun,
			className: "admin-form-card mb-16 grid gap-10 sm:grid-cols-[1fr_auto]",
			children: [/* @__PURE__ */ jsx("input", {
				type: "date",
				value: dispatchDate,
				onChange: (event) => setDispatchDate(event.target.value),
				className: "admin-input h-38"
			}), /* @__PURE__ */ jsxs("button", {
				type: "submit",
				disabled: isBusy,
				className: "admin-primary-button",
				children: [/* @__PURE__ */ jsx(Send, {
					className: "h-[12px] w-[12px]",
					strokeWidth: 1.9
				}), "Generate Orders"]
			})]
		}), orders.length ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
			className: "admin-table-wrap hidden md:block",
			children: /* @__PURE__ */ jsxs("table", {
				className: "admin-table",
				children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("th", { children: "Customer" }),
					/* @__PURE__ */ jsx("th", { children: "Address" }),
					/* @__PURE__ */ jsx("th", { children: "Date" }),
					/* @__PURE__ */ jsx("th", { children: "Status" }),
					/* @__PURE__ */ jsx("th", {
						className: "text-right",
						children: "Action"
					})
				] }) }), /* @__PURE__ */ jsx("tbody", { children: displayedOrders.map((order) => /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", {
						className: "font-semibold text-charcoal",
						children: order.subscription?.user?.name || "Customer"
					}) }),
					/* @__PURE__ */ jsx("td", { children: order.subscription?.user?.addresses?.[0]?.streetAddress || "Address pending" }),
					/* @__PURE__ */ jsx("td", { children: formatDate(order.deliveryDate) }),
					/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(StatusPill, {
						tone: statusTone(order.status),
						children: order.status
					}) }),
					/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("div", {
						className: "flex justify-end",
						children: order.status === "pending" ? /* @__PURE__ */ jsxs("button", {
							type: "button",
							disabled: isBusy,
							onClick: () => onDeliver(order.id),
							className: "admin-primary-button h-32 px-10 text-[12px]",
							children: [/* @__PURE__ */ jsx(PackageCheck, {
								className: "h-[12px] w-[12px]",
								strokeWidth: 1.9
							}), "Delivered"]
						}) : /* @__PURE__ */ jsxs("span", {
							className: "inline-flex items-center gap-4 text-[12px] font-semibold text-forest-ink",
							children: [/* @__PURE__ */ jsx(Check, {
								className: "h-[14px] w-[14px]",
								strokeWidth: 2.2
							}), "Delivered"]
						})
					}) })
				] }, order.id)) })]
			})
		}), /* @__PURE__ */ jsx("div", {
			className: "grid gap-10 md:hidden",
			children: displayedOrders.map((order) => /* @__PURE__ */ jsxs("div", {
				className: "admin-data-row border-l-[4px] border-l-sky-card p-14",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-start justify-between gap-8",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							className: "text-[14px] font-semibold text-charcoal",
							children: order.subscription?.user?.name || "Customer"
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-3 text-[12px] leading-relaxed text-graphite",
							children: order.subscription?.user?.addresses?.[0]?.streetAddress || "Address pending"
						})] }), /* @__PURE__ */ jsx(StatusPill, {
							tone: statusTone(order.status),
							children: order.status
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-12",
						children: /* @__PURE__ */ jsx(Field, {
							label: "Delivery date",
							value: formatDate(order.deliveryDate)
						})
					}),
					order.status === "pending" ? /* @__PURE__ */ jsxs("button", {
						type: "button",
						disabled: isBusy,
						onClick: () => onDeliver(order.id),
						className: "admin-primary-button mt-14 h-34 w-full px-11 text-[12px]",
						children: [/* @__PURE__ */ jsx(PackageCheck, {
							className: "h-[12px] w-[12px]",
							strokeWidth: 1.9
						}), "Delivered"]
					}) : /* @__PURE__ */ jsxs("div", {
						className: "mt-14 flex items-center justify-center gap-4 text-[13px] font-semibold text-forest-ink",
						children: [/* @__PURE__ */ jsx(Check, {
							className: "h-[14px] w-[14px]",
							strokeWidth: 2.2
						}), "Delivered"]
					})
				]
			}, order.id))
		})] }) : /* @__PURE__ */ jsx(EmptyState, { title: "No dispatch orders yet" })]
	});
}
function ProcurementPanel({ farmers, logs, isBusy, onFarmerSubmit, onProcurementSubmit }) {
	const displayedLogs = logs.slice(0, 30);
	return /* @__PURE__ */ jsxs(Panel, {
		title: "Procurement",
		kicker: `${logs.length} entries`,
		actionIcon: Sprout,
		actionText: "Farmer supply",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "mb-16 grid gap-14 xl:grid-cols-2",
			children: [/* @__PURE__ */ jsxs("form", {
				onSubmit: onFarmerSubmit,
				className: "admin-form-card",
				children: [/* @__PURE__ */ jsxs("h3", {
					className: "mb-12 flex items-center gap-8 font-inter text-[15px] font-semibold tracking-normal",
					children: [/* @__PURE__ */ jsx(UserPlus, {
						className: "h-[15px] w-[15px] text-forest-ink",
						strokeWidth: 1.8
					}), "Add farmer"]
				}), /* @__PURE__ */ jsxs("div", {
					className: "grid gap-10 sm:grid-cols-[1fr_1fr_auto]",
					children: [
						/* @__PURE__ */ jsx("input", {
							name: "name",
							required: true,
							placeholder: "Name",
							className: "admin-input"
						}),
						/* @__PURE__ */ jsx("input", {
							name: "phone",
							required: true,
							placeholder: "Phone",
							className: "admin-input"
						}),
						/* @__PURE__ */ jsx("button", {
							type: "submit",
							disabled: isBusy,
							className: "admin-button",
							children: "Save"
						})
					]
				})]
			}), /* @__PURE__ */ jsxs("form", {
				onSubmit: onProcurementSubmit,
				className: "admin-form-card",
				children: [/* @__PURE__ */ jsxs("h3", {
					className: "mb-12 flex items-center gap-8 font-inter text-[15px] font-semibold tracking-normal",
					children: [/* @__PURE__ */ jsx(Sprout, {
						className: "h-[15px] w-[15px] text-forest-ink",
						strokeWidth: 1.8
					}), "Log milk collection"]
				}), /* @__PURE__ */ jsxs("div", {
					className: "grid gap-10 sm:grid-cols-2 xl:grid-cols-6",
					children: [
						/* @__PURE__ */ jsxs("select", {
							name: "farmerId",
							required: true,
							className: "admin-input xl:col-span-2",
							children: [/* @__PURE__ */ jsx("option", {
								value: "",
								children: "Farmer"
							}), farmers.map((farmer) => /* @__PURE__ */ jsx("option", {
								value: farmer.id,
								children: farmer.name
							}, farmer.id))]
						}),
						/* @__PURE__ */ jsx("input", {
							name: "collectionDate",
							type: "date",
							className: "admin-input xl:col-span-2"
						}),
						/* @__PURE__ */ jsx("input", {
							name: "quantityLiters",
							type: "number",
							min: "1",
							step: "0.1",
							required: true,
							placeholder: "Liters",
							className: "admin-input"
						}),
						/* @__PURE__ */ jsx("input", {
							name: "fatPercentage",
							type: "number",
							min: "1",
							step: "0.1",
							required: true,
							placeholder: "Fat",
							className: "admin-input"
						}),
						/* @__PURE__ */ jsx("input", {
							name: "snfPercentage",
							type: "number",
							min: "1",
							step: "0.1",
							required: true,
							placeholder: "SNF",
							className: "admin-input"
						}),
						/* @__PURE__ */ jsx("button", {
							type: "submit",
							disabled: isBusy,
							className: "admin-button xl:col-span-2",
							children: "Save Entry"
						})
					]
				})]
			})]
		}), logs.length ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
			className: "admin-table-wrap hidden md:block",
			children: /* @__PURE__ */ jsxs("table", {
				className: "admin-table",
				children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("th", { children: "Farmer" }),
					/* @__PURE__ */ jsx("th", { children: "Collection Date" }),
					/* @__PURE__ */ jsx("th", { children: "Quantity" }),
					/* @__PURE__ */ jsx("th", { children: "Fat %" }),
					/* @__PURE__ */ jsx("th", { children: "SNF %" }),
					/* @__PURE__ */ jsx("th", { children: "Payout" }),
					/* @__PURE__ */ jsx("th", { children: "Status" })
				] }) }), /* @__PURE__ */ jsx("tbody", { children: displayedLogs.map((log) => /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", {
						className: "font-semibold text-charcoal",
						children: log.farmer?.name || "Farmer"
					}) }),
					/* @__PURE__ */ jsx("td", { children: formatDate(log.collectionDate) }),
					/* @__PURE__ */ jsxs("td", { children: [formatNumber(Number(log.quantityLiters)), " L"] }),
					/* @__PURE__ */ jsxs("td", { children: [log.fatPercentage, "%"] }),
					/* @__PURE__ */ jsxs("td", { children: [log.snfPercentage, "%"] }),
					/* @__PURE__ */ jsxs("td", { children: ["INR ", formatNumber(Number(log.totalPayout))] }),
					/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(StatusPill, {
						tone: "success",
						children: "Settled"
					}) })
				] }, log.id)) })]
			})
		}), /* @__PURE__ */ jsx("div", {
			className: "grid gap-10 md:hidden",
			children: displayedLogs.map((log) => /* @__PURE__ */ jsxs("div", {
				className: "admin-data-row border-l-[4px] border-l-sage-card p-14",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center justify-between gap-8",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
						className: "text-[14px] font-semibold text-charcoal",
						children: log.farmer?.name || "Farmer"
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-3 text-[12px] text-graphite",
						children: formatDate(log.collectionDate)
					})] }), /* @__PURE__ */ jsx(StatusPill, {
						tone: "success",
						children: "Settled"
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "mt-12 grid grid-cols-2 gap-8",
					children: [
						/* @__PURE__ */ jsx(Field, {
							label: "Quantity",
							value: `${formatNumber(Number(log.quantityLiters))} L`
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Fat",
							value: `${log.fatPercentage}%`
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "SNF",
							value: `${log.snfPercentage}%`
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Payout",
							value: `INR ${formatNumber(Number(log.totalPayout))}`
						})
					]
				})]
			}, log.id))
		})] }) : /* @__PURE__ */ jsx(EmptyState, { title: "No procurement entries yet" })]
	});
}
function NotificationsPanel({ notifications, isBusy, onRetry }) {
	const [activeStatus, setActiveStatus] = useState("pending");
	const notificationGroups = {
		pending: notifications.filter((notification) => isPendingNotification(notification.status)),
		sent: notifications.filter((notification) => isSentNotification(notification.status)),
		failed: notifications.filter((notification) => isFailedNotification(notification.status))
	};
	const activeNotifications = notificationGroups[activeStatus];
	return /* @__PURE__ */ jsxs(Panel, {
		title: "Notification Center",
		kicker: `${notifications.length} records`,
		actionIcon: Bell,
		actionText: "Outbound queue",
		children: [/* @__PURE__ */ jsx("div", {
			className: "mb-16 flex flex-wrap gap-8",
			children: [
				"pending",
				"sent",
				"failed"
			].map((status) => /* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => setActiveStatus(status),
				className: `admin-secondary-button h-34 px-12 text-[12px] ${activeStatus === status ? "bg-forest-ink text-pure-white" : ""}`,
				children: [titleCase(status), /* @__PURE__ */ jsx("span", {
					className: "rounded-[999px] bg-pure-white/25 px-7 py-2",
					children: notificationGroups[status].length
				})]
			}, status))
		}), activeNotifications.length ? /* @__PURE__ */ jsx("div", {
			className: "grid gap-12 lg:grid-cols-2",
			children: activeNotifications.map((notification) => {
				const statusTone = isFailedNotification(notification.status) ? "danger" : isPendingNotification(notification.status) ? "warning" : "success";
				return /* @__PURE__ */ jsxs("article", {
					className: "rounded-[8px] border border-forest-ink/10 bg-pure-white p-16 shadow-sm",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-start justify-between gap-10",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
								className: "text-[14px] font-semibold text-charcoal",
								children: getNotificationMessage(notification)
							}), /* @__PURE__ */ jsx("p", {
								className: "mt-4 text-[12px] text-graphite",
								children: getNotificationRecipient(notification)
							})] }), /* @__PURE__ */ jsx(StatusPill, {
								tone: statusTone,
								children: notification.status
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-14 grid gap-10 sm:grid-cols-2",
							children: [/* @__PURE__ */ jsx(Field, {
								label: "Channel",
								value: titleCase(notification.channel || notification.type)
							}), /* @__PURE__ */ jsx(Field, {
								label: "Time",
								value: formatDateTime(getNotificationTime(notification))
							})]
						}),
						isFailedNotification(notification.status) ? /* @__PURE__ */ jsxs("button", {
							type: "button",
							disabled: isBusy,
							onClick: () => onRetry(notification.id),
							className: "admin-primary-button mt-14 h-34 px-11 text-[12px]",
							children: [/* @__PURE__ */ jsx(RefreshCcw, {
								className: "h-[12px] w-[12px]",
								strokeWidth: 1.9
							}), "Retry"]
						}) : null
					]
				}, notification.id);
			})
		}) : /* @__PURE__ */ jsx(EmptyState, { title: `No ${activeStatus} notifications` })]
	});
}
function Panel({ title, kicker, actionIcon: Icon, actionText, children }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "admin-panel p-16 sm:p-[22px] xl:p-24",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "mb-16 flex flex-col gap-10 border-b border-forest-ink/10 pb-14 sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
				className: "text-caption font-semibold uppercase tracking-[0.18em] text-forest-ink",
				children: kicker
			}), /* @__PURE__ */ jsx("h2", {
				className: "mt-3 font-inter text-[18px] font-semibold tracking-normal text-charcoal",
				children: title
			})] }), /* @__PURE__ */ jsxs("div", {
				className: "inline-flex w-fit items-center gap-8 rounded-[8px] border border-forest-ink/10 bg-[#eef2e3] px-12 py-9 text-[13px] font-medium text-forest-ink",
				children: [/* @__PURE__ */ jsx(Icon, {
					className: "h-[12px] w-[12px]",
					strokeWidth: 1.9
				}), actionText]
			})]
		}), children]
	});
}
function StatCard({ icon: Icon, label, value, detail, tone }) {
	const toneClass = {
		orders: "from-sky-card/70 to-pure-white text-forest-ink bg-sky-card/80 border-sky-card",
		revenue: "from-sage-card to-pure-white text-forest-ink bg-sage-card border-moss",
		sales: "from-vivid-lime/35 to-pure-white text-forest-ink bg-vivid-lime/45 border-vivid-lime",
		pending: "from-amber-50 to-pure-white text-amber-700 bg-amber-100 border-amber-200",
		delivered: "from-moss/35 to-pure-white text-forest-ink bg-moss/40 border-moss",
		users: "from-bone to-pure-white text-forest-ink bg-bone border-moss"
	}[tone];
	return /* @__PURE__ */ jsxs("div", {
		className: `crm-stat-card rounded-[8px] border bg-gradient-to-br p-16 ${toneClass}`,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "mb-14 flex items-center justify-between gap-12",
				children: [/* @__PURE__ */ jsx("p", {
					className: "text-[12px] font-semibold uppercase tracking-[0.14em] text-charcoal/62",
					children: label
				}), /* @__PURE__ */ jsx("span", {
					className: "crm-stat-icon inline-flex h-30 w-30 items-center justify-center bg-pure-white/80 shadow-sm",
					children: /* @__PURE__ */ jsx(Icon, {
						className: "h-[14px] w-[14px]",
						strokeWidth: 1.8
					})
				})]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "font-reckless text-[34px] font-medium leading-none tracking-normal text-charcoal",
				children: value
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-5 inline-flex rounded-[999px] bg-pure-white/70 px-9 py-4 text-[12px] font-medium text-graphite",
				children: detail
			})
		]
	});
}
function Field({ label, value, wide = false }) {
	return /* @__PURE__ */ jsxs("div", {
		className: wide ? "sm:col-span-2" : "",
		children: [/* @__PURE__ */ jsx("p", {
			className: "text-[11px] font-medium uppercase tracking-[0.12em] text-pewter",
			children: label
		}), /* @__PURE__ */ jsx("p", {
			className: "mt-2 text-[13px] text-graphite",
			children: value
		})]
	});
}
function StatusPill({ children, tone = "neutral" }) {
	return /* @__PURE__ */ jsx("span", {
		className: `admin-status-badge admin-status-${tone}`,
		"data-tone": tone,
		children
	});
}
function Alert({ children, tone }) {
	return /* @__PURE__ */ jsx("div", {
		className: `mb-14 rounded-[8px] border px-14 py-12 text-[14px] ${tone === "success" ? "border-forest-ink/15 bg-vivid-lime/25 text-forest-ink" : "border-red-200 bg-red-50 text-red-800"}`,
		children
	});
}
function EmptyState({ title }) {
	return /* @__PURE__ */ jsx("div", {
		className: "rounded-[8px] border border-dashed border-forest-ink/20 bg-pure-white p-24 text-center text-[14px] text-graphite",
		children: title
	});
}
function getInventoryRows(products, subscriptions) {
	const reservedByProduct = /* @__PURE__ */ new Map();
	for (const subscription of subscriptions) {
		if (![
			"pending",
			"active",
			"paused"
		].includes(subscription.status)) continue;
		const productType = String(subscription.productType || "").toLowerCase();
		reservedByProduct.set(productType, (reservedByProduct.get(productType) || 0) + Number(subscription.quantity || 0));
	}
	return products.map((product) => {
		const productType = String(product.productType || product.name || "").toLowerCase();
		const hasStockData = product.currentStock != null || product.availableStock != null || product.reservedStock != null || Boolean(product.stockStatus);
		const reservedStock = Number(product.reservedStock ?? reservedByProduct.get(productType) ?? 0);
		const currentStock = Number(product.currentStock ?? (hasStockData ? 0 : 100));
		const availableStock = Number(product.availableStock ?? Math.max(currentStock - reservedStock, 0));
		const reorderLevel = Number(product.reorderLevel ?? Math.max(Number(product.defaultQuantity || 1) * 10, 10));
		const normalizedStatus = String(product.stockStatus || "").toLowerCase();
		const status = normalizedStatus.includes("out") || hasStockData && availableStock <= 0 ? "out" : normalizedStatus.includes("low") || hasStockData && availableStock <= reorderLevel ? "low" : "healthy";
		return {
			id: product.id,
			name: product.name,
			unit: product.unit || "unit",
			currentStock,
			reservedStock,
			availableStock,
			reorderLevel,
			status
		};
	});
}
function inventoryStatusMeta(status) {
	if (status === "out") return {
		label: "Out of Stock",
		tone: "danger"
	};
	if (status === "low") return {
		label: "Low Stock",
		tone: "warning"
	};
	return {
		label: "Healthy",
		tone: "success"
	};
}
function isPendingNotification(status) {
	return [
		"pending",
		"queued",
		"retrying",
		"scheduled"
	].includes(status.toLowerCase());
}
function isSentNotification(status) {
	return [
		"sent",
		"delivered",
		"success"
	].includes(status.toLowerCase());
}
function isFailedNotification(status) {
	return [
		"failed",
		"error",
		"bounced"
	].includes(status.toLowerCase());
}
function getNotificationDetail(notification, key) {
	const value = notification.details?.[key] ?? notification.metadata?.[key];
	return typeof value === "string" || typeof value === "number" ? String(value) : "";
}
function getNotificationMessage(notification) {
	return notification.message || notification.body || notification.title || getNotificationDetail(notification, "message") || getNotificationDetail(notification, "body") || `${titleCase(notification.type)} notification`;
}
function getNotificationRecipient(notification) {
	return notification.recipient || notification.phone || getNotificationDetail(notification, "recipient") || getNotificationDetail(notification, "phone") || getNotificationDetail(notification, "to") || "Recipient unavailable";
}
function getNotificationTime(notification) {
	return notification.sentAt || notification.failedAt || notification.createdAt;
}
function buildCrmMetrics(data) {
	const salesGrowth = getTrailingDays(8).map((day) => ({
		...day,
		leads: 0,
		salesUnits: 0
	}));
	const growthByKey = new Map(salesGrowth.map((point) => [point.key, point]));
	for (const lead of data.leads) {
		const key = toDateKey(lead.submittedAt);
		const point = key ? growthByKey.get(key) : void 0;
		if (point) point.leads += 1;
	}
	for (const subscription of data.subscriptions) {
		const key = toDateKey(subscription.createdAt || subscription.startDate);
		const point = key ? growthByKey.get(key) : void 0;
		if (point && subscription.status !== "terminated") point.salesUnits += Number(subscription.quantity || 0);
	}
	if (Array.isArray(data.commerceOrders)) for (const order of data.commerceOrders) {
		if (order.status === "cancelled" || order.status === "refunded") continue;
		const key = toDateKey(order.createdAt);
		const point = key ? growthByKey.get(key) : void 0;
		if (point) {
			let quantity = 0;
			if (Array.isArray(order.items)) quantity = order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
			point.salesUnits += quantity;
		}
	}
	const pipeline = [
		"pending",
		"active",
		"paused",
		"terminated"
	].map((status) => ({
		stage: titleCase(status),
		count: data.subscriptions.filter((subscription) => subscription.status === status).length,
		color: PIPELINE_COLORS[status]
	}));
	const productMap = /* @__PURE__ */ new Map();
	for (const subscription of data.subscriptions) {
		if (subscription.status === "terminated") continue;
		const product = titleCase(subscription.productType || "Milk");
		productMap.set(product, (productMap.get(product) || 0) + Number(subscription.quantity || 0));
	}
	if (Array.isArray(data.commerceOrders)) for (const order of data.commerceOrders) {
		if (order.status === "cancelled" || order.status === "refunded") continue;
		if (Array.isArray(order.items)) for (const item of order.items) {
			const product = titleCase(item.name || "Milk");
			productMap.set(product, (productMap.get(product) || 0) + Number(item.quantity || 0));
		}
	}
	const productMix = Array.from(productMap.entries()).map(([product, units]) => ({
		product,
		units
	})).sort((a, b) => b.units - a.units);
	const activeUnits = data.subscriptions.filter((subscription) => subscription.status === "active").reduce((total, subscription) => total + Number(subscription.quantity || 0), 0);
	const pendingUnits = data.subscriptions.filter((subscription) => subscription.status === "pending").reduce((total, subscription) => total + Number(subscription.quantity || 0), 0);
	const totalPipeline = data.subscriptions.filter((subscription) => subscription.status !== "terminated").length;
	const conversionRate = totalPipeline === 0 ? 0 : Math.round(data.subscriptions.filter((subscription) => subscription.status === "active").length / totalPipeline * 100);
	const currentWindow = salesGrowth.slice(-4).reduce((total, point) => total + point.salesUnits, 0);
	const previousWindow = salesGrowth.slice(0, -4).reduce((total, point) => total + point.salesUnits, 0);
	const salesGrowthPercent = previousWindow === 0 ? currentWindow > 0 ? 100 : 0 : Math.round((currentWindow - previousWindow) / previousWindow * 100);
	return {
		salesGrowth,
		pipeline,
		productMix: productMix.length ? productMix : [{
			product: "No demand",
			units: 1
		}],
		conversionRate,
		pendingUnits,
		activeUnits,
		salesGrowthPercent
	};
}
function getTrailingDays(count) {
	return Array.from({ length: count }, (_, index) => {
		const date = /* @__PURE__ */ new Date();
		date.setDate(date.getDate() - (count - index - 1));
		return {
			key: toDateKey(date) || "",
			label: new Intl.DateTimeFormat("en-IN", {
				day: "2-digit",
				month: "short"
			}).format(date)
		};
	});
}
function toDateKey(value) {
	if (!value) return "";
	if (value instanceof Date) return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
	const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
	if (match) return match[1];
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function statusTone(status) {
	if ([
		"active",
		"accepted",
		"assigned",
		"out_for_delivery",
		"delivered"
	].includes(status)) return "success";
	if ([
		"pending",
		"processing",
		"paused"
	].includes(status)) return "warning";
	if ([
		"terminated",
		"failed",
		"rejected",
		"cancelled",
		"refunded"
	].includes(status)) return "danger";
	return "neutral";
}
function titleCase(value) {
	return value.replace(/[_-]+/g, " ").replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}
function formatDate(value) {
	if (!value) return "Not set";
	return new Intl.DateTimeFormat("en-IN", {
		day: "2-digit",
		month: "short",
		year: "numeric"
	}).format(new Date(value));
}
function formatDateTime(value) {
	if (!value) return "Not set";
	return new Intl.DateTimeFormat("en-IN", {
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit"
	}).format(new Date(value));
}
function formatTimeOnly(value) {
	if (!value) return "Not set";
	return new Intl.DateTimeFormat("en-IN", {
		hour: "2-digit",
		minute: "2-digit"
	}).format(new Date(value));
}
function formatNumber(value) {
	return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value || 0);
}
function formatCurrency(value) {
	if (value == null) return "Not priced";
	return `INR ${formatNumber(Number(value))}`;
}
//#endregion
//#region src/routes/admin.$role.tsx
var $$splitComponentImporter = () => import("./admin._role-BhaTXeoO.js");
var Route = createFileRoute("/admin/$role")({
	head: ({ params }) => {
		const loginPage = getAdminRoleLoginPage(params.role);
		return { meta: [
			{ title: loginPage ? `${loginPage.title} Login | HasuMane Admin` : "HasuMane Admin" },
			{
				name: "description",
				content: loginPage?.description || "HasuMane role-based admin login for production operations."
			},
			{
				name: "robots",
				content: "noindex,nofollow,noarchive"
			}
		] };
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { getAdminRoleLoginPage as i, AdminPage as n, Route$1 as r, Route as t };
