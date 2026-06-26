import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BadgePercent,
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Check,
  CircleHelp,
  Clock,
  ClipboardList,
  CreditCard,
  Database,
  Eye,
  EyeOff,
  Headphones,
  Image as ImageIcon,
  IndianRupee,
  KeyRound,
  Leaf,
  LogOut,
  Milk,
  PackageCheck,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Sprout,
  Store,
  Tags,
  Trash2,
  TrendingUp,
  Truck,
  UserPlus,
  UserCog,
  Users,
  Warehouse,
  X,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import {
  createAdminSession,
  captureLead,
  createCategory,
  createFarmer,
  createProcurementLog,
  createProduct,
  createInventoryItem,
  deleteLead,
  deleteCategory,
  deleteInventoryItem,
  deleteProduct,
  deleteSubscription,
  destroyAdminSession,
  fetchAdminDashboard,
  fetchInventoryItems,
  getAdminApiBaseUrl,
  getStoredAdminAccessToken,
  markOrderDelivered,
  retryNotification,
  runDispatch,
  saveSetting,
  adjustInventoryItem,
  updateCategory,
  updateProduct,
  updateSubscriptionStatus,
  updateCommerceOrderStatus,
  type AppSetting,
  type AppSettingPayload,
  type AuditLog,
  type AdminDashboardData,
  type CommerceOrder,
  type DailyOrder,
  type Lead,
  type LoginHistory,
  type InventoryItem,
  type NotificationRecord,
  type ProcurementLog,
  type Product,
  type ProductCategory,
  type ProductCategoryPayload,
  type ProductPayload,
  type RolePermission,
  type Subscription,
  type SubscriptionStatus,
  type User,
  type UserRole,
  type InventoryItemPayload,
  type StockAdjustmentPayload,
  verifyAdminSession,
} from "@/lib/admin-api";
import type { LeadSubmission } from "@/lib/leads";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "HasuMane Admin" },
      {
        name: "description",
        content:
          "HasuMane operations dashboard for leads, subscriptions, dispatch, and procurement.",
      },
      { name: "robots", content: "noindex,nofollow,noarchive" },
    ],
  }),
  component: AdminPage,
});

type AdminTab =
  | "overview"
  | "orders"
  | "leads"
  | "subscriptions"
  | "products"
  | "categories"
  | "inventory"
  | "customers"
  | "deliveryPartners"
  | "coupons"
  | "payments"
  | "analytics"
  | "support"
  | "content"
  | "dispatch"
  | "procurement"
  | "notifications"
  | "usersRoles"
  | "architecture"
  | "superAdminPanel"
  | "adminPanel"
  | "managerPanel"
  | "customerSupportPanel"
  | "inventoryManagerPanel"
  | "deliveryManagerPanel"
  | "settings"
  | "security";

type RolePanelTab =
  | "superAdminPanel"
  | "adminPanel"
  | "managerPanel"
  | "customerSupportPanel"
  | "inventoryManagerPanel"
  | "deliveryManagerPanel";

export type AdminLoginRole = Extract<
  UserRole,
  | "super_admin"
  | "admin"
  | "manager"
  | "customer_support"
  | "inventory_manager"
  | "delivery_manager"
>;

export type AdminRoleLoginPage = {
  slug: string;
  path: string;
  role: AdminLoginRole;
  tabId: RolePanelTab;
  title: string;
  eyebrow: string;
  headline: string;
  description: string;
  features: Array<{ label: string; value: string }>;
};

export const adminRoleLoginPages: AdminRoleLoginPage[] = [
  {
    slug: "super-admin",
    path: "/admin/super-admin",
    role: "super_admin",
    tabId: "superAdminPanel",
    title: "Super Admin",
    eyebrow: "Founder workspace",
    headline: "Control security, settings, users, and platform approvals.",
    description:
      "Use this protected entry point for full-platform oversight, audit review, API controls, and final business decisions.",
    features: [
      { label: "Access", value: "Full control" },
      { label: "Security", value: "Audit first" },
      { label: "Scope", value: "All modules" },
    ],
  },
  {
    slug: "admin",
    path: "/admin/admin",
    role: "admin",
    tabId: "adminPanel",
    title: "Admin",
    eyebrow: "Operations workspace",
    headline: "Run products, orders, customers, campaigns, and notifications.",
    description:
      "Use this login for day-to-day operating teams that need broad business controls without security ownership.",
    features: [
      { label: "Access", value: "Operations" },
      { label: "Review", value: "Refunds" },
      { label: "Scope", value: "Commerce" },
    ],
  },
  {
    slug: "manager",
    path: "/admin/manager",
    role: "manager",
    tabId: "managerPanel",
    title: "Manager",
    eyebrow: "Business workspace",
    headline: "Coordinate sales, fulfillment, reporting, and customer growth.",
    description:
      "Use this role page for managers who need dashboards, analytics, order oversight, and operational exports.",
    features: [
      { label: "Access", value: "Scoped" },
      { label: "Reports", value: "Exports" },
      { label: "Scope", value: "Growth" },
    ],
  },
  {
    slug: "customer-support",
    path: "/admin/customer-support",
    role: "customer_support",
    tabId: "customerSupportPanel",
    title: "Customer Support",
    eyebrow: "Support workspace",
    headline: "Resolve customer issues, refunds, complaints, and order updates.",
    description:
      "Use this login for support teams handling customer history, tickets, conversations, and service exceptions.",
    features: [
      { label: "Access", value: "Support" },
      { label: "Privacy", value: "Masked" },
      { label: "Scope", value: "Customers" },
    ],
  },
  {
    slug: "inventory-manager",
    path: "/admin/inventory-manager",
    role: "inventory_manager",
    tabId: "inventoryManagerPanel",
    title: "Inventory Manager",
    eyebrow: "Inventory workspace",
    headline: "Manage catalog, categories, stock, suppliers, and purchase records.",
    description:
      "Use this role page for inventory teams responsible for product readiness and stock movement discipline.",
    features: [
      { label: "Access", value: "Stock" },
      { label: "Alerts", value: "Low stock" },
      { label: "Scope", value: "Catalog" },
    ],
  },
  {
    slug: "delivery-manager",
    path: "/admin/delivery-manager",
    role: "delivery_manager",
    tabId: "deliveryManagerPanel",
    title: "Delivery Manager",
    eyebrow: "Delivery workspace",
    headline: "Manage dispatch, partner readiness, tracking, and proof of delivery.",
    description:
      "Use this login for delivery leads coordinating riders, route exceptions, assignment, and performance.",
    features: [
      { label: "Access", value: "Dispatch" },
      { label: "Proof", value: "Required" },
      { label: "Scope", value: "Delivery" },
    ],
  },
];

const rolePanelEntries = adminRoleLoginPages.map(({ tabId, role }) => ({ tabId, role }));

export function getAdminRoleLoginPage(slug?: string) {
  return adminRoleLoginPages.find((page) => page.slug === slug);
}

function getAdminRoleLoginPageByRole(role?: AdminLoginRole) {
  return adminRoleLoginPages.find((page) => page.role === role);
}

function getRolePanelTab(role?: AdminLoginRole): AdminTab {
  return getAdminRoleLoginPageByRole(role)?.tabId || "overview";
}

type AdminNavItem = {
  id: AdminTab;
  label: string;
  icon: LucideIcon;
  status?: "live" | "planned";
};

const tabRegistry: Record<AdminTab, AdminNavItem> = {
  overview: { id: "overview", label: "Dashboard", icon: Activity, status: "live" },
  orders: { id: "orders", label: "Orders", icon: ShoppingCart, status: "live" },
  leads: { id: "leads", label: "Leads", icon: ClipboardList, status: "live" },
  subscriptions: { id: "subscriptions", label: "Subscriptions", icon: Milk, status: "live" },
  products: { id: "products", label: "Products", icon: PackageCheck, status: "live" },
  categories: { id: "categories", label: "Categories", icon: Tags, status: "live" },
  inventory: { id: "inventory", label: "Stock", icon: Warehouse, status: "live" },
  customers: { id: "customers", label: "Users", icon: Users, status: "live" },
  deliveryPartners: {
    id: "deliveryPartners",
    label: "Delivery Partners",
    icon: Truck,
    status: "planned",
  },
  coupons: { id: "coupons", label: "Coupons & Offers", icon: BadgePercent, status: "planned" },
  payments: { id: "payments", label: "Payments", icon: CreditCard, status: "planned" },
  analytics: { id: "analytics", label: "Reports", icon: BarChart3, status: "live" },
  support: { id: "support", label: "Support", icon: Headphones, status: "planned" },
  content: { id: "content", label: "Content", icon: ImageIcon, status: "planned" },
  dispatch: { id: "dispatch", label: "Dispatch", icon: Truck, status: "live" },
  procurement: { id: "procurement", label: "Procurement", icon: Sprout, status: "live" },
  notifications: { id: "notifications", label: "Notifications", icon: Bell, status: "live" },
  usersRoles: { id: "usersRoles", label: "Users & Roles", icon: UserCog, status: "planned" },
  architecture: {
    id: "architecture",
    label: "Insights",
    icon: Database,
    status: "live",
  },
  superAdminPanel: {
    id: "superAdminPanel",
    label: "Super Admin",
    icon: ShieldCheck,
    status: "live",
  },
  adminPanel: { id: "adminPanel", label: "Admin", icon: UserCog, status: "live" },
  managerPanel: { id: "managerPanel", label: "Manager", icon: BarChart3, status: "live" },
  customerSupportPanel: {
    id: "customerSupportPanel",
    label: "Customer Support",
    icon: Headphones,
    status: "live",
  },
  inventoryManagerPanel: {
    id: "inventoryManagerPanel",
    label: "Inventory Manager",
    icon: Warehouse,
    status: "live",
  },
  deliveryManagerPanel: {
    id: "deliveryManagerPanel",
    label: "Delivery Manager",
    icon: Truck,
    status: "live",
  },
  settings: { id: "settings", label: "Settings", icon: Settings, status: "live" },
  security: { id: "security", label: "Audit Logs", icon: Shield, status: "live" },
};

const navSections: Array<{ title: string; items: AdminNavItem[] }> = [
  { title: "Dashboard", items: [tabRegistry.overview] },
  { title: "Customers", items: [tabRegistry.customers, tabRegistry.leads] },
  { title: "Sales", items: [tabRegistry.orders, tabRegistry.subscriptions] },
  {
    title: "Inventory",
    items: [tabRegistry.products, tabRegistry.categories, tabRegistry.inventory],
  },
  { title: "Operations", items: [tabRegistry.procurement, tabRegistry.notifications] },
  { title: "Analytics", items: [tabRegistry.analytics, tabRegistry.architecture] },
  { title: "System", items: [tabRegistry.security, tabRegistry.settings] },
];

const CRM_COLORS = ["#07503f", "#c3cda7", "#ad711f", "#b2cee7", "#b42318"];
const PIPELINE_COLORS: Record<string, string> = {
  pending: "#ad711f",
  active: "#07503f",
  paused: "#b2cee7",
  terminated: "#b42318",
};

type CrmMetrics = {
  salesGrowth: Array<{
    key: string;
    label: string;
    leads: number;
    salesUnits: number;
  }>;
  pipeline: Array<{
    stage: string;
    count: number;
    color: string;
  }>;
  productMix: Array<{
    product: string;
    units: number;
  }>;
  conversionRate: number;
  pendingUnits: number;
  activeUnits: number;
  salesGrowthPercent: number;
};

type BackendStatus = "checking" | "online" | "offline";

type FeatureModule = {
  title: string;
  kicker: string;
  icon: LucideIcon;
  summary: string;
  controls: string[];
  reports?: string[];
};

type AdminControl = "View" | "Create" | "Edit" | "Delete" | "Export";

type AdminRoleBlueprint = {
  role: UserRole;
  title: string;
  subtitle: string;
  owner: string;
  risk: "Critical" | "High" | "Scoped";
  icon: LucideIcon;
  controls: AdminControl[];
  modules: string[];
  guardrails: string[];
  dashboardWidgets: string[];
  workflows: string[];
  dataTables: string[];
  apiScope: string;
  securityControls: string[];
};

type ArchitectureLayer = {
  title: string;
  detail: string;
  icon: LucideIcon;
  items: string[];
};

type DatabaseDomain = {
  title: string;
  tables: string[];
};

type ApiGroup = {
  title: string;
  count: string;
  detail: string;
};

type InfrastructureItem = {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
};

type SecurityGroup = {
  title: string;
  controls: string[];
};

const adminControlLabels: AdminControl[] = ["View", "Create", "Edit", "Delete", "Export"];
const permissionControlFields: Record<AdminControl, keyof RolePermission> = {
  View: "canView",
  Create: "canCreate",
  Edit: "canEdit",
  Delete: "canDelete",
  Export: "canExport",
};

const adminRoleBlueprints: AdminRoleBlueprint[] = [
  {
    role: "super_admin",
    title: "Super Admin",
    subtitle: "Owns platform configuration, security, billing, users, and final approvals.",
    owner: "Founder / Platform owner",
    risk: "Critical",
    icon: ShieldCheck,
    controls: ["View", "Create", "Edit", "Delete", "Export"],
    modules: ["Dashboard", "Orders", "Products", "Users & Roles", "Settings", "Security"],
    guardrails: ["Two-factor auth", "Audit every write", "API key approval"],
    dashboardWidgets: [
      "Revenue",
      "Orders",
      "Users",
      "Delivery status",
      "Inventory alerts",
      "Sales charts",
    ],
    workflows: [
      "Admin role management",
      "Platform settings",
      "Security review",
      "Payment gateway controls",
      "Tax and shipping rules",
      "Audit log review",
    ],
    dataTables: [
      "admins",
      "admin_roles",
      "admin_activity_logs",
      "roles",
      "permissions",
      "user_sessions",
      "app_settings",
      "api_keys",
    ],
    apiScope: "Admin APIs 20+, Analytics APIs 10+, Settings and Security APIs",
    securityControls: [
      "JWT access token",
      "Refresh token",
      "Session management",
      "RBAC",
      "2FA for admins",
      "Rate limiting",
    ],
  },
  {
    role: "admin",
    title: "Admin",
    subtitle: "Runs day-to-day business operations with broad but supervised access.",
    owner: "Operations admin",
    risk: "High",
    icon: UserCog,
    controls: ["View", "Create", "Edit", "Export"],
    modules: ["Orders", "Products", "Customers", "Coupons", "Payments", "Notifications"],
    guardrails: ["No API secrets", "Refund review", "Settings approval"],
    dashboardWidgets: [
      "Revenue",
      "Orders",
      "Users",
      "Delivery status",
      "Inventory alerts",
      "Sales charts",
    ],
    workflows: [
      "CRUD products",
      "Order workflow",
      "Status updates",
      "Refund handling",
      "Coupon campaigns",
      "Banner publishing",
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
      "banners",
    ],
    apiScope: "Product APIs 20+, Order APIs 20+, Payment APIs 10+, Admin APIs 20+",
    securityControls: [
      "RBAC",
      "CSRF protection",
      "XSS protection",
      "SQL injection protection",
      "Password hashing",
    ],
  },
  {
    role: "manager",
    title: "Manager",
    subtitle: "Coordinates sales, fulfillment, product performance, and reporting.",
    owner: "Business manager",
    risk: "Scoped",
    icon: BarChart3,
    controls: ["View", "Create", "Edit", "Export"],
    modules: ["Dashboard", "Orders", "Products", "Customers", "Analytics"],
    guardrails: ["No destructive deletes", "Export watermark", "Approval notes"],
    dashboardWidgets: [
      "Revenue",
      "Orders",
      "Users",
      "Delivery status",
      "Inventory alerts",
      "Sales charts",
    ],
    workflows: [
      "Revenue reports",
      "Sales reports",
      "Product analytics",
      "Customer analytics",
      "Delivery analytics",
      "Campaign review",
    ],
    dataTables: [
      "sales_reports",
      "page_views",
      "user_activity",
      "orders",
      "products",
      "coupon_usage",
      "delivery_assignments",
    ],
    apiScope: "Analytics APIs 10+, Order APIs 20+, Product APIs 20+",
    securityControls: [
      "Scoped RBAC",
      "Export audit trail",
      "Session management",
      "Rate limiting",
      "Masked customer fields",
    ],
  },
  {
    role: "customer_support",
    title: "Customer Support",
    subtitle: "Handles customers, support tickets, complaint resolution, and refunds.",
    owner: "Support lead",
    risk: "Scoped",
    icon: Headphones,
    controls: ["View", "Edit", "Export"],
    modules: ["Customers", "Orders", "Support", "Refund Requests", "Notifications"],
    guardrails: ["Masked phone exports", "Refund limit", "Conversation history"],
    dashboardWidgets: [
      "Open tickets",
      "Refund queue",
      "Blocked users",
      "Order exceptions",
      "Complaint aging",
      "Login history",
    ],
    workflows: [
      "User details",
      "Block or unblock",
      "KYC verification",
      "Login history",
      "Ticket management",
      "Complaint handling",
    ],
    dataTables: [
      "users",
      "addresses",
      "user_sessions",
      "tickets",
      "ticket_messages",
      "orders",
      "refunds",
      "notifications",
    ],
    apiScope: "User APIs 15+, Order APIs 20+, Support APIs, Admin APIs 20+",
    securityControls: [
      "Masked PII",
      "Session management",
      "RBAC",
      "CSRF protection",
      "Audit customer changes",
    ],
  },
  {
    role: "inventory_manager",
    title: "Inventory Manager",
    subtitle: "Controls stock, categories, suppliers, purchase records, and warehouses.",
    owner: "Inventory lead",
    risk: "Scoped",
    icon: Warehouse,
    controls: ["View", "Create", "Edit", "Export"],
    modules: ["Products", "Categories", "Inventory", "Suppliers", "Purchase Records"],
    guardrails: ["Stock adjustment reason", "Supplier review", "Low-stock alerts"],
    dashboardWidgets: [
      "Inventory alerts",
      "Stock movement",
      "Active products",
      "Out of stock",
      "Supplier status",
      "Purchase records",
    ],
    workflows: [
      "CRUD products",
      "Categories",
      "Variants",
      "Inventory",
      "Inventory logs",
      "Supplier and warehouse management",
    ],
    dataTables: [
      "products",
      "categories",
      "product_variants",
      "product_images",
      "inventory",
      "inventory_logs",
      "suppliers",
      "purchase_records",
    ],
    apiScope: "Product APIs 20+, Inventory APIs, Admin APIs 20+",
    securityControls: [
      "Scoped RBAC",
      "Audit stock writes",
      "SQL injection protection",
      "CSRF protection",
      "Rate limiting",
    ],
  },
  {
    role: "delivery_manager",
    title: "Delivery Manager",
    subtitle: "Manages dispatch, delivery partners, tracking, and delivery performance.",
    owner: "Delivery lead",
    risk: "Scoped",
    icon: Truck,
    controls: ["View", "Create", "Edit", "Export"],
    modules: ["Orders", "Dispatch", "Delivery Partners", "Live Tracking", "Delivery Reports"],
    guardrails: ["Rider verification", "Proof of delivery", "Route exception log"],
    dashboardWidgets: [
      "Delivery status",
      "Assigned riders",
      "Route exceptions",
      "Tracking logs",
      "Proof pending",
      "Delivery analytics",
    ],
    workflows: [
      "Assign riders",
      "Track deliveries",
      "Delivery analytics",
      "Delivery zones",
      "Partner verification",
      "Proof of delivery",
    ],
    dataTables: [
      "delivery_partners",
      "delivery_assignments",
      "tracking_logs",
      "delivery_zones",
      "orders",
      "order_status_history",
      "addresses",
    ],
    apiScope: "Delivery APIs 15+, Order APIs 20+, Analytics APIs 10+",
    securityControls: [
      "Scoped RBAC",
      "Session management",
      "Rate limiting",
      "Audit assignment changes",
      "Proof capture controls",
    ],
  },
];

const productionArchitectureLayers: ArchitectureLayer[] = [
  {
    title: "Frontend",
    detail: "Next.js / TanStack client workspace for customers, admin, support, and operations.",
    icon: Store,
    items: ["Customer storefront", "Role-based admin routes", "Protected session UI"],
  },
  {
    title: "Load Balancer",
    detail: "Routes browser traffic to the API cluster and keeps deployments replaceable.",
    icon: Activity,
    items: ["TLS termination", "Health checks", "Traffic routing"],
  },
  {
    title: "API Server",
    detail: "NestJS production target with domain modules for Auth, Orders, and Products.",
    icon: Database,
    items: ["Auth", "Orders", "Products", "Delivery", "Analytics"],
  },
  {
    title: "PostgreSQL",
    detail: "Primary transactional store for users, catalog, orders, payments, and audit records.",
    icon: Database,
    items: ["25-35 tables", "Prisma ORM", "RBAC records"],
  },
  {
    title: "Redis / Storage / Queue",
    detail: "Fast cache, object assets, and async work for notifications and delivery events.",
    icon: RefreshCcw,
    items: ["Redis cache", "Cloudflare R2", "Background queue"],
  },
];

const databaseDomains: DatabaseDomain[] = [
  {
    title: "User System",
    tables: ["users", "roles", "permissions", "user_sessions", "addresses"],
  },
  {
    title: "Product System",
    tables: ["products", "categories", "product_variants", "product_images", "inventory"],
  },
  {
    title: "Order System",
    tables: ["orders", "order_items", "order_status_history", "carts", "wishlists"],
  },
  {
    title: "Payment System",
    tables: ["payments", "refunds", "transactions"],
  },
  {
    title: "Delivery System",
    tables: ["delivery_partners", "delivery_assignments", "tracking_logs", "delivery_zones"],
  },
  {
    title: "Marketing System",
    tables: ["coupons", "coupon_usage", "banners", "notifications"],
  },
  {
    title: "Support System",
    tables: ["tickets", "ticket_messages"],
  },
  {
    title: "Admin System",
    tables: ["admins", "admin_roles", "admin_activity_logs"],
  },
  {
    title: "Analytics System",
    tables: ["page_views", "sales_reports", "user_activity"],
  },
];

const productionApiGroups: ApiGroup[] = [
  { title: "Auth APIs", count: "15+", detail: "Login, refresh, logout, 2FA, sessions" },
  { title: "User APIs", count: "15+", detail: "Profiles, addresses, KYC, block state" },
  { title: "Product APIs", count: "20+", detail: "Products, categories, variants, stock" },
  { title: "Order APIs", count: "20+", detail: "Cart, checkout, workflow, status history" },
  { title: "Payment APIs", count: "10+", detail: "Payments, refunds, reconciliation" },
  { title: "Delivery APIs", count: "15+", detail: "Partners, assignment, tracking, zones" },
  { title: "Analytics APIs", count: "10+", detail: "Sales, customers, products, revenue" },
  { title: "Admin APIs", count: "20+", detail: "RBAC, settings, logs, module controls" },
];

const infrastructureItems: InfrastructureItem[] = [
  {
    title: "Backend",
    value: "NestJS",
    detail: "Modular API server target",
    icon: Database,
  },
  {
    title: "Database",
    value: "PostgreSQL",
    detail: "Transactional production data",
    icon: Database,
  },
  {
    title: "ORM",
    value: "Prisma",
    detail: "Schema and migrations",
    icon: ClipboardList,
  },
  {
    title: "Cache",
    value: "Redis",
    detail: "Sessions, rate limits, queues",
    icon: RefreshCcw,
  },
  {
    title: "Object Storage",
    value: "Cloudflare R2",
    detail: "Product images and proof files",
    icon: ImageIcon,
  },
  {
    title: "Monitoring",
    value: "Grafana + Prometheus",
    detail: "Metrics, alerts, dashboards",
    icon: BarChart3,
  },
  {
    title: "Deployment",
    value: "Dokploy",
    detail: "Production app delivery",
    icon: Truck,
  },
  {
    title: "CI/CD",
    value: "GitHub Actions",
    detail: "Build, test, deploy pipeline",
    icon: Check,
  },
];

const securityGroups: SecurityGroup[] = [
  {
    title: "Authentication",
    controls: ["JWT access token", "Refresh token", "Session management", "2FA for admins"],
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
      "Customer",
    ],
  },
  {
    title: "Protection",
    controls: [
      "Rate limiting",
      "CSRF protection",
      "XSS protection",
      "SQL injection protection",
      "Password hashing with bcrypt or argon2",
    ],
  },
];

const developmentOrder = [
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
  "Security Hardening",
];

const featureModules: Record<
  | "categories"
  | "inventory"
  | "coupons"
  | "payments"
  | "analytics"
  | "support"
  | "content"
  | "settings"
  | "security",
  FeatureModule
> = {
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
      "Export",
    ],
  },
  inventory: {
    title: "Inventory",
    kicker: "Stock control",
    icon: Warehouse,
    summary:
      "Track current stock, low-stock alerts, out-of-stock alerts, suppliers, and purchases.",
    controls: [
      "Current stock",
      "Low stock alerts",
      "Out of stock alerts",
      "Purchase records",
      "Supplier management",
      "Warehouse management",
    ],
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
      "Usage report",
    ],
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
      "Generate invoice",
    ],
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
      "AI sales insights",
    ],
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
      "Cancel order management",
    ],
  },
  content: {
    title: "Content Management",
    kicker: "Storefront content",
    icon: ImageIcon,
    summary: "Control homepage banners, featured products, blogs, FAQs, and policy pages.",
    controls: [
      "Homepage banners",
      "Featured products",
      "Blogs",
      "FAQs",
      "Terms & conditions",
      "Privacy policy",
    ],
  },
  settings: {
    title: "Settings",
    kicker: "Store configuration",
    icon: Store,
    summary:
      "Manage store information, taxes, delivery charges, gateways, email, and notifications.",
    controls: [
      "Store information",
      "Tax settings",
      "Delivery charges",
      "Payment gateway settings",
      "Email settings",
      "Notification settings",
      "API keys management",
    ],
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
      "API keys management",
    ],
  },
};

function getGreetingText() {
  return "Welcome";
}

export function AdminPage({ initialRole }: { initialRole?: AdminLoginRole } = {}) {
  const roleLoginPage = getAdminRoleLoginPageByRole(initialRole);
  const [token, setToken] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>(getRolePanelTab(initialRole));
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dispatchDate, setDispatchDate] = useState("");
  const sidebarNavRef = useRef<HTMLElement | null>(null);

  const loadDashboard = useCallback(
    async (nextToken = token) => {
      setIsLoading(true);
      setError("");
      try {
        const dashboardData = await fetchAdminDashboard(nextToken);
        setData(dashboardData);
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : "Admin data could not be loaded.";
        if (/unauthorized/i.test(message)) {
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
    },
    [token],
  );

  const loadInventory = useCallback(
    async (nextToken = token) => {
      if (!nextToken) return;
      try {
        const items = await fetchInventoryItems(nextToken);
        setInventoryItems(items);
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : "Inventory data could not be loaded.";
        setError((current) => current || message);
      }
    },
    [token],
  );

  useEffect(() => {
    let isMounted = true;
    verifyAdminSession().then((isAuthenticated) => {
      if (isMounted && isAuthenticated) {
        setToken(getStoredAdminAccessToken());
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function checkBackend() {
      try {
        const response = await fetch(`${getAdminApiBaseUrl()}/api/v1/health`, {
          cache: "no-store",
        });
        if (isMounted) setBackendStatus(response.ok ? "online" : "offline");
      } catch {
        if (isMounted) setBackendStatus("offline");
      }
    }

    void checkBackend();
    const interval = window.setInterval(checkBackend, 30_000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    void loadDashboard(token);
    void loadInventory(token);
  }, [loadDashboard, loadInventory, token]);

  useEffect(() => {
    if (!initialRole) return;
    setActiveTab(getRolePanelTab(initialRole));
  }, [initialRole]);

  const pendingSubscriptions = useMemo(
    () => data?.subscriptions.filter((subscription) => subscription.status === "pending") ?? [],
    [data?.subscriptions],
  );
  const activeSubscriptions = useMemo(
    () => data?.subscriptions.filter((subscription) => subscription.status === "active") ?? [],
    [data?.subscriptions],
  );
  const pendingOrders = useMemo(
    () => data?.orders.filter((order) => order.status === "pending") ?? [],
    [data?.orders],
  );
  const customerUsers = useMemo(
    () => data?.users.filter((user) => user.role === "consumer") ?? [],
    [data?.users],
  );
  const deliveryPartners = useMemo(
    () => data?.users.filter((user) => user.role === "rider") ?? [],
    [data?.users],
  );
  const crmMetrics = useMemo(() => (data ? buildCrmMetrics(data) : null), [data]);

  function openAdminTab(tab: AdminTab, message?: string) {
    setActiveTab(tab);
    setError("");
    if (message) setNotice(message);
  }

  function handleTopbarSearch(query: string) {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return;

    const match = Object.values(tabRegistry).find((tab) => {
      const haystack = `${tab.label} ${tab.id}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });

    if (match) {
      openAdminTab(match.id, `Opened ${match.label}.`);
      return;
    }

    setNotice("");
    setError(`No admin module matched "${query}".`);
  }

  function scrollSidebarNav(direction: "up" | "down") {
    sidebarNavRef.current?.scrollBy({
      top: direction === "up" ? -240 : 240,
      behavior: "smooth",
    });
  }

  async function handleConnect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = tokenInput.trim();
    if (!password) {
      setError("Enter the admin password.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const session = await createAdminSession(password, roleLoginPage?.role);
      setToken(session.accessToken);
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

  async function runAction(action: () => Promise<string>) {
    setIsBusy(true);
    setError("");
    setNotice("");
    try {
      const message = await action();
      setNotice(message);
      await loadDashboard();
      await loadInventory();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "The action failed.");
    } finally {
      setIsBusy(false);
    }
  }

  function upsertProduct(product: Product) {
    setData((current) => {
      if (!current) return current;
      const products = current.products.filter((item) => item.id !== product.id);
      return { ...current, products: [product, ...products] };
    });
  }

  function removeProduct(productId: string) {
    setData((current) => {
      if (!current) return current;
      return {
        ...current,
        products: current.products.filter((product) => product.id !== productId),
      };
    });
  }

  function upsertInventoryItem(item: InventoryItem) {
    setInventoryItems((current) => {
      const items = current.filter((entry) => entry.id !== item.id);
      return [item, ...items];
    });
  }

  function removeInventoryItem(itemId: string) {
    setInventoryItems((current) => current.filter((item) => item.id !== itemId));
  }

  async function handleLeadCapture(payload: LeadSubmission) {
    await runAction(async () => {
      await captureLead(token, payload);
      return "Lead captured.";
    });
  }

  async function handleLeadDelete(id: string) {
    await runAction(async () => {
      await deleteLead(token, id);
      return "Lead deleted.";
    });
  }

  async function handleSubscriptionStatus(id: string, status: SubscriptionStatus) {
    await runAction(async () => {
      await updateSubscriptionStatus(token, id, status);
      return `Subscription moved to ${status}.`;
    });
  }

  async function handleCommerceOrderStatus(id: string, status: string) {
    await runAction(async () => {
      await updateCommerceOrderStatus(token, id, status);
      return `Order status updated to ${status}.`;
    });
  }

  async function handleSubscriptionDelete(id: string) {
    await runAction(async () => {
      await deleteSubscription(token, id);
      return "Subscription deleted.";
    });
  }

  async function handleDispatchRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(async () => {
      const result = await runDispatch(token, dispatchDate || undefined);
      setDispatchDate("");
      return result.message;
    });
  }

  async function handleDeliverOrder(orderId: string) {
    await runAction(async () => {
      await markOrderDelivered(token, orderId);
      return "Order marked delivered.";
    });
  }

  async function handleNotificationRetry(notificationId: string) {
    await runAction(async () => {
      await retryNotification(token, notificationId);
      return "Notification retry queued.";
    });
  }

  async function handleFarmerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    await runAction(async () => {
      await createFarmer(token, {
        name: String(formData.get("name") || ""),
        phone: String(formData.get("phone") || ""),
      });
      form.reset();
      return "Farmer added.";
    });
  }

  async function handleProcurementSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    await runAction(async () => {
      await createProcurementLog(token, {
        farmerId: String(formData.get("farmerId") || ""),
        collectionDate: String(formData.get("collectionDate") || "") || undefined,
        quantityLiters: Number(formData.get("quantityLiters")),
        fatPercentage: Number(formData.get("fatPercentage")),
        snfPercentage: Number(formData.get("snfPercentage")),
      });
      form.reset();
      return "Procurement entry saved.";
    });
  }

  async function handleProductCreate(payload: ProductPayload) {
    await runAction(async () => {
      const product = await createProduct(token, payload);
      upsertProduct(product);
      return "Product added.";
    });
  }

  async function handleProductUpdate(id: string, payload: ProductPayload) {
    await runAction(async () => {
      const product = await updateProduct(token, id, payload);
      upsertProduct(product);
      return "Product updated.";
    });
  }

  async function handleProductDelete(id: string) {
    await runAction(async () => {
      await deleteProduct(token, id);
      removeProduct(id);
      return "Product archived.";
    });
  }

  async function handleCategoryCreate(payload: ProductCategoryPayload) {
    await runAction(async () => {
      await createCategory(token, payload);
      return "Category created.";
    });
  }

  async function handleCategoryUpdate(id: string, payload: ProductCategoryPayload) {
    await runAction(async () => {
      await updateCategory(token, id, payload);
      return "Category updated.";
    });
  }

  async function handleCategoryDelete(id: string) {
    await runAction(async () => {
      await deleteCategory(token, id);
      return "Category archived.";
    });
  }

  async function handleInventoryCreate(payload: InventoryItemPayload) {
    await runAction(async () => {
      const result = await createInventoryItem(token, payload);
      if (result?.item) upsertInventoryItem(result.item);
      return "Stock item added.";
    });
  }

  async function handleInventoryAdjust(id: string, payload: StockAdjustmentPayload) {
    await runAction(async () => {
      const result = await adjustInventoryItem(token, id, payload);
      if (result?.item) upsertInventoryItem(result.item);
      return "Stock updated.";
    });
  }

  async function handleInventoryDelete(id: string) {
    await runAction(async () => {
      await deleteInventoryItem(token, id);
      removeInventoryItem(id);
      return "Stock item deleted.";
    });
  }

  async function handleSettingSave(key: string, payload: AppSettingPayload) {
    await runAction(async () => {
      await saveSetting(token, key, payload);
      return `${payload.label || key} saved.`;
    });
  }

  if (!token) {
    return (
      <main className="admin-shell min-h-screen text-charcoal">
        <TokenGate
          tokenInput={tokenInput}
          setTokenInput={setTokenInput}
          onSubmit={handleConnect}
          error={error}
          isLoading={isLoading}
          backendStatus={backendStatus}
          loginPage={roleLoginPage}
        />
      </main>
    );
  }

  const tabCounts: Record<AdminTab, number> = {
    overview: 0,
    orders: data?.orders.length ?? 0,
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
    customerSupportPanel:
      data?.users.filter((user) => user.role === "customer_support").length ?? 0,
    inventoryManagerPanel:
      data?.users.filter((user) => user.role === "inventory_manager").length ?? 0,
    deliveryManagerPanel:
      data?.users.filter((user) => user.role === "delivery_manager").length ?? 0,
    settings: data?.settings.length ?? 0,
    security: (data?.auditLogs.length ?? 0) + (data?.loginHistory.length ?? 0),
  };

  return (
    <main className="admin-shell min-h-screen text-charcoal">
      <div
        className={`admin-layout grid min-h-screen w-full grid-cols-1 transition-all duration-300 ${
          isSidebarCollapsed
            ? "md:grid-cols-[80px_minmax(0,1fr)] xl:grid-cols-[80px_minmax(0,1fr)]"
            : "md:grid-cols-[304px_minmax(0,1fr)] xl:grid-cols-[328px_minmax(0,1fr)]"
        }`}
      >
        <aside
          className={`admin-sidebar md:sticky md:top-0 md:h-screen transition-all duration-300 ${
            isSidebarCollapsed ? "admin-sidebar-collapsed" : ""
          }`}
        >
          <div
            className={`admin-sidebar-brand flex items-center justify-between gap-10 border-b border-white/10 px-16 py-15 transition-all duration-300 ${
              isSidebarCollapsed ? "flex-col justify-center px-10 py-15 gap-12" : ""
            }`}
          >
            <div
              className={`flex items-center gap-10 min-w-0 ${
                isSidebarCollapsed ? "justify-center" : ""
              }`}
            >
              <span className="inline-flex h-38 w-38 shrink-0 items-center justify-center rounded-[10px] bg-vivid-lime text-forest-ink shadow-sm">
                <Leaf className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </span>
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <p className="truncate font-reckless text-[20px] font-medium tracking-normal text-white">
                    HasuMane Admin
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
                    Operations
                  </p>
                </div>
              )}
            </div>
            <div className="admin-sidebar-scroll-controls" aria-label="Sidebar collapse controls">
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="admin-sidebar-scroll-button"
                aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="h-[13px] w-[13px]" strokeWidth={2} />
                ) : (
                  <ChevronLeft className="h-[13px] w-[13px]" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          <nav
            ref={sidebarNavRef}
            className={`admin-sidebar-nav grid gap-9 p-10 transition-all duration-300 ${
              isSidebarCollapsed ? "px-6 py-10" : ""
            }`}
          >
            {navSections.map((section) => (
              <div key={section.title} className="admin-nav-section-group">
                {!isSidebarCollapsed && <p className="admin-nav-section">{section.title}</p>}
                <div className="grid gap-5">
                  {section.items.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => openAdminTab(tab.id)}
                      className={`admin-nav-button transition-all duration-300 ${
                        activeTab === tab.id ? "admin-nav-button-active" : ""
                      }`}
                      title={isSidebarCollapsed ? tab.label : undefined}
                    >
                      <span className="inline-flex items-center gap-10">
                        <tab.icon
                          className={`h-[15px] w-[15px] transition-transform duration-300 ${
                            isSidebarCollapsed ? "mx-auto" : ""
                          }`}
                          strokeWidth={1.8}
                        />
                        {!isSidebarCollapsed && tab.label}
                      </span>
                      {!isSidebarCollapsed && tab.id !== "overview" && (
                        <span
                          className={`admin-nav-count ${
                            tab.status === "planned" ? "admin-nav-count-planned" : ""
                          }`}
                        >
                          {tab.status === "planned" && tabCounts[tab.id] === 0
                            ? "Plan"
                            : tabCounts[tab.id]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div
            className={`mt-auto border-t border-white/10 p-10 transition-all duration-300 ${
              isSidebarCollapsed ? "px-6 py-10" : ""
            }`}
          >
            <button
              type="button"
              onClick={handleLogout}
              className="admin-nav-button w-full transition-all duration-300 text-[#ffa3a3] hover:text-white"
              title={isSidebarCollapsed ? "Lock" : undefined}
            >
              <span className="inline-flex items-center gap-10">
                <LogOut
                  className={`h-[15px] w-[15px] transition-transform duration-300 ${
                    isSidebarCollapsed ? "mx-auto" : ""
                  }`}
                  strokeWidth={1.8}
                />
                {!isSidebarCollapsed && <span>Lock</span>}
              </span>
            </button>
          </div>
        </aside>

        <section className="admin-main-content min-w-0">
          <AdminTopbar
            backendStatus={backendStatus}
            onSearchNavigate={handleTopbarSearch}
            onHelp={() => openAdminTab("architecture", "Opened admin insights.")}
            onNotifications={() => openAdminTab("notifications", "Opened notifications.")}
            onSettings={() => openAdminTab("settings", "Opened settings.")}
            onUsers={() => openAdminTab("usersRoles", "Opened users and roles.")}
          />

          {activeTab === "overview" && (
            <header className="admin-page-heading">
              <div>
                <div className="flex flex-wrap items-center gap-8">
                  <span
                    className={`admin-live-pill ${
                      backendStatus === "offline" ? "admin-live-pill-offline" : ""
                    }`}
                  >
                    <Activity className="h-[12px] w-[12px]" strokeWidth={1.8} />
                    {backendStatus === "offline" ? "Backend offline" : "Live backend"}
                  </span>
                  <span className="admin-date-pill">
                    <CalendarDays className="h-[12px] w-[12px]" strokeWidth={1.8} />
                    {new Intl.DateTimeFormat("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(new Date())}
                  </span>
                </div>
                <h1 className="mt-9 font-reckless text-[36px] font-medium leading-[1.04] tracking-normal text-charcoal md:text-[48px]">
                  {getGreetingText()}, HasuMane
                </h1>
                <p className="mt-5 max-w-[78ch] text-[15px] leading-relaxed text-graphite">
                  Welcome back! Manage our farmer entrepreneurship network, track chemical-free dairy subscriptions, coordinate procurement, and monitor Bengaluru dispatch workflows in a single interface.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-10">
                <button
                  type="button"
                  onClick={() => void loadDashboard()}
                  disabled={isLoading || isBusy}
                  className="admin-secondary-button"
                >
                  <RefreshCcw className="h-[12px] w-[12px]" strokeWidth={1.9} />
                  Refresh
                </button>
              </div>
            </header>
          )}

          {error ? <Alert tone="error">{error}</Alert> : null}
          {notice ? <Alert tone="success">{notice}</Alert> : null}

          {isLoading && !data ? (
            <div className="rounded-[8px] border border-forest-ink/10 bg-pure-white p-24 text-body-sm text-graphite">
              Loading admin data...
            </div>
          ) : data ? (
            <>
              {activeTab === "overview" ? (
                <>
                  <SummaryGrid data={data} />
                  {crmMetrics ? <OverviewCharts data={data} metrics={crmMetrics} /> : null}
                  <CommerceInsights data={data} />
                </>
              ) : null}
              {activeTab === "orders" ? (
                <OrdersPanel
                  orders={data.orders}
                  commerceOrders={data.commerceOrders}
                  pendingOrders={pendingOrders}
                  isBusy={isBusy}
                  onDeliver={handleDeliverOrder}
                  onCommerceStatusChange={handleCommerceOrderStatus}
                />
              ) : null}
              {activeTab === "leads" ? (
                <LeadsPanel
                  leads={data.leads}
                  products={data.products}
                  pendingSubscriptions={pendingSubscriptions}
                  isBusy={isBusy}
                  onCapture={handleLeadCapture}
                  onActivate={(id) => handleSubscriptionStatus(id, "active")}
                  onReject={(id) => handleSubscriptionStatus(id, "terminated")}
                  onDelete={handleLeadDelete}
                />
              ) : null}
              {activeTab === "subscriptions" ? (
                <SubscriptionsPanel
                  subscriptions={data.subscriptions}
                  activeCount={activeSubscriptions.length}
                  isBusy={isBusy}
                  onStatusChange={handleSubscriptionStatus}
                  onDelete={handleSubscriptionDelete}
                />
              ) : null}
              {activeTab === "products" ? (
                <ProductsPanel
                  products={data.products}
                  categories={data.categories}
                  isBusy={isBusy}
                  onCreate={handleProductCreate}
                  onUpdate={handleProductUpdate}
                  onDelete={handleProductDelete}
                />
              ) : null}
              {activeTab === "categories" ? (
                <CategoriesPanel
                  categories={data.categories}
                  products={data.products}
                  isBusy={isBusy}
                  onCreate={handleCategoryCreate}
                  onUpdate={handleCategoryUpdate}
                  onDelete={handleCategoryDelete}
                />
              ) : null}
              {activeTab === "inventory" ? (
                <InventoryDashboardPanel
                  products={data.products}
                  inventoryItems={inventoryItems}
                  onCreate={handleInventoryCreate}
                  onAdjust={handleInventoryAdjust}
                  onDelete={handleInventoryDelete}
                />
              ) : null}
              {activeTab === "customers" ? (
                <CustomersPanel customers={customerUsers} subscriptions={data.subscriptions} />
              ) : null}
              {activeTab === "deliveryPartners" ? (
                <DeliveryPartnersPanel partners={deliveryPartners} />
              ) : null}
              {activeTab === "coupons" ? (
                <FeatureModulePanel module={featureModules.coupons} />
              ) : null}
              {activeTab === "payments" ? (
                <FeatureModulePanel module={featureModules.payments} />
              ) : null}
              {activeTab === "analytics" ? (
                <AnalyticsDashboardPanel data={data} metrics={crmMetrics} />
              ) : null}
              {activeTab === "support" ? (
                <FeatureModulePanel module={featureModules.support} />
              ) : null}
              {activeTab === "content" ? (
                <FeatureModulePanel module={featureModules.content} />
              ) : null}
              {activeTab === "dispatch" ? (
                <DispatchPanel
                  orders={data.orders}
                  pendingOrders={pendingOrders}
                  dispatchDate={dispatchDate}
                  setDispatchDate={setDispatchDate}
                  isBusy={isBusy}
                  onRun={handleDispatchRun}
                  onDeliver={handleDeliverOrder}
                />
              ) : null}
              {activeTab === "procurement" ? (
                <ProcurementPanel
                  farmers={data.farmers}
                  logs={data.procurementLogs}
                  isBusy={isBusy}
                  onFarmerSubmit={handleFarmerSubmit}
                  onProcurementSubmit={handleProcurementSubmit}
                />
              ) : null}
              {activeTab === "notifications" ? (
                <NotificationsPanel
                  notifications={data.notifications}
                  isBusy={isBusy}
                  onRetry={handleNotificationRetry}
                />
              ) : null}
              {activeTab === "architecture" ? <ProductionArchitecturePanel /> : null}
              {activeTab === "usersRoles" ? (
                <UsersRolesPanel users={data.users} rolePermissions={data.rolePermissions} />
              ) : null}
              {rolePanelEntries.map((entry) => {
                if (activeTab !== entry.tabId) return null;
                const blueprint = adminRoleBlueprints.find((item) => item.role === entry.role);
                if (!blueprint) return null;
                return (
                  <RoleOperationsPanel
                    key={entry.tabId}
                    blueprint={blueprint}
                    data={data}
                    users={data.users}
                    rolePermissions={data.rolePermissions}
                  />
                );
              })}
              {activeTab === "settings" ? (
                <SettingsPanel
                  settings={data.settings}
                  isBusy={isBusy}
                  onSave={handleSettingSave}
                />
              ) : null}
              {activeTab === "security" ? (
                <SecurityLogsPanel
                  auditLogs={data.auditLogs}
                  loginHistory={data.loginHistory}
                  settings={data.settings}
                />
              ) : null}
            </>
          ) : (
            <div className="rounded-[8px] border border-forest-ink/10 bg-pure-white p-24">
              <p className="text-body-sm text-graphite">
                Admin data is unavailable. Check the backend service and token.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function AdminTopbar({
  backendStatus,
  onSearchNavigate,
  onHelp,
  onNotifications,
  onSettings,
  onUsers,
}: {
  backendStatus: BackendStatus;
  onSearchNavigate: (query: string) => void;
  onHelp: () => void;
  onNotifications: () => void;
  onSettings: () => void;
  onUsers: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearchNavigate(searchQuery);
    setSearchQuery("");
  }

  return (
    <div className="admin-topbar" aria-label="Admin utilities">
      <form className="admin-topbar-search" onSubmit={handleSearch}>
        <Search className="h-[14px] w-[14px]" strokeWidth={1.9} />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search modules"
          aria-label="Search admin modules"
        />
      </form>
      <div className="admin-topbar-actions">
        <span
          className={`admin-backend-dot ${
            backendStatus === "online"
              ? "admin-backend-dot-online"
              : backendStatus === "offline"
                ? "admin-backend-dot-offline"
                : ""
          }`}
          aria-label={`Backend status: ${backendStatus}`}
        />
        <button type="button" onClick={onHelp} className="admin-icon-button" aria-label="Help">
          <CircleHelp className="h-[15px] w-[15px]" strokeWidth={1.9} />
        </button>
        <button
          type="button"
          onClick={onNotifications}
          className="admin-icon-button"
          aria-label="Notifications"
        >
          <Bell className="h-[15px] w-[15px]" strokeWidth={1.9} />
        </button>
        <button
          type="button"
          onClick={onSettings}
          className="admin-icon-button"
          aria-label="Settings"
        >
          <Settings className="h-[15px] w-[15px]" strokeWidth={1.9} />
        </button>
        <button
          type="button"
          onClick={onUsers}
          className="admin-avatar"
          aria-label="Users and roles"
        >
          HM
        </button>
      </div>
    </div>
  );
}

function AuroraOverviewHero({
  data,
  metrics,
}: {
  data: AdminDashboardData;
  metrics: CrmMetrics | null;
}) {
  const summary = data.summary;
  const pendingOrder = data.orders.find((order) => order.status === "pending");
  const latestLead = data.leads[0];
  const boost = metrics?.salesGrowthPercent ?? 0;
  const boostCopy = `${boost >= 0 ? "+" : ""}${boost}%`;
  const activeSubscriptions = summary.subscriptions.byStatus.active ?? 0;
  const pendingOrders = summary.orders.byStatus.pending ?? 0;

  return (
    <div className="admin-aurora-hero">
      <section className="admin-aurora-greeting">
        <p className="admin-aurora-date">
          {new Intl.DateTimeFormat("en-IN", {
            weekday: "long",
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).format(new Date())}
        </p>
        <h2>Good morning, Captain!</h2>
        <div className="admin-aurora-metrics">
          <AuroraMetricItem
            icon={ClipboardList}
            label="Leads captured"
            value={summary.leads?.total ?? data.leads.length}
          />
          <AuroraMetricItem icon={Milk} label="Active plans" value={activeSubscriptions} />
          <AuroraMetricItem icon={Truck} label="Orders pending" value={pendingOrders} />
        </div>
      </section>

      <section className="admin-aurora-schedule">
        <div className="admin-aurora-section-title">
          <CalendarDays className="h-[14px] w-[14px]" strokeWidth={1.9} />
          Today's schedule
        </div>
        <ScheduleItem
          time="09:30 AM"
          title={latestLead ? `Follow up with ${latestLead.name}` : "Lead queue review"}
          meta={latestLead ? latestLead.productType : "No new leads yet"}
        />
        <ScheduleItem
          time="12:00 PM"
          title="Dispatch readiness check"
          meta={pendingOrder ? formatDate(pendingOrder.deliveryDate) : "All caught up"}
        />
        <ScheduleItem
          time="04:30 PM"
          title="Procurement close"
          meta={`${formatNumber(summary.procurement.totalVolumeLiters)} L logged`}
        />
      </section>

      <section className="admin-aurora-boost">
        <div className="admin-aurora-boost-copy">
          <p>Boost your delivery base</p>
          <h2>by {boostCopy}</h2>
          <span>Sales units vs prior window</span>
        </div>
      </section>
    </div>
  );
}

function AuroraMetricItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
}) {
  return (
    <div className="admin-aurora-metric">
      <span>
        <Icon className="h-[14px] w-[14px]" strokeWidth={1.9} />
      </span>
      <div>
        <strong>{value}</strong>
        <p>{label}</p>
      </div>
    </div>
  );
}

function ScheduleItem({ time, title, meta }: { time: string; title: string; meta: string }) {
  return (
    <div className="admin-schedule-item">
      <span>{time}</span>
      <div>
        <p>{title}</p>
        <small>{meta}</small>
      </div>
    </div>
  );
}

function TokenGate({
  tokenInput,
  setTokenInput,
  onSubmit,
  error,
  isLoading,
  backendStatus,
  loginPage,
}: {
  tokenInput: string;
  setTokenInput: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  error?: string;
  isLoading: boolean;
  backendStatus: BackendStatus;
  loginPage?: AdminRoleLoginPage;
}) {
  const [showPassword, setShowPassword] = useState(false);

  const statusCopy = {
    checking: "Checking backend",
    online: "Backend online",
    offline: "Backend offline",
  } satisfies Record<BackendStatus, string>;
  const features = loginPage?.features ?? [
    { label: "Lead capture", value: "Website to CRM" },
    { label: "Product ops", value: "Live catalog" },
    { label: "Fulfillment", value: "Dispatch ready" },
  ];

  return (
    <div className="admin-auth-screen">
      <div className="auth-bg-glow-container">
        <div className="glow-blob glow-blob-1"></div>
        <div className="glow-blob glow-blob-2"></div>
        <div className="glow-blob glow-blob-3"></div>
      </div>
      <div className="admin-auth-frame">
        <section className="admin-auth-hero" aria-label="HasuMane CRM overview">
          <div className="admin-auth-brand">
            <div className="admin-auth-logo-container">
              <div className="admin-auth-logo-ring"></div>
              <div className="admin-auth-logo-bg">
                <Leaf className="h-[22px] w-[22px]" strokeWidth={1.8} />
              </div>
            </div>
            <div>
              <p>{loginPage ? `${loginPage.title} Login` : "HasuMane CRM"}</p>
              <span>{loginPage?.eyebrow || "Sales and operations command center"}</span>
            </div>
          </div>

          <div className="admin-auth-copy">
            <p className="admin-auth-kicker">
              {loginPage ? "Role-Based Secure Workspace" : "Secure Admin Workspace"}
            </p>
            <h1>
              {loginPage?.headline ||
                "Control leads, products, dispatch, and procurement from one premium cockpit."}
            </h1>
            <p>
              {loginPage?.description ||
                "Authenticate once, then manage the full dairy sales pipeline with live backend data, dynamic product controls, and operational readiness signals."}
            </p>
          </div>

          <div className="admin-auth-feature-grid">
            {features.map((item) => (
              <div key={item.label} className="admin-auth-feature">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          <div className="admin-auth-checks">
            {[
              "Protected HttpOnly admin session",
              "CSRF-checked product and CRM actions",
              "Backend rate limiting and audit-safe logging",
            ].map((item) => (
              <div key={item} className="admin-auth-check">
                <Check className="h-[14px] w-[14px] shrink-0" strokeWidth={2} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="admin-auth-card-wrap">
          <form onSubmit={onSubmit} className="admin-auth-card">
            <div className="admin-auth-card-header">
              <div className="admin-auth-header-row">
                <span className="admin-auth-card-icon">
                  <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </span>
                <div className={`admin-auth-status-indicator status-${backendStatus}`}>
                  <span className="status-dot"></span>
                  <span className="status-text">
                    {backendStatus === "online"
                      ? "System Live"
                      : backendStatus === "checking"
                        ? "Checking..."
                        : "Offline"}
                  </span>
                </div>
              </div>
              <div className="admin-auth-title-group">
                <p>{loginPage ? `${loginPage.title} Login` : "Administrator Login"}</p>
                <h2>{loginPage ? `Unlock ${loginPage.title}` : "Unlock HasuMane CRM"}</h2>
              </div>
            </div>

            {error ? <Alert tone="error">{error}</Alert> : null}

            <div className="admin-auth-form-field">
              <label className="admin-auth-label" htmlFor="admin-password">
                Admin password
              </label>
              <div className="admin-auth-input-wrap">
                <ShieldCheck
                  className="h-[16px] w-[16px] text-forest-ink/62 shrink-0"
                  strokeWidth={1.9}
                />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={tokenInput}
                  onChange={(event) => setTokenInput(event.target.value)}
                  placeholder="Enter secure admin password"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="admin-auth-toggle-pwd"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={0}
                >
                  {showPassword ? (
                    <EyeOff className="h-[16px] w-[16px]" strokeWidth={1.9} />
                  ) : (
                    <Eye className="h-[16px] w-[16px]" strokeWidth={1.9} />
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="admin-auth-submit">
              {isLoading ? (
                <span className="admin-auth-spinner"></span>
              ) : (
                <ShieldCheck className="h-[15px] w-[15px]" strokeWidth={2} />
              )}
              {isLoading
                ? "Authenticating..."
                : loginPage
                  ? `Open ${loginPage.title}`
                  : "Open Dashboard"}
            </button>

            <div className="admin-auth-footnote">
              <span>
                {loginPage ? `${loginPage.title} role entry` : "Session-protected CRM access"}
              </span>
              <span>Use the private admin password</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function SummaryGrid({ data }: { data: AdminDashboardData }) {
  const summary = data.summary;
  const todayKey = toDateKey(new Date().toISOString());
  const todayOrders = data.orders.filter((order) => toDateKey(order.deliveryDate) === todayKey);
  const priceByProduct = new Map(
    data.products.map((product) => [product.productType.toLowerCase(), Number(product.price || 0)]),
  );
  const todaysRevenue = todayOrders.reduce((total, order) => {
    const productType = order.subscription?.productType?.toLowerCase() || "";
    return total + Number(order.quantity || 0) * (priceByProduct.get(productType) || 0);
  }, 0);
  const lowStockAlerts = getInventoryRows(data.products, data.subscriptions).filter(
    (item) => item.status !== "healthy",
  ).length;
  const newLeads = data.leads.filter((lead) => toDateKey(lead.submittedAt) === todayKey).length;
  const pendingNotifications = data.notifications.filter((notification) =>
    isPendingNotification(notification.status),
  ).length;

  return (
    <div className="mb-24 grid gap-14 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 2xl:gap-16">
      <StatCard
        icon={ShoppingCart}
        label="Total orders"
        value={summary.orders.total}
        detail={`${data.orders.length} visible records`}
        tone="orders"
      />
      <StatCard
        icon={Users}
        label="Active subscribers"
        value={summary.subscriptions.byStatus.active ?? 0}
        detail={`${summary.subscriptions.total} subscription records`}
        tone="users"
      />
      <StatCard
        icon={IndianRupee}
        label="Today's revenue"
        value={formatCurrency(todaysRevenue)}
        detail={`${todayOrders.length} scheduled orders`}
        tone="revenue"
      />
      <StatCard
        icon={PackageCheck}
        label="Low stock alerts"
        value={lowStockAlerts}
        detail="Low or out of stock"
        tone="pending"
      />
      <StatCard
        icon={UserPlus}
        label="New leads"
        value={newLeads}
        detail={`${data.leads.length} total leads`}
        tone="sales"
      />
      <StatCard
        icon={Bell}
        label="Pending notifications"
        value={pendingNotifications}
        detail="Queued or retryable"
        tone="delivered"
      />
    </div>
  );
}

function OverviewCharts({ data, metrics }: { data: AdminDashboardData; metrics: CrmMetrics }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const orderTrend = metrics.salesGrowth.map((point) => {
    const dailyCount = data.orders.filter((order) => toDateKey(order.deliveryDate) === point.key).length;
    const commerceCount = data.commerceOrders.filter((order) => toDateKey(order.createdAt) === point.key).length;
    return {
      ...point,
      orders: dailyCount + commerceCount,
    };
  });

  if (!mounted) {
    return (
      <div className="mb-24 grid gap-18 xl:grid-cols-2">
        <ChartCard title="Orders Chart" kicker="Last 8 days" icon={ShoppingCart}>
          <div className="h-[240px] lg:h-[300px] flex items-center justify-center bg-ash-gray/10 animate-pulse rounded-cards">
            <span className="text-body-sm text-pewter">Loading chart...</span>
          </div>
        </ChartCard>
        <ChartCard title="Lead Chart" kicker="Last 8 days" icon={ClipboardList}>
          <div className="h-[240px] lg:h-[300px] flex items-center justify-center bg-ash-gray/10 animate-pulse rounded-cards">
            <span className="text-body-sm text-pewter">Loading chart...</span>
          </div>
        </ChartCard>
      </div>
    );
  }

  return (
    <div className="mb-24 grid gap-18 xl:grid-cols-2">
      <ChartCard title="Orders Chart" kicker="Last 8 days" icon={ShoppingCart}>
        <div className="h-[240px] lg:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={orderTrend}>
              <defs>
                <linearGradient id="ordersChartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.24} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#2563EB"
                strokeWidth={2}
                fill="url(#ordersChartGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Lead Chart" kicker="Last 8 days" icon={ClipboardList}>
        <div className="h-[240px] lg:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.salesGrowth}>
              <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="leads"
                name="Leads"
                stroke="#16A34A"
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 2 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}

function CommerceInsights({ data }: { data: AdminDashboardData }) {
  const topProducts = getTopProducts(data.subscriptions);
  const activities = getRecentActivities(data);

  return (
    <div className="mb-24 grid gap-18 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <ChartCard
        title="Top selling products"
        kicker="By active subscription units"
        icon={PackageCheck}
      >
        <div className="grid gap-10">
          {topProducts.map((product, index) => (
            <div key={product.name} className="admin-product-rank-row">
              <span>{index + 1}</span>
              <div>
                <p>{product.name}</p>
                <small>{product.units} units in active or pending plans</small>
              </div>
              <strong>{product.share}%</strong>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Recent activities" kicker="Live commerce feed" icon={Activity}>
        <div className="grid gap-10">
          {activities.map((activity) => (
            <div
              key={`${activity.type}-${activity.time}-${activity.title}`}
              className="admin-activity-row"
            >
              <span className={`admin-activity-dot admin-activity-dot-${activity.tone}`} />
              <div>
                <p>{activity.title}</p>
                <small>{activity.meta}</small>
              </div>
              <time>{activity.time}</time>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}

function OrdersPanel({
  orders,
  commerceOrders,
  pendingOrders,
  isBusy,
  onDeliver,
  onCommerceStatusChange,
}: {
  orders: DailyOrder[];
  commerceOrders: CommerceOrder[];
  pendingOrders: DailyOrder[];
  isBusy: boolean;
  onDeliver: (id: string) => void;
  onCommerceStatusChange: (id: string, status: string) => void;
}) {
  const [activeFilter, setActiveFilter] = useState<string>("View orders");

  const filteredCommerceOrders = useMemo(() => {
    switch (activeFilter) {
      case "Accept / reject orders":
        return commerceOrders.filter((o) => String(o.status).toLowerCase() === "pending");
      case "Assign delivery partner":
        return commerceOrders.filter((o) => String(o.status).toLowerCase() === "processing");
      case "Update status":
        return commerceOrders.filter((o) => ["processing", "dispatched", "delivered"].includes(String(o.status).toLowerCase()));
      case "Refund management":
        return commerceOrders.filter((o) => ["cancelled", "refunded", "rejected"].includes(String(o.status).toLowerCase()));
      default:
        return commerceOrders;
    }
  }, [commerceOrders, activeFilter]);

  const displayedOrders = orders.slice(0, 40);
  const displayedCommerceOrders = filteredCommerceOrders.slice(0, 40);
  const pendingCommerceOrders = commerceOrders.filter((order) =>
    ["pending", "processing", "accepted"].includes(String(order.status)),
  );

  return (
    <Panel
      title="Order Management"
      kicker={`${commerceOrders.length} customer / ${orders.length} dispatch`}
      actionIcon={ShoppingCart}
      actionText={`${pendingCommerceOrders.length + pendingOrders.length} pending`}
    >
      <div className="admin-product-readiness-grid mb-16">
        <IntelCard
          label="Customer orders"
          value={commerceOrders.length}
          detail="Checkout and app orders from the commerce order table"
        />
        <RiskCard
          label="Customer pending"
          value={pendingCommerceOrders.length}
          detail="Orders waiting for acceptance, packing, or assignment"
          tone={pendingCommerceOrders.length ? "warning" : "safe"}
        />
        <IntelCard
          label="Dispatch orders"
          value={orders.length}
          detail="Subscription delivery orders generated by dispatch"
        />
        <RiskCard
          label="Dispatch pending"
          value={pendingOrders.length}
          detail="Daily delivery orders still open"
          tone={pendingOrders.length ? "warning" : "safe"}
        />
      </div>

      <ModuleControlStrip
        controls={[
          "View orders",
          "Accept / reject orders",
          "Assign delivery partner",
          "Update status",
          "Generate invoice",
          "Refund management",
        ]}
        activeControl={activeFilter}
        onControlSelect={setActiveFilter}
      />
      {filteredCommerceOrders.length ? (
        <section className="mb-18">
          <div className="admin-section-heading">
            <h3>Customer orders</h3>
            <span>{displayedCommerceOrders.length} shown</span>
          </div>
          <div className="admin-table-wrap hidden md:block">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedCommerceOrders.map((order) => {
                  const itemCount =
                    order.items?.reduce((total, item) => total + Number(item.quantity || 0), 0) ??
                    0;
                  const isPending = String(order.status).toLowerCase() === "pending";
                  return (
                    <tr key={order.id}>
                      <td>
                        <span className="font-mono text-[12px] font-semibold text-charcoal">
                          {order.orderNumber || order.id.slice(0, 8)}
                        </span>
                      </td>
                      <td>
                        <span className="font-semibold text-charcoal">
                          {order.user?.name || "Customer"}
                        </span>
                        <p className="mt-2 text-[12px] text-pewter">
                          {order.user?.phone || order.user?.email || "Contact pending"}
                        </p>
                      </td>
                      <td>{itemCount || order.items?.length || 0}</td>
                      <td>{formatCurrency(order.total)}</td>
                      <td>{formatDateTime(order.createdAt)}</td>
                      <td>
                        <StatusPill tone={statusTone(String(order.status))}>
                          {order.status}
                        </StatusPill>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-8">
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => void onCommerceStatusChange(order.id, "processing")}
                                className="admin-primary-button h-32 px-10 text-[12px]"
                              >
                                <Check className="h-[12px] w-[12px]" strokeWidth={1.9} />
                                Accept
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => void onCommerceStatusChange(order.id, "cancelled")}
                                className="admin-danger-button h-32 px-10 text-[12px]"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-[12px] font-semibold text-pewter">Processed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-10 md:hidden">
            {displayedCommerceOrders.map((order) => {
              const isPending = String(order.status).toLowerCase() === "pending";
              return (
                <div
                  key={order.id}
                  className="admin-data-row border-l-[4px] border-l-vivid-lime p-14"
                >
                  <div className="flex flex-wrap items-start justify-between gap-8">
                    <div>
                      <p className="font-mono text-[12px] font-semibold text-charcoal">
                        {order.orderNumber || order.id.slice(0, 8)}
                      </p>
                      <p className="mt-3 text-[14px] font-semibold text-charcoal">
                        {order.user?.name || "Customer"}
                      </p>
                    </div>
                    <StatusPill tone={statusTone(String(order.status))}>{order.status}</StatusPill>
                  </div>
                  <div className="mt-12 grid grid-cols-2 gap-8">
                    <Field label="Total" value={formatCurrency(order.total)} />
                    <Field label="Created" value={formatDateTime(order.createdAt)} />
                    <Field
                      label="Contact"
                      value={order.user?.phone || order.user?.email || "Pending"}
                    />
                    <Field label="Items" value={String(order.items?.length || 0)} />
                  </div>
                  {isPending && (
                    <div className="mt-12 flex gap-8">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void onCommerceStatusChange(order.id, "processing")}
                        className="admin-primary-button h-32 px-10 text-[12px] flex-1"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void onCommerceStatusChange(order.id, "cancelled")}
                        className="admin-danger-button h-32 px-10 text-[12px] flex-1"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <EmptyState title="No customer orders found" />
      )}

      {orders.length ? (
        <section>
          <div className="admin-section-heading">
            <h3>Dispatch orders</h3>
            <span>{displayedOrders.length} shown</span>
          </div>
          <div className="admin-table-wrap hidden md:block">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Address</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className="font-mono text-[12px] font-semibold text-charcoal">
                        {order.id.slice(0, 8)}
                      </span>
                    </td>
                    <td>
                      <span className="font-semibold text-charcoal">
                        {order.subscription?.user?.name || "Customer"}
                      </span>
                    </td>
                    <td>
                      {order.subscription?.user?.addresses?.[0]?.streetAddress || "Address pending"}
                    </td>
                    <td>{formatDate(order.deliveryDate)}</td>
                    <td>
                      <StatusPill tone={statusTone(order.status)}>{order.status}</StatusPill>
                    </td>
                    <td>
                      <div className="flex justify-end">
                        {order.status === "pending" ? (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => onDeliver(order.id)}
                            className="admin-primary-button h-32 px-10 text-[12px]"
                          >
                            <PackageCheck className="h-[12px] w-[12px]" strokeWidth={1.9} />
                            Mark Delivered
                          </button>
                        ) : (
                          <span className="text-[12px] font-semibold text-forest-ink">Closed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-10 md:hidden">
            {displayedOrders.map((order) => (
              <div key={order.id} className="admin-data-row border-l-[4px] border-l-sky-card p-14">
                <div className="flex flex-wrap items-start justify-between gap-8">
                  <div>
                    <p className="text-[14px] font-semibold text-charcoal">
                      {order.subscription?.user?.name || "Customer"}
                    </p>
                    <p className="mt-3 text-[12px] text-graphite">
                      {order.subscription?.user?.addresses?.[0]?.streetAddress || "Address pending"}
                    </p>
                  </div>
                  <StatusPill tone={statusTone(order.status)}>{order.status}</StatusPill>
                </div>
                <div className="mt-12 grid grid-cols-2 gap-8">
                  <Field label="Delivery date" value={formatDate(order.deliveryDate)} />
                  <Field label="Quantity" value={String(order.quantity)} />
                </div>
                {order.status === "pending" ? (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => onDeliver(order.id)}
                    className="admin-primary-button mt-14 h-34 w-full px-11 text-[12px]"
                  >
                    <PackageCheck className="h-[12px] w-[12px]" strokeWidth={1.9} />
                    Mark Delivered
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="mt-12">
          <EmptyState title="No dispatch orders found" />
        </div>
      )}
    </Panel>
  );
}

const emptyCategoryForm: CategoryFormState = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  isActive: true,
  sortOrder: "0",
};

type CategoryFormState = Omit<ProductCategoryPayload, "sortOrder"> & {
  sortOrder: string;
};

function slugFromName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function CategoriesPanel({
  categories,
  products,
  isBusy,
  onCreate,
  onUpdate,
  onDelete,
}: {
  categories: ProductCategory[];
  products: Product[];
  isBusy: boolean;
  onCreate: (payload: ProductCategoryPayload) => Promise<void>;
  onUpdate: (id: string, payload: ProductCategoryPayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState<CategoryFormState>(emptyCategoryForm);
  const isEditing = Boolean(editingId);
  const categoryProductCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      const categoryId = product.categoryId || "";
      if (!categoryId) continue;
      counts.set(categoryId, (counts.get(categoryId) || 0) + 1);
    }
    return counts;
  }, [products]);
  const activeCategories = categories.filter((category) => category.isActive);
  const archivedCategories = categories.length - activeCategories.length;

  function updateField<K extends keyof CategoryFormState>(key: K, value: CategoryFormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "name" && !isEditing ? { slug: slugFromName(String(value)) } : {}),
    }));
  }

  function resetForm() {
    setEditingId("");
    setForm(emptyCategoryForm);
  }

  function startEdit(category: ProductCategory) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      imageUrl: category.imageUrl || "",
      isActive: category.isActive,
      sortOrder: String(category.sortOrder ?? 0),
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: ProductCategoryPayload = {
      name: form.name.trim(),
      slug: slugFromName(form.slug || form.name),
      description: form.description?.trim() || "",
      imageUrl: form.imageUrl?.trim() || "",
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder || 0),
    };

    if (isEditing) {
      await onUpdate(editingId, payload);
    } else {
      await onCreate(payload);
    }
    resetForm();
  }

  async function handleArchive(category: ProductCategory) {
    const confirmed = window.confirm(`Archive ${category.name}? Products will remain available.`);
    if (!confirmed) return;
    await onDelete(category.id);
    if (editingId === category.id) resetForm();
  }

  return (
    <Panel
      title="Categories"
      kicker={`${categories.length} catalog groups`}
      actionIcon={Tags}
      actionText="Product taxonomy"
    >
      <div className="admin-intel-grid mb-16">
        <IntelCard
          label="Active categories"
          value={activeCategories.length}
          detail="Shown in commerce flows"
        />
        <IntelCard
          label="Archived"
          value={archivedCategories}
          detail="Hidden from product assignment"
        />
        <IntelCard
          label="Unassigned products"
          value={products.filter((product) => !product.categoryId).length}
          detail="Need catalog cleanup"
        />
      </div>

      <form onSubmit={handleSubmit} className="admin-form-card mb-16">
        <div className="mb-14 flex flex-col gap-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.18em] text-forest-ink">
              {isEditing ? "Edit category" : "New category"}
            </p>
            <h3 className="mt-2 font-reckless text-[28px] font-medium leading-none text-charcoal">
              {isEditing ? "Refine catalog grouping" : "Create production category"}
            </h3>
          </div>
          {isEditing ? (
            <button type="button" onClick={resetForm} className="admin-secondary-button">
              <X className="h-[12px] w-[12px]" strokeWidth={1.9} />
              Cancel
            </button>
          ) : null}
        </div>

        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-6">
          <input
            required
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Category name"
            className="admin-input xl:col-span-2"
          />
          <input
            required
            value={form.slug}
            onChange={(event) => updateField("slug", event.target.value)}
            placeholder="category-slug"
            className="admin-input xl:col-span-2"
          />
          <input
            type="number"
            value={form.sortOrder}
            onChange={(event) => updateField("sortOrder", event.target.value)}
            placeholder="Sort order"
            className="admin-input"
          />
          <label className="admin-checkbox-field">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => updateField("isActive", event.target.checked)}
            />
            Active
          </label>
          <input
            value={form.imageUrl}
            onChange={(event) => updateField("imageUrl", event.target.value)}
            placeholder="Image URL"
            className="admin-input md:col-span-2 xl:col-span-3"
          />
          <textarea
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Category description"
            className="admin-textarea md:col-span-2 xl:col-span-3"
          />
          <button
            type="submit"
            disabled={isBusy}
            className="admin-primary-button h-38 xl:col-span-2"
          >
            {isEditing ? (
              <Pencil className="h-[12px] w-[12px]" strokeWidth={1.9} />
            ) : (
              <Plus className="h-[12px] w-[12px]" strokeWidth={1.9} />
            )}
            {isEditing ? "Save Category" : "Add Category"}
          </button>
        </div>
      </form>

      {categories.length ? (
        <div className="grid gap-12 md:grid-cols-2 2xl:grid-cols-3">
          {categories.map((category) => (
            <article key={category.id} className="admin-category-card">
              <div className="flex items-start justify-between gap-10">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-forest-ink">
                    {category.slug}
                  </p>
                  <h3>{category.name}</h3>
                </div>
                <StatusPill tone={category.isActive ? "success" : "neutral"}>
                  {category.isActive ? "Active" : "Archived"}
                </StatusPill>
              </div>
              <p className="mt-10 text-[13px] leading-relaxed text-graphite">
                {category.description || "No category description added yet."}
              </p>
              <div className="mt-14 grid grid-cols-2 gap-8">
                <Field
                  label="Products"
                  value={String(categoryProductCounts.get(category.id) || 0)}
                />
                <Field label="Sort order" value={String(category.sortOrder ?? 0)} />
              </div>
              <div className="mt-16 grid grid-cols-2 gap-8">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => startEdit(category)}
                  className="admin-secondary-button"
                >
                  <Pencil className="h-[12px] w-[12px]" strokeWidth={1.9} />
                  Edit
                </button>
                <button
                  type="button"
                  disabled={isBusy || !category.isActive}
                  onClick={() => void handleArchive(category)}
                  className="admin-danger-button"
                >
                  <Trash2 className="h-[12px] w-[12px]" strokeWidth={1.9} />
                  Archive
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No categories configured yet" />
      )}
    </Panel>
  );
}

function CustomersPanel({
  customers,
  subscriptions,
}: {
  customers: User[];
  subscriptions: Subscription[];
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "attention" | "new">("all");
  const subscriptionsByUser = new Map<string, Subscription[]>();
  for (const subscription of subscriptions) {
    const existing = subscriptionsByUser.get(subscription.userId) || [];
    existing.push(subscription);
    subscriptionsByUser.set(subscription.userId, existing);
  }
  const customerProfiles = customers
    .map((customer) => {
      const customerSubscriptions = subscriptionsByUser.get(customer.id) || [];
      const activePlans = customerSubscriptions.filter(
        (subscription) => subscription.status === "active",
      );
      const pendingPlans = customerSubscriptions.filter(
        (subscription) => subscription.status === "pending",
      );
      const pausedPlans = customerSubscriptions.filter(
        (subscription) => subscription.status === "paused",
      );
      const createdAt = customer.createdAt ? new Date(customer.createdAt) : null;
      const isNew =
        createdAt != null && Date.now() - createdAt.getTime() < 14 * 24 * 60 * 60 * 1000;
      const needsAttention =
        pendingPlans.length > 0 || pausedPlans.length > 0 || !customer.addresses?.length;
      return {
        customer,
        activePlans,
        pendingPlans,
        pausedPlans,
        totalPlans: customerSubscriptions.length,
        isNew,
        needsAttention,
      };
    })
    .filter((profile) => {
      const haystack = [
        profile.customer.name,
        profile.customer.phone,
        profile.customer.addresses?.map((address) => address.streetAddress).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery = query ? haystack.includes(query.toLowerCase()) : true;
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? profile.activePlans.length > 0
            : statusFilter === "attention"
              ? profile.needsAttention
              : profile.isNew;
      return matchesQuery && matchesStatus;
    });
  const activeCustomers = customerProfiles.filter((profile) => profile.activePlans.length > 0);
  const attentionCustomers = customerProfiles.filter((profile) => profile.needsAttention);
  const averagePlans =
    customers.length === 0 ? 0 : Math.round((subscriptions.length / customers.length) * 10) / 10;

  return (
    <Panel
      title="Customer Management"
      kicker={`${customers.length} customers`}
      actionIcon={Users}
      actionText="Profiles and order history"
    >
      <ModuleControlStrip
        controls={[
          "Customer list",
          "Customer profile",
          "Order history",
          "Addresses",
          "Loyalty points",
          "Support tickets",
        ]}
      />
      <div className="admin-intel-grid mb-16">
        <IntelCard
          label="Active customers"
          value={activeCustomers.length}
          detail="Have at least one live subscription"
        />
        <IntelCard
          label="Need attention"
          value={attentionCustomers.length}
          detail="Pending, paused, or missing address"
        />
        <IntelCard label="Avg plans" value={averagePlans} detail="Subscriptions per customer" />
      </div>

      <div className="admin-filter-bar mb-16">
        <label className="admin-filter-search">
          <Search className="h-[14px] w-[14px]" strokeWidth={1.9} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, phone, or address"
          />
        </label>
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as "all" | "active" | "attention" | "new")
          }
          className="admin-table-select"
        >
          <option value="all">All customers</option>
          <option value="active">Active customers</option>
          <option value="attention">Needs attention</option>
          <option value="new">New customers</option>
        </select>
      </div>

      {customers.length ? (
        <div className="grid gap-12">
          {customerProfiles.map((profile) => (
            <article key={profile.customer.id} className="admin-customer-card">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-8">
                  <h3>{profile.customer.name}</h3>
                  {profile.isNew ? <StatusPill tone="success">New</StatusPill> : null}
                  {profile.needsAttention ? <StatusPill tone="warning">Review</StatusPill> : null}
                </div>
                <p className="mt-4 text-[13px] text-graphite">{profile.customer.phone}</p>
                <p className="mt-6 text-[13px] leading-relaxed text-pewter">
                  {profile.customer.addresses?.[0]?.streetAddress || "Address missing"}
                </p>
              </div>
              <div className="admin-customer-metrics">
                <Field label="Active" value={String(profile.activePlans.length)} />
                <Field label="Pending" value={String(profile.pendingPlans.length)} />
                <Field label="Paused" value={String(profile.pausedPlans.length)} />
                <Field label="Addresses" value={String(profile.customer.addresses?.length ?? 0)} />
              </div>
              <div className="admin-customer-products">
                {(subscriptionsByUser.get(profile.customer.id) || [])
                  .slice(0, 3)
                  .map((subscription) => (
                    <span key={subscription.id}>{titleCase(subscription.productType)}</span>
                  ))}
                {profile.totalPlans === 0 ? <span>No plans yet</span> : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No customers found" />
      )}
    </Panel>
  );
}

function DeliveryPartnersPanel({ partners }: { partners: User[] }) {
  return (
    <Panel
      title="Delivery Partner Module"
      kicker={`${partners.length} partners`}
      actionIcon={Truck}
      actionText="Partner operations"
    >
      <ModuleControlStrip
        controls={[
          "Add delivery partner",
          "Partner verification",
          "Live tracking",
          "Assign orders",
          "Earnings dashboard",
          "Delivery performance",
          "Availability status",
        ]}
      />
      {partners.length ? (
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="admin-data-row border-l-[4px] border-l-forest-ink p-14"
            >
              <p className="text-[14px] font-semibold text-charcoal">{partner.name}</p>
              <p className="mt-3 text-[12px] text-graphite">{partner.phone}</p>
              <div className="mt-12 flex items-center justify-between gap-8">
                <StatusPill tone="success">Verified</StatusPill>
                <span className="text-[12px] font-semibold text-pewter">Available</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No delivery partners found" />
      )}
    </Panel>
  );
}

function ProductionArchitecturePanel() {
  const tableCount = databaseDomains.reduce((total, domain) => total + domain.tables.length, 0);
  const apiCount = productionApiGroups.reduce(
    (total, group) => total + Number(group.count.replace(/\D/g, "") || 0),
    0,
  );

  return (
    <Panel
      title="Production Architecture"
      kicker="Full-stack operating model"
      actionIcon={Database}
      actionText="25-35 table target"
    >
      <div className="admin-architecture-flow mb-16">
        {productionArchitectureLayers.map((layer) => {
          const Icon = layer.icon;
          return (
            <article key={layer.title} className="admin-architecture-node">
              <span>
                <Icon className="h-[17px] w-[17px]" strokeWidth={1.9} />
              </span>
              <div>
                <p>{layer.title}</p>
                <h3>{layer.detail}</h3>
                <div className="admin-chip-list">
                  {layer.items.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="admin-role-summary-grid mb-16">
        <IntelCard label="Database tables" value={`${tableCount}+`} detail="Modeled by domain" />
        <IntelCard label="API endpoints" value={`${apiCount}+`} detail="Production surface area" />
        <IntelCard
          label="RBAC roles"
          value="6"
          detail="Super Admin, Admin, Manager, Support, Delivery Partner, Customer"
        />
      </div>

      <section className="admin-architecture-section mb-16">
        <div className="admin-role-section-head">
          <p>Database domains</p>
          <h3>User, product, order, payment, delivery, marketing, support, admin, analytics</h3>
        </div>
        <div className="admin-db-domain-grid">
          {databaseDomains.map((domain) => (
            <article key={domain.title} className="admin-db-domain-card">
              <h4>{domain.title}</h4>
              <div className="admin-chip-list">
                {domain.tables.map((table) => (
                  <span key={table}>{table}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-16 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="admin-architecture-section">
          <div className="admin-role-section-head">
            <p>Infrastructure</p>
            <h3>Deployment-ready stack</h3>
          </div>
          <div className="admin-infra-grid">
            {infrastructureItems.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="admin-infra-card">
                  <span>
                    <Icon className="h-[15px] w-[15px]" strokeWidth={1.9} />
                  </span>
                  <div>
                    <p>{item.title}</p>
                    <strong>{item.value}</strong>
                    <small>{item.detail}</small>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="admin-architecture-section">
          <div className="admin-role-section-head">
            <p>API inventory</p>
            <h3>120+ endpoint production target</h3>
          </div>
          <div className="admin-api-grid">
            {productionApiGroups.map((group) => (
              <article key={group.title} className="admin-api-card">
                <p>{group.title}</p>
                <strong>{group.count}</strong>
                <span>{group.detail}</span>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-16 grid gap-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="admin-architecture-section">
          <div className="admin-role-section-head">
            <p>Security must-haves</p>
            <h3>Authentication, authorization, and protection</h3>
          </div>
          <div className="admin-security-group-grid">
            {securityGroups.map((group) => (
              <article key={group.title} className="admin-security-group-card">
                <h4>{group.title}</h4>
                <div className="admin-chip-list">
                  {group.controls.map((control) => (
                    <span key={control}>{control}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-architecture-section">
          <div className="admin-role-section-head">
            <p>Development order</p>
            <h3>Build sequence</h3>
          </div>
          <ol className="admin-dev-order">
            {developmentOrder.map((item, index) => (
              <li key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </Panel>
  );
}

function UsersRolesPanel({
  users,
  rolePermissions,
}: {
  users: User[];
  rolePermissions: RolePermission[];
}) {
  const roleCounts = users.reduce<Record<string, number>>((counts, user) => {
    counts[user.role] = (counts[user.role] || 0) + 1;
    return counts;
  }, {});
  const rolePermissionMap = rolePermissions.reduce<Record<string, RolePermission[]>>(
    (permissions, permission) => {
      permissions[permission.role] = permissions[permission.role] || [];
      permissions[permission.role].push(permission);
      return permissions;
    },
    {},
  );
  const operationalUsers = adminRoleBlueprints.reduce(
    (total, blueprint) => total + (roleCounts[blueprint.role] || 0),
    0,
  );
  const configuredRoles = adminRoleBlueprints.filter(
    (blueprint) => (rolePermissionMap[blueprint.role] || []).length > 0,
  ).length;

  return (
    <Panel
      title="Users & Roles"
      kicker={`${adminRoleBlueprints.length} production panels`}
      actionIcon={UserCog}
      actionText="Permissions"
    >
      <div className="admin-role-summary-grid mb-16">
        <IntelCard
          label="Operational users"
          value={operationalUsers}
          detail="Users assigned to admin-side roles"
        />
        <IntelCard
          label="Configured roles"
          value={`${configuredRoles}/${adminRoleBlueprints.length}`}
          detail="Roles with backend permission rows"
        />
        <IntelCard
          label="Customer users"
          value={roleCounts.consumer || 0}
          detail="Consumers stay out of admin panels"
        />
      </div>

      <div className="admin-role-panel-grid">
        {adminRoleBlueprints.map((blueprint) => {
          const Icon = blueprint.icon;
          const permissions = rolePermissionMap[blueprint.role] || [];
          const moduleNames = permissions.length
            ? Array.from(new Set(permissions.map((permission) => titleCase(permission.module))))
            : blueprint.modules;
          const controlState: Record<AdminControl, boolean> = {
            View:
              permissions.length > 0
                ? permissions.some((permission) => permission.canView)
                : blueprint.controls.includes("View"),
            Create:
              permissions.length > 0
                ? permissions.some((permission) => permission.canCreate)
                : blueprint.controls.includes("Create"),
            Edit:
              permissions.length > 0
                ? permissions.some((permission) => permission.canEdit)
                : blueprint.controls.includes("Edit"),
            Delete:
              permissions.length > 0
                ? permissions.some((permission) => permission.canDelete)
                : blueprint.controls.includes("Delete"),
            Export:
              permissions.length > 0
                ? permissions.some((permission) => permission.canExport)
                : blueprint.controls.includes("Export"),
          };

          return (
            <section key={blueprint.role} className="admin-role-production-card">
              <div className="admin-role-panel-header">
                <span className="admin-role-icon">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </span>
                <div>
                  <p>{blueprint.owner}</p>
                  <h3>{blueprint.title}</h3>
                </div>
                <StatusPill
                  tone={
                    blueprint.risk === "Critical"
                      ? "danger"
                      : blueprint.risk === "High"
                        ? "warning"
                        : "success"
                  }
                >
                  {blueprint.risk}
                </StatusPill>
              </div>

              <p className="admin-role-description">{blueprint.subtitle}</p>

              <div className="admin-role-metric-row">
                <Field label="Users" value={String(roleCounts[blueprint.role] || 0)} />
                <Field
                  label="Permission rows"
                  value={permissions.length ? String(permissions.length) : "Blueprint"}
                />
              </div>

              <div
                className="admin-role-permission-grid"
                aria-label={`${blueprint.title} controls`}
              >
                {adminControlLabels.map((control) => (
                  <span
                    key={control}
                    className={
                      controlState[control]
                        ? "admin-role-control-enabled"
                        : "admin-role-control-disabled"
                    }
                  >
                    <Check className="h-[12px] w-[12px]" strokeWidth={2} />
                    {control}
                  </span>
                ))}
              </div>

              <div className="admin-role-scope">
                <p>Panel scope</p>
                <div>
                  {moduleNames.slice(0, 8).map((module) => (
                    <span key={module}>{module}</span>
                  ))}
                </div>
              </div>

              <div className="admin-role-guardrails">
                <p>Production guardrails</p>
                <ul>
                  {blueprint.guardrails.map((guardrail) => (
                    <li key={guardrail}>{guardrail}</li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })}
      </div>
    </Panel>
  );
}

function RoleOperationsPanel({
  blueprint,
  users,
  rolePermissions,
  data,
}: {
  blueprint: AdminRoleBlueprint;
  users: User[];
  rolePermissions: RolePermission[];
  data: AdminDashboardData;
}) {
  const Icon = blueprint.icon;
  const assignedUsers = users.filter((user) => user.role === blueprint.role);
  const permissions = rolePermissions.filter((permission) => permission.role === blueprint.role);
  const moduleNames = permissions.length
    ? Array.from(new Set(permissions.map((permission) => titleCase(permission.module))))
    : blueprint.modules;
  const workload = getRoleWorkload(blueprint.role, data);
  const controlState = adminControlLabels.reduce<Record<AdminControl, boolean>>(
    (state, control) => {
      const field = permissionControlFields[control];
      state[control] = permissions.length
        ? permissions.some((permission) => Boolean(permission[field]))
        : blueprint.controls.includes(control);
      return state;
    },
    {
      View: false,
      Create: false,
      Edit: false,
      Delete: false,
      Export: false,
    },
  );

  return (
    <Panel
      title={`${blueprint.title} Panel`}
      kicker={`${assignedUsers.length} assigned users`}
      actionIcon={Icon}
      actionText="Role workspace"
    >
      <div className="admin-role-dashboard-hero mb-16">
        <span className="admin-role-icon">
          <Icon className="h-[20px] w-[20px]" strokeWidth={1.9} />
        </span>
        <div>
          <p>{blueprint.owner}</p>
          <h3>{blueprint.title}</h3>
          <span>{blueprint.subtitle}</span>
        </div>
        <StatusPill
          tone={
            blueprint.risk === "Critical"
              ? "danger"
              : blueprint.risk === "High"
                ? "warning"
                : "success"
          }
        >
          {blueprint.risk}
        </StatusPill>
      </div>

      <div className="admin-role-summary-grid mb-16">
        <IntelCard
          label="Assigned users"
          value={assignedUsers.length}
          detail="Users in this role"
        />
        <IntelCard
          label="Permission rows"
          value={permissions.length || "Blueprint"}
          detail="Backend access rules loaded"
        />
        <IntelCard label={workload.label} value={workload.value} detail={workload.detail} />
      </div>

      <div className="admin-role-permission-grid mb-16">
        {adminControlLabels.map((control) => (
          <span
            key={control}
            className={
              controlState[control] ? "admin-role-control-enabled" : "admin-role-control-disabled"
            }
          >
            <Check className="h-[12px] w-[12px]" strokeWidth={2} />
            {control}
          </span>
        ))}
      </div>

      <section className="admin-role-production-card mb-16">
        <div className="admin-role-section-head">
          <p>Dashboard workspace</p>
          <h3>{blueprint.title} controls</h3>
        </div>
        <ModuleControlStrip controls={blueprint.dashboardWidgets} />
      </section>

      <div className="admin-role-workspace-grid mb-16">
        <section className="admin-role-workflow-card">
          <div className="admin-role-section-head">
            <p>Workflows</p>
            <h3>Daily actions</h3>
          </div>
          <ul>
            {blueprint.workflows.map((workflow) => (
              <li key={workflow}>{workflow}</li>
            ))}
          </ul>
        </section>

        <section className="admin-role-workflow-card">
          <div className="admin-role-section-head">
            <p>Data ownership</p>
            <h3>Tables touched</h3>
          </div>
          <div className="admin-chip-list">
            {blueprint.dataTables.map((table) => (
              <span key={table}>{table}</span>
            ))}
          </div>
        </section>

        <section className="admin-role-workflow-card">
          <div className="admin-role-section-head">
            <p>API surface</p>
            <h3>{blueprint.apiScope}</h3>
          </div>
          <div className="admin-chip-list">
            {blueprint.securityControls.map((control) => (
              <span key={control}>{control}</span>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-14 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.45fr)]">
        <section className="admin-role-production-card">
          <div className="admin-role-section-head">
            <p>Module permissions</p>
            <h3>{moduleNames.length} active modules</h3>
          </div>
          {permissions.length ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Module</th>
                    <th>View</th>
                    <th>Create</th>
                    <th>Edit</th>
                    <th>Delete</th>
                    <th>Export</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((permission) => (
                    <tr key={permission.id}>
                      <td>{titleCase(permission.module)}</td>
                      {adminControlLabels.map((control) => (
                        <td key={control}>
                          <StatusPill
                            tone={
                              permission[permissionControlFields[control]] ? "success" : "neutral"
                            }
                          >
                            {permission[permissionControlFields[control]] ? "Yes" : "No"}
                          </StatusPill>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-role-scope">
              <p>Blueprint modules</p>
              <div>
                {moduleNames.map((module) => (
                  <span key={module}>{module}</span>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="admin-role-production-card">
          <div className="admin-role-section-head">
            <p>Assigned people</p>
            <h3>{assignedUsers.length ? "Role members" : "No users assigned"}</h3>
          </div>
          {assignedUsers.length ? (
            <div className="admin-role-user-list">
              {assignedUsers.map((user) => (
                <article key={user.id} className="admin-role-user-card">
                  <div>
                    <strong>{user.name}</strong>
                    <span>{user.phone}</span>
                  </div>
                  <StatusPill tone="success">{titleCase(user.role)}</StatusPill>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title={`No ${blueprint.title} users assigned yet`} />
          )}

          <div className="admin-role-guardrails mt-14">
            <p>Production guardrails</p>
            <ul>
              {blueprint.guardrails.map((guardrail) => (
                <li key={guardrail}>{guardrail}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </Panel>
  );
}

function getRoleWorkload(role: UserRole, data: AdminDashboardData) {
  if (role === "super_admin") {
    return {
      label: "Security events",
      value: data.auditLogs.length + data.loginHistory.length,
      detail: "Audit and login events",
    };
  }
  if (role === "admin") {
    return {
      label: "Operational queue",
      value: data.orders.length + data.leads.length,
      detail: "Orders and leads in the system",
    };
  }
  if (role === "manager") {
    return {
      label: "Revenue tracked",
      value: formatCurrency(data.summary.dashboard?.totalRevenue || 0),
      detail: "Paid and settled payment total",
    };
  }
  if (role === "customer_support") {
    return {
      label: "Customers",
      value: data.users.filter((user) => user.role === "consumer").length,
      detail: "Customer profiles available",
    };
  }
  if (role === "inventory_manager") {
    return {
      label: "Catalog scope",
      value: `${data.products.length}/${data.categories.length}`,
      detail: "Products / categories",
    };
  }
  if (role === "delivery_manager") {
    return {
      label: "Delivery queue",
      value: data.orders.filter((order) =>
        ["pending", "assigned", "out_for_delivery"].includes(order.status),
      ).length,
      detail: "Pending or active deliveries",
    };
  }
  return {
    label: "Workspace",
    value: 0,
    detail: "No workload mapped",
  };
}

function SecurityLogsPanel({
  auditLogs,
  loginHistory,
  settings,
}: {
  auditLogs: AuditLog[];
  loginHistory: LoginHistory[];
  settings: AppSetting[];
}) {
  const [moduleFilter, setModuleFilter] = useState("all");
  const highRiskActions = new Set([
    "delete",
    "delete_setting",
    "reject",
    "cancel",
    "request_refund",
    "update_setting",
  ]);
  const failedLogins = loginHistory.filter((login) => login.status !== "success");
  const highRiskLogs = auditLogs.filter((log) => highRiskActions.has(log.action));
  const securitySettings = settings.filter((setting) => setting.group === "security");
  const modules = Array.from(new Set(auditLogs.map((log) => log.module))).sort();
  const filteredAuditLogs =
    moduleFilter === "all" ? auditLogs : auditLogs.filter((log) => log.module === moduleFilter);

  return (
    <Panel
      title="Audit Logs"
      kicker={`${auditLogs.length + loginHistory.length} events`}
      actionIcon={Shield}
      actionText="Timeline"
    >
      <div className="admin-risk-grid mb-16">
        <RiskCard
          label="Failed logins"
          value={failedLogins.length}
          detail="Review repeated failures and unknown devices"
          tone={failedLogins.length ? "warning" : "safe"}
        />
        <RiskCard
          label="High-risk changes"
          value={highRiskLogs.length}
          detail="Deletes, cancellations, refunds, and setting changes"
          tone={highRiskLogs.length ? "warning" : "safe"}
        />
        <RiskCard
          label="Security settings"
          value={securitySettings.length}
          detail="Persistent controls loaded from backend"
          tone="safe"
        />
      </div>

      <div className="admin-security-control mb-16">
        <div>
          <p>Production controls</p>
          <h3>Audit every privileged action before it becomes a business incident.</h3>
        </div>
        <div className="admin-security-chips">
          <span>HttpOnly session</span>
          <span>CSRF checked writes</span>
          <span>Rate-limited login</span>
          <span>Persistent audit trail</span>
        </div>
      </div>

      <div className="mb-16 rounded-[8px] border border-forest-ink/10 bg-[#f8fafc] p-14">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-forest-ink">
              Filter Panel
            </p>
            <h3 className="mt-3 font-reckless text-[30px] font-medium leading-none text-charcoal">
              Audit timeline
            </h3>
          </div>
          <label className="grid gap-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-pewter">
            Module
            <select
              value={moduleFilter}
              onChange={(event) => setModuleFilter(event.target.value)}
              className="admin-table-select"
            >
              <option value="all">All modules</option>
              {modules.map((module) => (
                <option key={module} value={module}>
                  {titleCase(module)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {filteredAuditLogs.length ? (
        <div className="mb-18 grid gap-10">
          {filteredAuditLogs.slice(0, 60).map((log) => (
            <article
              key={log.id}
              className="grid gap-10 rounded-[8px] border border-forest-ink/10 bg-pure-white p-14 shadow-sm sm:grid-cols-[92px_minmax(0,1fr)]"
            >
              <time className="text-[13px] font-semibold text-forest-ink">
                {formatTimeOnly(log.createdAt)}
              </time>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-8">
                  <p className="text-[14px] font-semibold text-charcoal">
                    {log.actorId ? "Admin" : "System"} {titleCase(log.action)}
                  </p>
                  <StatusPill tone={highRiskActions.has(log.action) ? "warning" : "neutral"}>
                    {titleCase(log.module)}
                  </StatusPill>
                </div>
                <p className="mt-5 text-[12px] text-graphite">
                  {log.entityType ? `${log.entityType}:${log.entityId || "n/a"}` : "System event"}
                </p>
                {log.metadata ? (
                  <p className="mt-5 truncate text-[12px] text-pewter">
                    {JSON.stringify(log.metadata)}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No audit logs recorded yet" />
      )}

      <div className="mt-18">
        <h3 className="mb-12 font-reckless text-[30px] font-medium leading-none text-charcoal">
          Login history
        </h3>
        {loginHistory.length ? (
          <div className="grid gap-10">
            {loginHistory.slice(0, 18).map((login) => (
              <div key={login.id} className="admin-login-row">
                <div>
                  <p>{formatDateTime(login.createdAt)}</p>
                  <span>{login.userAgent || "Unknown device"}</span>
                </div>
                <Field label="Role" value={login.role || "admin"} />
                <Field label="IP address" value={login.ipAddress || "Unavailable"} />
                <StatusPill tone={login.status === "success" ? "success" : "danger"}>
                  {login.status}
                </StatusPill>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No login events recorded yet" />
        )}
      </div>
    </Panel>
  );
}

const settingGroups = [
  { id: "store", title: "Store Information", icon: Store },
  { id: "commerce", title: "Tax & Delivery", icon: IndianRupee },
  { id: "payments", title: "Payment Gateway", icon: CreditCard },
  { id: "notifications", title: "Notifications", icon: Bell },
  { id: "security", title: "Security", icon: ShieldCheck },
];

function settingInputValue(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value ?? "", null, 2);
}

function parseSettingInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^(\{|\[|true$|false$|null$|-?\d)/i.test(trimmed)) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }
  return value;
}

function SettingsPanel({
  settings,
  isBusy,
  onSave,
}: {
  settings: AppSetting[];
  isBusy: boolean;
  onSave: (key: string, payload: AppSettingPayload) => Promise<void>;
}) {
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(settings.map((setting) => [setting.key, settingInputValue(setting.value)])),
  );

  useEffect(() => {
    setDrafts(
      Object.fromEntries(
        settings.map((setting) => [setting.key, settingInputValue(setting.value)]),
      ),
    );
  }, [settings]);

  function updateDraft(key: string, value: string) {
    setDrafts((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSave(setting: AppSetting) {
    await onSave(setting.key, {
      group: setting.group,
      label: setting.label,
      value: parseSettingInput(drafts[setting.key] ?? ""),
      isSecret: setting.isSecret,
    });
  }

  return (
    <Panel
      title="Settings"
      kicker={`${settings.length} production controls`}
      actionIcon={Settings}
      actionText="Store configuration"
    >
      <div className="admin-settings-overview mb-16">
        {settingGroups.map((group) => {
          const Icon = group.icon;
          const count = settings.filter((setting) => setting.group === group.id).length;
          return (
            <div key={group.id} className="admin-settings-group-card">
              <span>
                <Icon className="h-[16px] w-[16px]" strokeWidth={1.9} />
              </span>
              <div>
                <p>{group.title}</p>
                <strong>{count}</strong>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-18">
        {settingGroups.map((group) => {
          const groupSettings = settings.filter((setting) => setting.group === group.id);
          if (!groupSettings.length) return null;
          return (
            <section key={group.id} className="admin-settings-section">
              <div className="admin-settings-section-head">
                <p>{group.title}</p>
                <span>{groupSettings.length} settings</span>
              </div>
              <div className="grid gap-12 xl:grid-cols-2">
                {groupSettings.map((setting) => (
                  <article key={setting.key} className="admin-setting-card">
                    <div className="mb-10 flex items-start justify-between gap-10">
                      <div>
                        <h3>{setting.label}</h3>
                        <p>{setting.key}</p>
                      </div>
                      {setting.isSecret ? <StatusPill tone="warning">Secret</StatusPill> : null}
                    </div>
                    <textarea
                      value={drafts[setting.key] ?? ""}
                      onChange={(event) => updateDraft(setting.key, event.target.value)}
                      className="admin-textarea min-h-[92px]"
                    />
                    <div className="mt-10 flex items-center justify-between gap-10">
                      <span className="text-[12px] text-pewter">
                        Updated {setting.updatedAt ? formatDateTime(setting.updatedAt) : "never"}
                      </span>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void handleSave(setting)}
                        className="admin-primary-button"
                      >
                        <Check className="h-[12px] w-[12px]" strokeWidth={1.9} />
                        Save
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Panel>
  );
}

type InventoryStatus = "healthy" | "low" | "out";

type InventoryRow = {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  reorderLevel: number;
  status: InventoryStatus;
};

function InventoryDashboardPanel({
  products,
  inventoryItems,
  onCreate,
  onAdjust,
  onDelete,
}: {
  products: Product[];
  inventoryItems: InventoryItem[];
  onCreate: (payload: InventoryItemPayload) => Promise<void>;
  onAdjust: (id: string, payload: StockAdjustmentPayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState({
    productId: products[0]?.id || "",
    currentStock: "0",
    reservedStock: "0",
    reorderLevel: "10",
    unit: products[0]?.unit || "unit",
    warehouseName: "Main warehouse",
    sku: "",
  });

  useEffect(() => {
    if (!products.length) return;
    setDraft((current) => {
      const selected = products.find((product) => product.id === current.productId) || products[0];
      return {
        ...current,
        productId: selected.id,
        unit: selected.unit || current.unit || "unit",
      };
    });
  }, [products]);

  const inventoryRows = useMemo(
    () =>
      inventoryItems
        .map((item) => {
          const product = item.product || products.find((entry) => entry.id === item.productId);
          if (!product) return null;
          const currentStock = Number(item.currentStock || 0);
          const reservedStock = Number(item.reservedStock || 0);
          const reorderLevel = Number(item.reorderLevel || 0);
          const availableStock = Math.max(currentStock - reservedStock, 0);
          const status: InventoryStatus =
            String(item.status || "").includes("out") || availableStock <= 0
              ? "out"
              : availableStock <= reorderLevel
                ? "low"
                : "healthy";
          return {
            id: item.id,
            name: item.variant?.name || product.name,
            unit: item.unit || product.unit || "unit",
            currentStock,
            reservedStock,
            availableStock,
            reorderLevel,
            status,
            productId: product.id,
          } as InventoryRow & { productId: string };
        })
        .filter(Boolean) as Array<InventoryRow & { productId: string }>,
    [inventoryItems, products],
  );
  const healthyCount = inventoryRows.filter((item) => item.status === "healthy").length;
  const lowCount = inventoryRows.filter((item) => item.status === "low").length;
  const outCount = inventoryRows.filter((item) => item.status === "out").length;

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreate({
      productId: draft.productId,
      currentStock: Number(draft.currentStock || 0),
      reservedStock: Number(draft.reservedStock || 0),
      reorderLevel: Number(draft.reorderLevel || 0),
      unit: draft.unit.trim(),
      sku: draft.sku.trim() || undefined,
      warehouseName: draft.warehouseName.trim() || undefined,
    });
    const first = products.find((product) => product.id === draft.productId) || products[0];
    setDraft({
      productId: first?.id || "",
      currentStock: "0",
      reservedStock: "0",
      reorderLevel: "10",
      unit: first?.unit || "unit",
      warehouseName: "Main warehouse",
      sku: "",
    });
  }

  async function topUpStock(item: InventoryRow & { productId: string }) {
    const quantityText = window.prompt(`Add how much stock for ${item.name}?`, "1");
    if (!quantityText) return;
    const quantity = Number(quantityText);
    if (!Number.isFinite(quantity) || quantity <= 0) return;
    await onAdjust(item.id, {
      movementType: "in",
      quantity,
      reason: "Manual stock top-up",
      referenceType: "admin-panel",
    });
  }

  async function removeStock(item: InventoryRow & { productId: string }) {
    if (!window.confirm(`Delete ${item.name} from stock?`)) return;
    await onDelete(item.id);
  }

  return (
    <Panel
      title="Inventory Dashboard"
      kicker={`${inventoryRows.length} stock items`}
      actionIcon={Warehouse}
      actionText={`${lowCount + outCount} alerts`}
    >
      <div className="admin-intel-grid mb-16">
        <IntelCard label="Healthy" value={healthyCount} detail="Available above reorder point" />
        <IntelCard label="Low stock" value={lowCount} detail="Needs purchase planning" />
        <IntelCard label="Out of stock" value={outCount} detail="Cannot fulfill demand" />
      </div>

      <form onSubmit={handleCreate} className="admin-form-card mb-16">
        <div className="mb-10 flex items-center justify-between gap-10">
          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.18em] text-forest-ink">
              Stock entry
            </p>
            <h3 className="mt-2 font-inter text-[16px] font-semibold tracking-normal text-charcoal">
              Add a stock item
            </h3>
          </div>
          <span className="text-[12px] text-pewter">Create, then adjust from the cards below</span>
        </div>
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-6">
          <select
            value={draft.productId}
            onChange={(event) => {
              const selected = products.find((product) => product.id === event.target.value);
              setDraft((current) => ({
                ...current,
                productId: event.target.value,
                unit: selected?.unit || current.unit,
              }));
            }}
            className="admin-input xl:col-span-2"
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <input
            value={draft.currentStock}
            onChange={(event) =>
              setDraft((current) => ({ ...current, currentStock: event.target.value }))
            }
            min="0"
            step="1"
            type="number"
            placeholder="Current stock"
            className="admin-input"
          />
          <input
            value={draft.reservedStock}
            onChange={(event) =>
              setDraft((current) => ({ ...current, reservedStock: event.target.value }))
            }
            min="0"
            step="1"
            type="number"
            placeholder="Reserved"
            className="admin-input"
          />
          <input
            value={draft.reorderLevel}
            onChange={(event) =>
              setDraft((current) => ({ ...current, reorderLevel: event.target.value }))
            }
            min="0"
            step="1"
            type="number"
            placeholder="Reorder level"
            className="admin-input"
          />
          <input
            value={draft.unit}
            onChange={(event) => setDraft((current) => ({ ...current, unit: event.target.value }))}
            placeholder="Unit"
            className="admin-input"
          />
          <input
            value={draft.warehouseName}
            onChange={(event) =>
              setDraft((current) => ({ ...current, warehouseName: event.target.value }))
            }
            placeholder="Warehouse"
            className="admin-input xl:col-span-2"
          />
          <input
            value={draft.sku}
            onChange={(event) => setDraft((current) => ({ ...current, sku: event.target.value }))}
            placeholder="SKU (optional)"
            className="admin-input xl:col-span-2"
          />
          <button type="submit" className="admin-primary-button h-38 xl:col-span-2">
            <Plus className="h-[12px] w-[12px]" strokeWidth={1.9} />
            Add stock
          </button>
        </div>
      </form>

      {inventoryRows.length ? (
        <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-3">
          {inventoryRows.map((item) => {
            const status = inventoryStatusMeta(item.status);
            return (
              <article
                key={item.id}
                className="rounded-[8px] border border-forest-ink/10 bg-pure-white p-16 shadow-sm"
              >
                <div className="flex items-start justify-between gap-10">
                  <div>
                    <p className="text-[15px] font-semibold text-charcoal">{item.name}</p>
                    <p className="mt-3 text-[12px] text-graphite">
                      Reorder below {formatNumber(item.reorderLevel)} {item.unit}
                    </p>
                  </div>
                  <StatusPill tone={status.tone}>{status.label}</StatusPill>
                </div>
                <div className="mt-14 grid grid-cols-3 gap-8">
                  <Field
                    label="Current"
                    value={`${formatNumber(item.currentStock)} ${item.unit}`}
                  />
                  <Field
                    label="Reserved"
                    value={`${formatNumber(item.reservedStock)} ${item.unit}`}
                  />
                  <Field
                    label="Available"
                    value={`${formatNumber(item.availableStock)} ${item.unit}`}
                  />
                </div>
                <div className="mt-14 flex items-center justify-end gap-8">
                  <button
                    type="button"
                    onClick={() => void topUpStock(item)}
                    className="admin-secondary-button h-32 px-10 text-[12px]"
                  >
                    <Plus className="h-[12px] w-[12px]" strokeWidth={1.9} />
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => void removeStock(item)}
                    className="admin-danger-button"
                  >
                    <Trash2 className="h-[12px] w-[12px]" strokeWidth={1.9} />
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No inventory items found" />
      )}
    </Panel>
  );
}

function AnalyticsDashboardPanel({
  data,
  metrics,
}: {
  data: AdminDashboardData;
  metrics: CrmMetrics | null;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedMetrics = metrics ?? buildCrmMetrics(data);
  const averagePrice =
    data.products.reduce((total, product) => total + Number(product.price || 0), 0) /
    Math.max(data.products.filter((product) => product.price != null).length, 1);
  const revenueTrend = resolvedMetrics.salesGrowth.map((point) => ({
    ...point,
    revenue: Math.round(point.salesUnits * averagePrice),
  }));
  const inventoryRows = getInventoryRows(data.products, data.subscriptions);
  const inventoryHealth = [
    {
      name: "Healthy",
      value: inventoryRows.filter((item) => item.status === "healthy").length,
      color: "#16A34A",
    },
    {
      name: "Low Stock",
      value: inventoryRows.filter((item) => item.status === "low").length,
      color: "#F59E0B",
    },
    {
      name: "Out of Stock",
      value: inventoryRows.filter((item) => item.status === "out").length,
      color: "#DC2626",
    },
  ];
  const conversionDonut = [
    { name: "Converted", value: resolvedMetrics.conversionRate, color: "#2563EB" },
    { name: "Open", value: Math.max(100 - resolvedMetrics.conversionRate, 0), color: "#CBD5E1" },
  ];

  if (!mounted) {
    return (
      <div className="grid gap-18">
        <div className="grid gap-18 xl:grid-cols-2">
          <ChartCard title="Orders Trend" kicker="Operational volume" icon={ShoppingCart}>
            <div className="h-[260px] flex items-center justify-center bg-ash-gray/10 animate-pulse rounded-cards">
              <span className="text-body-sm text-pewter">Loading chart...</span>
            </div>
          </ChartCard>
          <ChartCard title="Revenue Trend" kicker="Estimated value" icon={IndianRupee}>
            <div className="h-[260px] flex items-center justify-center bg-ash-gray/10 animate-pulse rounded-cards">
              <span className="text-body-sm text-pewter">Loading chart...</span>
            </div>
          </ChartCard>
        </div>
        <div className="grid gap-18 xl:grid-cols-2">
          <ChartCard title="Lead Conversion" kicker="Subscriber pipeline" icon={UserPlus}>
            <div className="h-[220px] flex items-center justify-center bg-ash-gray/10 animate-pulse rounded-cards">
              <span className="text-body-sm text-pewter">Loading chart...</span>
            </div>
          </ChartCard>
          <ChartCard title="Inventory Health" kicker="Stock readiness" icon={Warehouse}>
            <div className="h-[120px] flex items-center justify-center bg-ash-gray/10 animate-pulse rounded-cards">
              <span className="text-body-sm text-pewter">Loading data...</span>
            </div>
          </ChartCard>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-18">
      <div className="grid gap-18 xl:grid-cols-2">
        <ChartCard title="Orders Trend" kicker="Operational volume" icon={ShoppingCart}>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resolvedMetrics.salesGrowth}>
                <defs>
                  <linearGradient id="analyticsOrdersGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 3" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="salesUnits"
                  name="Order units"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fill="url(#analyticsOrdersGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Revenue Trend" kicker="Estimated value" icon={IndianRupee}>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend}>
                <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 3" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#16A34A"
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-18 xl:grid-cols-2">
        <ChartCard title="Lead Conversion" kicker="Subscriber pipeline" icon={UserPlus}>
          <div className="grid gap-16 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conversionDonut}
                    dataKey="value"
                    innerRadius={62}
                    outerRadius={92}
                    paddingAngle={4}
                  >
                    {conversionDonut.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid gap-10">
              <CrmSignal
                label="Conversion"
                value={`${resolvedMetrics.conversionRate}%`}
                detail="Active subscribers from open pipeline"
              />
              <CrmSignal
                label="Pending units"
                value={resolvedMetrics.pendingUnits}
                detail="Awaiting sales decision"
              />
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Inventory Health" kicker="Stock readiness" icon={Warehouse}>
          <div className="grid gap-12">
            {inventoryHealth.map((item) => (
              <div key={item.name} className="admin-product-rank-row">
                <span style={{ backgroundColor: item.color }} />
                <div>
                  <p>{item.name}</p>
                  <small>{item.value} products</small>
                </div>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function IntelCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: number | string;
  detail: string;
}) {
  return (
    <div className="admin-intel-card">
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </div>
  );
}

function RiskCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: number | string;
  detail: string;
  tone: "safe" | "warning";
}) {
  return (
    <div className={`admin-risk-card admin-risk-card-${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </div>
  );
}

function FeatureModulePanel({ module }: { module: FeatureModule }) {
  const Icon = module.icon;
  return (
    <Panel
      title={module.title}
      kicker={module.kicker}
      actionIcon={Icon}
      actionText="Platform module"
    >
      <div className="admin-module-hero">
        <span>
          <Icon className="h-[20px] w-[20px]" strokeWidth={1.9} />
        </span>
        <div>
          <h3>{module.title}</h3>
          <p>{module.summary}</p>
        </div>
      </div>
      <ModuleControlStrip controls={module.controls} />
      {module.reports?.length ? <ModuleControlStrip controls={module.reports} /> : null}
    </Panel>
  );
}

function ModuleControlStrip({
  controls,
  activeControl,
  onControlSelect,
}: {
  controls: string[];
  activeControl?: string;
  onControlSelect?: (control: string) => void;
}) {
  return (
    <div className="admin-module-control-grid">
      {controls.map((control) => {
        const isActive = activeControl === control;
        return (
          <button
            key={control}
            type="button"
            onClick={() => onControlSelect?.(control)}
            className={`admin-module-control w-full text-left flex items-center gap-6 ${
              isActive ? "admin-module-control-active bg-forest-ink/10 font-semibold text-forest-ink" : ""
            }`}
          >
            <Check className={`h-[13px] w-[13px] ${isActive ? "text-forest-ink" : "text-pewter"}`} strokeWidth={2} />
            <span>{control}</span>
          </button>
        );
      })}
    </div>
  );
}

function getTopProducts(subscriptions: Subscription[]) {
  const productMap = new Map<string, number>();
  for (const subscription of subscriptions) {
    if (subscription.status === "terminated") continue;
    const product = titleCase(subscription.productType || "Product");
    productMap.set(product, (productMap.get(product) || 0) + Number(subscription.quantity || 0));
  }

  const rows = Array.from(productMap.entries())
    .map(([name, units]) => ({ name, units }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);
  const total = rows.reduce((sum, product) => sum + product.units, 0) || 1;

  return rows.length
    ? rows.map((product) => ({
        ...product,
        share: Math.round((product.units / total) * 100),
      }))
    : [{ name: "No active products", units: 0, share: 0 }];
}

function getRecentActivities(data: AdminDashboardData) {
  const activities = [
    ...data.leads.slice(0, 4).map((lead) => ({
      type: "lead",
      title: `New lead: ${lead.name}`,
      meta: `${lead.productType} - ${lead.area}`,
      time: formatDateTime(lead.submittedAt),
      tone: "forest",
      sort: new Date(lead.submittedAt).getTime(),
    })),
    ...data.orders.slice(0, 4).map((order) => ({
      type: "order",
      title: `Order ${order.status}`,
      meta: order.subscription?.user?.name || "Customer",
      time: formatDate(order.deliveryDate),
      tone: order.status === "delivered" ? "green" : "amber",
      sort: new Date(order.deliveryDate).getTime(),
    })),
    ...data.notifications.slice(0, 3).map((notification) => ({
      type: "notification",
      title: `${titleCase(notification.type)} notification`,
      meta: getNotificationRecipient(notification),
      time: formatDateTime(notification.createdAt),
      tone: "sky",
      sort: new Date(notification.createdAt).getTime(),
    })),
  ];

  return activities.sort((a, b) => b.sort - a.sort).slice(0, 6);
}

function CrmOverview({ metrics }: { metrics: CrmMetrics }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mb-24 grid gap-18 xl:grid-cols-[minmax(0,1.5fr)_minmax(380px,0.86fr)] 2xl:grid-cols-[minmax(0,1.6fr)_minmax(420px,0.82fr)]">
        <ChartCard title="Sales growth" kicker="Last 8 days" icon={TrendingUp}>
          <div className="h-[230px] lg:h-[300px] 2xl:h-[330px] flex items-center justify-center bg-ash-gray/10 animate-pulse rounded-cards">
            <span className="text-body-sm text-pewter">Loading chart...</span>
          </div>
        </ChartCard>
        <div className="grid gap-14">
          <ChartCard title="Pipeline" kicker="CRM stages" icon={ClipboardList}>
            <div className="h-[166px] lg:h-[190px] 2xl:h-[210px] flex items-center justify-center bg-ash-gray/10 animate-pulse rounded-cards">
              <span className="text-body-sm text-pewter">Loading chart...</span>
            </div>
          </ChartCard>
          <ChartCard title="Product mix" kicker="Demand split" icon={Milk}>
            <div className="h-[152px] lg:h-[190px] 2xl:h-[210px] flex items-center justify-center bg-ash-gray/10 animate-pulse rounded-cards">
              <span className="text-body-sm text-pewter">Loading chart...</span>
            </div>
          </ChartCard>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-24 grid gap-18 xl:grid-cols-[minmax(0,1.5fr)_minmax(380px,0.86fr)] 2xl:grid-cols-[minmax(0,1.6fr)_minmax(420px,0.82fr)]">
      <ChartCard
        title="Sales growth"
        kicker="Last 8 days"
        icon={TrendingUp}
        meta={`${metrics.salesGrowthPercent >= 0 ? "+" : ""}${metrics.salesGrowthPercent}% vs prior window`}
      >
        <div className="h-[230px] lg:h-[300px] 2xl:h-[330px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.salesGrowth}>
              <defs>
                <linearGradient id="salesUnitsGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#07503f" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#07503f" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="leadGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#c3cda7" stopOpacity={0.42} />
                  <stop offset="95%" stopColor="#c3cda7" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#c3cda7" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6d6d6d", fontSize: 12 }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6d6d6d", fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="salesUnits"
                name="Sales units"
                stroke="#07503f"
                strokeWidth={2.4}
                fill="url(#salesUnitsGradient)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="leads"
                name="Leads"
                stroke="#647c3f"
                strokeWidth={2}
                fill="url(#leadGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="grid gap-14">
        <ChartCard title="Pipeline" kicker="CRM stages" icon={ClipboardList}>
          <div className="h-[166px] lg:h-[190px] 2xl:h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.pipeline} layout="vertical" margin={{ left: 4, right: 14 }}>
                <CartesianGrid stroke="#c3cda7" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="stage"
                  axisLine={false}
                  tickLine={false}
                  width={86}
                  tick={{ fill: "#353535", fontSize: 12 }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="count"
                  name="Subscriptions"
                  radius={[0, 8, 8, 0]}
                  isAnimationActive={false}
                >
                  {metrics.pipeline.map((entry) => (
                    <Cell key={entry.stage} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Product mix" kicker="Demand split" icon={Milk}>
          <div className="grid items-center gap-12 sm:grid-cols-[152px_1fr] lg:grid-cols-[180px_1fr] 2xl:grid-cols-[198px_1fr]">
            <div className="h-[152px] lg:h-[190px] 2xl:h-[210px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.productMix}
                    dataKey="units"
                    nameKey="product"
                    innerRadius={44}
                    outerRadius={72}
                    paddingAngle={3}
                    isAnimationActive={false}
                  >
                    {metrics.productMix.map((entry, index) => (
                      <Cell key={entry.product} fill={CRM_COLORS[index % CRM_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid gap-8">
              {metrics.productMix.map((item, index) => (
                <div key={item.product} className="flex items-center justify-between gap-10">
                  <span className="inline-flex items-center gap-8 text-[13px] text-graphite">
                    <span
                      className="h-10 w-10 rounded-[3px]"
                      style={{ backgroundColor: CRM_COLORS[index % CRM_COLORS.length] }}
                    />
                    {item.product}
                  </span>
                  <span className="text-[13px] font-semibold text-charcoal">{item.units}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-14 md:grid-cols-3 xl:col-span-2">
        <CrmSignal
          label="Conversion"
          value={`${metrics.conversionRate}%`}
          detail="Active / total pipeline"
        />
        <CrmSignal
          label="Open pipeline"
          value={metrics.pendingUnits}
          detail="Pending subscription units"
        />
        <CrmSignal
          label="Active base"
          value={metrics.activeUnits}
          detail="Recurring delivery units"
        />
      </div>
    </div>
  );
}

function ChartCard({
  title,
  kicker,
  icon: Icon,
  meta,
  children,
}: {
  title: string;
  kicker: string;
  icon: LucideIcon;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="crm-chart-card">
      <div className="mb-14 flex items-start justify-between gap-12">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-forest-ink">
            {kicker}
          </p>
          <h2 className="mt-3 font-reckless text-[26px] font-medium leading-[1.08] tracking-normal text-charcoal">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-8">
          {meta ? (
            <span className="rounded-[999px] bg-forest-ink/10 px-9 py-4 text-[11px] font-semibold text-forest-ink">
              {meta}
            </span>
          ) : null}
          <span className="inline-flex h-30 w-30 items-center justify-center rounded-[8px] bg-forest-ink text-pure-white">
            <Icon className="h-[13px] w-[13px]" strokeWidth={1.9} />
          </span>
        </div>
      </div>
      {children}
    </section>
  );
}

function CrmSignal({
  label,
  value,
  detail,
}: {
  label: string;
  value: number | string;
  detail: string;
}) {
  return (
    <div className="rounded-[8px] border border-forest-ink/10 bg-pure-white/85 p-16 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-pewter">{label}</p>
      <p className="mt-7 font-reckless text-[34px] font-medium leading-none tracking-normal text-charcoal">
        {value}
      </p>
      <p className="mt-3 text-[13px] text-graphite">{detail}</p>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-[8px] border border-forest-ink/10 bg-pure-white px-12 py-10 shadow-lg">
      {label ? <p className="mb-6 text-[12px] font-semibold text-charcoal">{label}</p> : null}
      <div className="grid gap-4">
        {payload.map((item) => (
          <p
            key={`${item.name}-${item.value}`}
            className="flex items-center gap-8 text-[12px] text-graphite"
          >
            <span
              className="h-9 w-9 rounded-[3px]"
              style={{ backgroundColor: item.color || "#07503f" }}
            />
            <span>{item.name}</span>
            <span className="font-semibold text-charcoal">{item.value}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

type LeadCaptureDraft = {
  name: string;
  phone: string;
  area: string;
  product: string;
  requestType: "subscription" | "order";
  quantity: string;
  plan: "daily" | "alternate" | "custom";
  notes: string;
};

function createLeadDraft(product = "milk"): LeadCaptureDraft {
  return {
    name: "",
    phone: "",
    area: "",
    product,
    requestType: "subscription",
    quantity: "1",
    plan: "daily",
    notes: "",
  };
}

function LeadsPanel({
  leads,
  products,
  pendingSubscriptions,
  isBusy,
  onActivate,
  onReject,
  onCapture,
  onDelete,
}: {
  leads: Lead[];
  products: Product[];
  pendingSubscriptions: Subscription[];
  isBusy: boolean;
  onActivate: (id: string) => void;
  onReject: (id: string) => void;
  onCapture: (payload: LeadSubmission) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const subscriptionById = new Map(
    pendingSubscriptions.map((subscription) => [subscription.id, subscription]),
  );
  const productOptions = useMemo(() => {
    const seen = new Set<string>();
    return products
      .map((product) => product.productType || product.name)
      .filter((product) => {
        const normalized = product.trim();
        if (!normalized || seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
      });
  }, [products]);
  const [draft, setDraft] = useState<LeadCaptureDraft>(
    createLeadDraft(productOptions[0] || "milk"),
  );

  useEffect(() => {
    if (!productOptions.length) return;
    setDraft((current) =>
      productOptions.includes(current.product)
        ? current
        : { ...current, product: productOptions[0] },
    );
  }, [productOptions]);

  async function handleCaptureSubmit(event: FormEvent<HTMLFormElement>) {
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
      notes: draft.notes.trim(),
    });
    setDraft(createLeadDraft(productOptions[0] || "milk"));
  }

  async function handleDeleteLead(id: string) {
    if (!window.confirm("Delete this lead?")) return;
    await onDelete(id);
  }

  return (
    <Panel
      title="Lead queue"
      kicker={`${leads.length} captured`}
      actionIcon={RefreshCcw}
      actionText="Live from backend"
    >
      <div className="mb-16 rounded-[16px] border border-forest-ink/10 bg-bone/35 p-16 shadow-sm">
        <div className="mb-12 flex items-center justify-between gap-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-pewter">
              Quick capture
            </p>
            <h3 className="mt-3 text-[15px] font-semibold text-charcoal">Add a lead manually</h3>
          </div>
          <div className="inline-flex items-center gap-8 rounded-full bg-forest-ink/10 px-10 py-6 text-[11px] font-semibold text-forest-ink">
            <Plus className="h-[12px] w-[12px]" strokeWidth={2} />
            Admin input
          </div>
        </div>
        <form onSubmit={handleCaptureSubmit} className="grid gap-10 md:grid-cols-2 xl:grid-cols-6">
          <input
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            required
            placeholder="Customer name"
            className="admin-input xl:col-span-2"
          />
          <input
            value={draft.phone}
            onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
            required
            placeholder="Phone number"
            className="admin-input xl:col-span-2"
          />
          <input
            value={draft.area}
            onChange={(event) => setDraft((current) => ({ ...current, area: event.target.value }))}
            required
            placeholder="Area / pincode"
            className="admin-input xl:col-span-2"
          />
          <select
            value={draft.product}
            onChange={(event) =>
              setDraft((current) => ({ ...current, product: event.target.value }))
            }
            className="admin-input"
          >
            {productOptions.length ? (
              productOptions.map((product) => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))
            ) : (
              <option value="milk">Milk</option>
            )}
          </select>
          <input
            value={draft.quantity}
            onChange={(event) =>
              setDraft((current) => ({ ...current, quantity: event.target.value }))
            }
            type="number"
            min="1"
            max="50"
            placeholder="Qty"
            className="admin-input"
          />
          <select
            value={draft.requestType}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                requestType: event.target.value as LeadCaptureDraft["requestType"],
              }))
            }
            className="admin-input"
          >
            <option value="subscription">Subscription</option>
            <option value="order">One-time order</option>
          </select>
          <select
            value={draft.plan}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                plan: event.target.value as LeadCaptureDraft["plan"],
              }))
            }
            className="admin-input"
          >
            <option value="daily">Daily</option>
            <option value="alternate">Alternate</option>
            <option value="custom">Custom</option>
          </select>
          <input
            value={draft.notes}
            onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
            placeholder="Notes"
            className="admin-input xl:col-span-4"
          />
          <button
            type="submit"
            disabled={isBusy}
            className="admin-primary-button h-38 xl:col-span-2"
          >
            <Send className="h-[12px] w-[12px]" strokeWidth={1.9} />
            Capture lead
          </button>
        </form>
      </div>

      {leads.length ? (
        <>
          <div className="admin-table-wrap hidden md:block">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Requested Product</th>
                  <th>Qty</th>
                  <th>Plan</th>
                  <th>Submission Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const isPending = subscriptionById.has(lead.subscriptionId);
                  return (
                    <tr key={lead.id}>
                      <td>
                        <div className="flex items-center gap-8">
                          <span className="font-semibold text-charcoal">{lead.name}</span>
                          <StatusPill tone={isPending ? "warning" : "neutral"}>
                            {isPending ? "pending" : lead.status || "captured"}
                          </StatusPill>
                        </div>
                      </td>
                      <td>{lead.phone}</td>
                      <td>{lead.area}</td>
                      <td>{lead.productType}</td>
                      <td>{lead.quantity}</td>
                      <td>{lead.scheduleType}</td>
                      <td>{formatDateTime(lead.submittedAt)}</td>
                      <td>
                        <div className="flex items-center justify-end gap-8">
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => onActivate(lead.subscriptionId)}
                                className="admin-primary-button h-32 px-10 text-[12px]"
                              >
                                <Check className="h-[12px] w-[12px]" strokeWidth={1.9} />
                                Activate
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => onReject(lead.subscriptionId)}
                                className="admin-danger-button"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-[12px] font-semibold text-pewter">Processed</span>
                          )}
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleDeleteLead(lead.id)}
                            className="admin-danger-button h-32 px-10 text-[12px]"
                          >
                            <Trash2 className="h-[12px] w-[12px]" strokeWidth={1.9} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-10 md:hidden">
            {leads.map((lead) => {
              const isPending = subscriptionById.has(lead.subscriptionId);
              return (
                <div
                  key={lead.id}
                  className="admin-data-row border-l-[4px] border-l-amber-300 p-14"
                >
                  <div className="flex flex-wrap items-center gap-8">
                    <h3 className="font-inter text-[16px] font-semibold tracking-normal text-charcoal">
                      {lead.name}
                    </h3>
                    <StatusPill tone={isPending ? "warning" : "neutral"}>
                      {isPending ? "pending" : lead.status || "captured"}
                    </StatusPill>
                  </div>
                  <div className="mt-12 grid gap-8">
                    <Field label="Phone" value={lead.phone} />
                    <Field label="Location" value={lead.area} />
                    <Field label="Product" value={lead.productType} />
                    <Field label="Quantity" value={String(lead.quantity)} />
                    <Field label="Plan" value={lead.scheduleType} />
                    <Field label="Submitted" value={formatDateTime(lead.submittedAt)} />
                    {lead.notes ? <Field label="Notes" value={lead.notes} /> : null}
                  </div>
                  <div className="mt-14 flex items-center gap-8">
                    {isPending ? (
                      <>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => onActivate(lead.subscriptionId)}
                          className="admin-primary-button h-34 flex-1 px-11 text-[12px]"
                        >
                          <Check className="h-[12px] w-[12px]" strokeWidth={1.9} />
                          Activate
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => onReject(lead.subscriptionId)}
                          className="admin-danger-button h-34 flex-1"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="w-full rounded-[8px] border border-forest-ink/10 bg-[#eef2e3] py-6 text-center text-[13px] font-semibold text-pewter">
                        Processed
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void handleDeleteLead(lead.id)}
                    className="admin-danger-button mt-10 h-34 w-full"
                  >
                    <Trash2 className="h-[12px] w-[12px]" strokeWidth={1.9} />
                    Delete lead
                  </button>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <EmptyState title="No leads captured yet" />
      )}
    </Panel>
  );
}

function SubscriptionsPanel({
  subscriptions,
  activeCount,
  isBusy,
  onStatusChange,
  onDelete,
}: {
  subscriptions: Subscription[];
  activeCount: number;
  isBusy: boolean;
  onStatusChange: (id: string, status: SubscriptionStatus) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  async function handleDeleteSubscription(id: string) {
    if (!window.confirm("Delete this subscription?")) return;
    await onDelete(id);
  }

  return (
    <Panel
      title="Subscriptions"
      kicker={`${activeCount} active`}
      actionIcon={Milk}
      actionText="Customer plans"
    >
      {subscriptions.length ? (
        <>
          <div className="admin-table-wrap hidden md:block">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id}>
                    <td>
                      <span className="font-semibold text-charcoal">
                        {subscription.user?.name || "Customer"}
                      </span>
                    </td>
                    <td>{subscription.user?.phone || "Not set"}</td>
                    <td>{subscription.productType}</td>
                    <td>{subscription.quantity}</td>
                    <td>{subscription.scheduleType}</td>
                    <td>
                      <StatusPill tone={statusTone(subscription.status)}>
                        {subscription.status}
                      </StatusPill>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-8">
                        <select
                          value={subscription.status}
                          disabled={isBusy}
                          onChange={(event) =>
                            onStatusChange(
                              subscription.id,
                              event.target.value as SubscriptionStatus,
                            )
                          }
                          className="admin-table-select"
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="terminated">Terminated</option>
                        </select>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void handleDeleteSubscription(subscription.id)}
                          className="admin-danger-button h-32 px-10 text-[12px]"
                        >
                          <Trash2 className="h-[12px] w-[12px]" strokeWidth={1.9} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-10 md:hidden">
            {subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="admin-data-row border-l-[4px] border-l-sky-card p-14"
              >
                <div className="flex flex-wrap items-center justify-between gap-8">
                  <div>
                    <p className="text-[14px] font-semibold text-charcoal">
                      {subscription.user?.name || "Customer"}
                    </p>
                    <p className="mt-3 text-[12px] text-graphite">
                      {subscription.user?.phone || "Not set"}
                    </p>
                  </div>
                  <StatusPill tone={statusTone(subscription.status)}>
                    {subscription.status}
                  </StatusPill>
                </div>
                <div className="mt-12 grid grid-cols-2 gap-8">
                  <Field label="Product" value={subscription.productType} />
                  <Field label="Quantity" value={String(subscription.quantity)} />
                  <Field label="Schedule" value={subscription.scheduleType} />
                </div>
                <select
                  value={subscription.status}
                  disabled={isBusy}
                  onChange={(event) =>
                    onStatusChange(subscription.id, event.target.value as SubscriptionStatus)
                  }
                  className="admin-table-select mt-14 w-full"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="terminated">Terminated</option>
                </select>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => void handleDeleteSubscription(subscription.id)}
                  className="admin-danger-button mt-10 h-34 w-full"
                >
                  <Trash2 className="h-[12px] w-[12px]" strokeWidth={1.9} />
                  Delete subscription
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState title="No subscriptions found" />
      )}
    </Panel>
  );
}

const emptyProductForm: ProductFormState = {
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
  sortOrder: "0",
};

type ProductFormState = Omit<
  ProductPayload,
  | "categoryId"
  | "defaultQuantity"
  | "price"
  | "compareAtPrice"
  | "taxPercent"
  | "tags"
  | "sortOrder"
> & {
  categoryId: string;
  price: string;
  compareAtPrice: string;
  taxPercent: string;
  defaultQuantity: string;
  tags: string;
  sortOrder: string;
};

const productScheduleOptions = ["daily", "alternate", "custom", "weekly", "monthly"];
const productDisplayOrder = ["milk", "curd", "ghee", "butter", "paneer", "cheese"];

function productTagsToText(tags: unknown) {
  if (!tags) return "";
  if (Array.isArray(tags)) return tags.map(String).join(", ");
  if (typeof tags === "string") return tags;
  return JSON.stringify(tags);
}

function parseProductTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function ProductsPanel({
  products,
  categories,
  isBusy,
  onCreate,
  onUpdate,
  onDelete,
}: {
  products: Product[];
  categories: ProductCategory[];
  isBusy: boolean;
  onCreate: (payload: ProductPayload) => Promise<void>;
  onUpdate: (id: string, payload: ProductPayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState<ProductFormState>(emptyProductForm);
  const isEditing = Boolean(editingId);
  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );
  const alignedProducts = useMemo(() => {
    const byKey = new Map(
      products.map((product) => [`${product.productType || product.name}`.toLowerCase(), product]),
    );

    return productDisplayOrder.map((productType) => {
      const matched = byKey.get(productType);
      return (
        matched ?? {
          id: productType,
          name: titleCase(productType),
          productType,
          unit: productType === "milk" || productType === "curd" ? "litre" : "gram",
          isActive: false,
        }
      );
    });
  }, [products]);
  const activeProducts = products.filter((product) => product.isActive).length;
  const pricedProducts = products.filter((product) => product.price != null).length;
  const categorizedProducts = products.filter((product) => product.categoryId).length;
  const missingCommercials = products.filter(
    (product) => product.isActive && (product.price == null || !product.categoryId),
  ).length;

  function updateField<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function resetForm() {
    setEditingId("");
    setForm(emptyProductForm);
  }

  function startEdit(product: Product) {
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
      sortOrder: String(product.sortOrder || 0),
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: ProductPayload = {
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
      sortOrder: Number(form.sortOrder || 0),
    };

    if (isEditing) {
      await onUpdate(editingId, payload);
    } else {
      await onCreate(payload);
    }
    resetForm();
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `Archive ${product.name}? Existing subscriptions keep their product label.`,
    );
    if (!confirmed) return;
    await onDelete(product.id);
    if (editingId === product.id) resetForm();
  }

  return (
    <Panel
      title="Products"
      kicker={`${products.length} catalog items`}
      actionIcon={PackageCheck}
      actionText="Dynamic catalog"
    >
      <div className="admin-product-readiness-grid mb-16">
        <IntelCard
          label="Active products"
          value={activeProducts}
          detail="Visible catalog items ready for storefront and subscriptions"
        />
        <IntelCard
          label="Priced products"
          value={`${pricedProducts}/${products.length || 0}`}
          detail="Items with a sale price configured"
        />
        <IntelCard
          label="Category coverage"
          value={`${categorizedProducts}/${products.length || 0}`}
          detail="Products mapped to merchandising categories"
        />
        <RiskCard
          label="Commercial gaps"
          value={missingCommercials}
          detail="Active items missing price or category"
          tone={missingCommercials ? "warning" : "safe"}
        />
      </div>

      <div className="mb-16 grid gap-10 sm:grid-cols-2 xl:grid-cols-3">
        {alignedProducts.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between gap-12 rounded-[18px] border border-forest-ink/10 bg-white px-14 py-12 shadow-sm"
          >
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-charcoal">
                {titleCase(product.name)}
              </p>
              <p className="text-[11px] uppercase tracking-[0.14em] text-pewter">
                {product.unit} · {product.productType}
              </p>
            </div>
            <StatusPill tone={product.isActive ? "success" : "neutral"}>
              {product.isActive ? "Live" : "Draft"}
            </StatusPill>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="admin-form-card mb-16">
        <div className="mb-14 flex flex-col gap-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.18em] text-forest-ink">
              {isEditing ? "Edit product" : "New product"}
            </p>
            <h3 className="mt-2 font-inter text-[16px] font-semibold tracking-normal text-charcoal">
              {isEditing ? "Update catalog item" : "Create catalog item"}
            </h3>
          </div>
          {isEditing ? (
            <button type="button" onClick={resetForm} className="admin-secondary-button">
              <X className="h-[12px] w-[12px]" strokeWidth={1.9} />
              Cancel
            </button>
          ) : null}
        </div>

        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-6">
          <input
            required
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Product name"
            className="admin-input xl:col-span-2"
          />
          <input
            required
            value={form.code}
            onChange={(event) => updateField("code", event.target.value)}
            placeholder="Code"
            className="admin-input"
          />
          <input
            required
            value={form.productType}
            onChange={(event) => updateField("productType", event.target.value)}
            placeholder="Product type"
            className="admin-input"
          />
          <select
            value={form.categoryId}
            onChange={(event) => updateField("categoryId", event.target.value)}
            className="admin-input"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            required
            value={form.unit}
            onChange={(event) => updateField("unit", event.target.value)}
            placeholder="Unit"
            className="admin-input"
          />
          <input
            min="0"
            step="0.01"
            type="number"
            value={form.price}
            onChange={(event) => updateField("price", event.target.value)}
            placeholder="Price INR"
            className="admin-input"
          />
          <input
            min="0"
            step="0.01"
            type="number"
            value={form.compareAtPrice}
            onChange={(event) => updateField("compareAtPrice", event.target.value)}
            placeholder="Compare price"
            className="admin-input"
          />
          <input
            min="0"
            step="0.01"
            type="number"
            value={form.taxPercent}
            onChange={(event) => updateField("taxPercent", event.target.value)}
            placeholder="Tax %"
            className="admin-input"
          />
          <input
            required
            min="1"
            step="1"
            type="number"
            value={form.defaultQuantity}
            onChange={(event) => updateField("defaultQuantity", event.target.value)}
            placeholder="Default qty"
            className="admin-input"
          />
          <select
            required
            value={form.defaultSchedule}
            onChange={(event) => updateField("defaultSchedule", event.target.value)}
            className="admin-input"
          >
            {productScheduleOptions.map((schedule) => (
              <option key={schedule} value={schedule}>
                {titleCase(schedule)}
              </option>
            ))}
          </select>
          <input
            min="0"
            step="1"
            type="number"
            value={form.sortOrder}
            onChange={(event) => updateField("sortOrder", event.target.value)}
            placeholder="Sort order"
            className="admin-input"
          />
          <input
            value={form.tags}
            onChange={(event) => updateField("tags", event.target.value)}
            placeholder="Tags: organic, daily, family"
            className="admin-input xl:col-span-2"
          />
          <label className="admin-checkbox-field">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => updateField("isActive", event.target.checked)}
            />
            Active
          </label>
          <textarea
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Short product description"
            className="admin-textarea md:col-span-2 xl:col-span-5"
          />
          <button
            type="submit"
            disabled={isBusy}
            className="admin-primary-button h-38 xl:col-span-2"
          >
            {isEditing ? (
              <Pencil className="h-[12px] w-[12px]" strokeWidth={1.9} />
            ) : (
              <Plus className="h-[12px] w-[12px]" strokeWidth={1.9} />
            )}
            {isEditing ? "Save Product" : "Add Product"}
          </button>
        </div>
      </form>

      {products.length ? (
        <>
          <div className="admin-table-wrap hidden md:block">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Code</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Tax</th>
                  <th>Unit</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div>
                        <span className="font-semibold text-charcoal">{product.name}</span>
                        {product.description ? (
                          <p className="mt-3 max-w-[32ch] text-[12px] text-pewter">
                            {product.description}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td>{product.code}</td>
                    <td>
                      {product.categoryId
                        ? categoryMap.get(product.categoryId) || "Unmapped"
                        : "Unassigned"}
                    </td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>
                      {product.taxPercent == null
                        ? "Not set"
                        : `${formatNumber(Number(product.taxPercent))}%`}
                    </td>
                    <td>{product.unit}</td>
                    <td>
                      {product.defaultQuantity} / {titleCase(product.defaultSchedule)}
                    </td>
                    <td>
                      <StatusPill tone={product.isActive ? "success" : "neutral"}>
                        {product.isActive ? "Active" : "Inactive"}
                      </StatusPill>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-8">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => startEdit(product)}
                          className="admin-secondary-button h-32 px-10 text-[12px]"
                        >
                          <Pencil className="h-[12px] w-[12px]" strokeWidth={1.9} />
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void handleDelete(product)}
                          className="admin-danger-button"
                        >
                          <Trash2 className="h-[12px] w-[12px]" strokeWidth={1.9} />
                          Archive
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-10 md:hidden">
            {products.map((product) => (
              <div
                key={product.id}
                className="admin-data-row border-l-[4px] border-l-sage-card p-14"
              >
                <div className="flex flex-wrap items-start justify-between gap-8">
                  <div>
                    <p className="text-[14px] font-semibold text-charcoal">{product.name}</p>
                    <p className="mt-3 text-[12px] text-graphite">{product.code}</p>
                  </div>
                  <StatusPill tone={product.isActive ? "success" : "neutral"}>
                    {product.isActive ? "Active" : "Inactive"}
                  </StatusPill>
                </div>
                <div className="mt-12 grid grid-cols-2 gap-8">
                  <Field label="Type" value={product.productType} />
                  <Field
                    label="Category"
                    value={
                      product.categoryId
                        ? categoryMap.get(product.categoryId) || "Unmapped"
                        : "Unassigned"
                    }
                  />
                  <Field label="Price" value={formatCurrency(product.price)} />
                  <Field
                    label="Tax"
                    value={
                      product.taxPercent == null
                        ? "Not set"
                        : `${formatNumber(Number(product.taxPercent))}%`
                    }
                  />
                  <Field label="Unit" value={product.unit} />
                  <Field label="Default qty" value={String(product.defaultQuantity)} />
                  <Field label="Schedule" value={titleCase(product.defaultSchedule)} />
                </div>
                {product.description ? (
                  <p className="mt-12 text-[13px] leading-relaxed text-graphite">
                    {product.description}
                  </p>
                ) : null}
                <div className="mt-14 grid grid-cols-2 gap-8">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => startEdit(product)}
                    className="admin-secondary-button h-34 px-11 text-[12px]"
                  >
                    <Pencil className="h-[12px] w-[12px]" strokeWidth={1.9} />
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void handleDelete(product)}
                    className="admin-danger-button h-34"
                  >
                    <Trash2 className="h-[12px] w-[12px]" strokeWidth={1.9} />
                    Archive
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState title="No products found" />
      )}
    </Panel>
  );
}

function DispatchPanel({
  orders,
  pendingOrders,
  dispatchDate,
  setDispatchDate,
  isBusy,
  onRun,
  onDeliver,
}: {
  orders: DailyOrder[];
  pendingOrders: DailyOrder[];
  dispatchDate: string;
  setDispatchDate: (value: string) => void;
  isBusy: boolean;
  onRun: (event: FormEvent<HTMLFormElement>) => void;
  onDeliver: (id: string) => void;
}) {
  const displayedOrders = orders.slice(0, 30);

  return (
    <Panel
      title="Dispatch"
      kicker={`${pendingOrders.length} pending`}
      actionIcon={Truck}
      actionText="Delivery runs"
    >
      <form onSubmit={onRun} className="admin-form-card mb-16 grid gap-10 sm:grid-cols-[1fr_auto]">
        <input
          type="date"
          value={dispatchDate}
          onChange={(event) => setDispatchDate(event.target.value)}
          className="admin-input h-38"
        />
        <button type="submit" disabled={isBusy} className="admin-primary-button">
          <Send className="h-[12px] w-[12px]" strokeWidth={1.9} />
          Generate Orders
        </button>
      </form>

      {orders.length ? (
        <>
          <div className="admin-table-wrap hidden md:block">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Address</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className="font-semibold text-charcoal">
                        {order.subscription?.user?.name || "Customer"}
                      </span>
                    </td>
                    <td>
                      {order.subscription?.user?.addresses?.[0]?.streetAddress || "Address pending"}
                    </td>
                    <td>{formatDate(order.deliveryDate)}</td>
                    <td>
                      <StatusPill tone={statusTone(order.status)}>{order.status}</StatusPill>
                    </td>
                    <td>
                      <div className="flex justify-end">
                        {order.status === "pending" ? (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => onDeliver(order.id)}
                            className="admin-primary-button h-32 px-10 text-[12px]"
                          >
                            <PackageCheck className="h-[12px] w-[12px]" strokeWidth={1.9} />
                            Delivered
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-4 text-[12px] font-semibold text-forest-ink">
                            <Check className="h-[14px] w-[14px]" strokeWidth={2.2} />
                            Delivered
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-10 md:hidden">
            {displayedOrders.map((order) => (
              <div key={order.id} className="admin-data-row border-l-[4px] border-l-sky-card p-14">
                <div className="flex flex-wrap items-start justify-between gap-8">
                  <div>
                    <p className="text-[14px] font-semibold text-charcoal">
                      {order.subscription?.user?.name || "Customer"}
                    </p>
                    <p className="mt-3 text-[12px] leading-relaxed text-graphite">
                      {order.subscription?.user?.addresses?.[0]?.streetAddress || "Address pending"}
                    </p>
                  </div>
                  <StatusPill tone={statusTone(order.status)}>{order.status}</StatusPill>
                </div>
                <div className="mt-12">
                  <Field label="Delivery date" value={formatDate(order.deliveryDate)} />
                </div>
                {order.status === "pending" ? (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => onDeliver(order.id)}
                    className="admin-primary-button mt-14 h-34 w-full px-11 text-[12px]"
                  >
                    <PackageCheck className="h-[12px] w-[12px]" strokeWidth={1.9} />
                    Delivered
                  </button>
                ) : (
                  <div className="mt-14 flex items-center justify-center gap-4 text-[13px] font-semibold text-forest-ink">
                    <Check className="h-[14px] w-[14px]" strokeWidth={2.2} />
                    Delivered
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState title="No dispatch orders yet" />
      )}
    </Panel>
  );
}

function ProcurementPanel({
  farmers,
  logs,
  isBusy,
  onFarmerSubmit,
  onProcurementSubmit,
}: {
  farmers: User[];
  logs: ProcurementLog[];
  isBusy: boolean;
  onFarmerSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onProcurementSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const displayedLogs = logs.slice(0, 30);

  return (
    <Panel
      title="Procurement"
      kicker={`${logs.length} entries`}
      actionIcon={Sprout}
      actionText="Farmer supply"
    >
      <div className="mb-16 grid gap-14 xl:grid-cols-2">
        <form onSubmit={onFarmerSubmit} className="admin-form-card">
          <h3 className="mb-12 flex items-center gap-8 font-inter text-[15px] font-semibold tracking-normal">
            <UserPlus className="h-[15px] w-[15px] text-forest-ink" strokeWidth={1.8} />
            Add farmer
          </h3>
          <div className="grid gap-10 sm:grid-cols-[1fr_1fr_auto]">
            <input name="name" required placeholder="Name" className="admin-input" />
            <input name="phone" required placeholder="Phone" className="admin-input" />
            <button type="submit" disabled={isBusy} className="admin-button">
              Save
            </button>
          </div>
        </form>

        <form onSubmit={onProcurementSubmit} className="admin-form-card">
          <h3 className="mb-12 flex items-center gap-8 font-inter text-[15px] font-semibold tracking-normal">
            <Sprout className="h-[15px] w-[15px] text-forest-ink" strokeWidth={1.8} />
            Log milk collection
          </h3>
          <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-6">
            <select name="farmerId" required className="admin-input xl:col-span-2">
              <option value="">Farmer</option>
              {farmers.map((farmer) => (
                <option key={farmer.id} value={farmer.id}>
                  {farmer.name}
                </option>
              ))}
            </select>
            <input name="collectionDate" type="date" className="admin-input xl:col-span-2" />
            <input
              name="quantityLiters"
              type="number"
              min="1"
              step="0.1"
              required
              placeholder="Liters"
              className="admin-input"
            />
            <input
              name="fatPercentage"
              type="number"
              min="1"
              step="0.1"
              required
              placeholder="Fat"
              className="admin-input"
            />
            <input
              name="snfPercentage"
              type="number"
              min="1"
              step="0.1"
              required
              placeholder="SNF"
              className="admin-input"
            />
            <button type="submit" disabled={isBusy} className="admin-button xl:col-span-2">
              Save Entry
            </button>
          </div>
        </form>
      </div>

      {logs.length ? (
        <>
          <div className="admin-table-wrap hidden md:block">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Farmer</th>
                  <th>Collection Date</th>
                  <th>Quantity</th>
                  <th>Fat %</th>
                  <th>SNF %</th>
                  <th>Payout</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {displayedLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="font-semibold text-charcoal">
                        {log.farmer?.name || "Farmer"}
                      </span>
                    </td>
                    <td>{formatDate(log.collectionDate)}</td>
                    <td>{formatNumber(Number(log.quantityLiters))} L</td>
                    <td>{log.fatPercentage}%</td>
                    <td>{log.snfPercentage}%</td>
                    <td>INR {formatNumber(Number(log.totalPayout))}</td>
                    <td>
                      <StatusPill tone="success">Settled</StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-10 md:hidden">
            {displayedLogs.map((log) => (
              <div key={log.id} className="admin-data-row border-l-[4px] border-l-sage-card p-14">
                <div className="flex flex-wrap items-center justify-between gap-8">
                  <div>
                    <p className="text-[14px] font-semibold text-charcoal">
                      {log.farmer?.name || "Farmer"}
                    </p>
                    <p className="mt-3 text-[12px] text-graphite">
                      {formatDate(log.collectionDate)}
                    </p>
                  </div>
                  <StatusPill tone="success">Settled</StatusPill>
                </div>
                <div className="mt-12 grid grid-cols-2 gap-8">
                  <Field label="Quantity" value={`${formatNumber(Number(log.quantityLiters))} L`} />
                  <Field label="Fat" value={`${log.fatPercentage}%`} />
                  <Field label="SNF" value={`${log.snfPercentage}%`} />
                  <Field label="Payout" value={`INR ${formatNumber(Number(log.totalPayout))}`} />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState title="No procurement entries yet" />
      )}
    </Panel>
  );
}

function NotificationsPanel({
  notifications,
  isBusy,
  onRetry,
}: {
  notifications: NotificationRecord[];
  isBusy: boolean;
  onRetry: (notificationId: string) => void;
}) {
  const [activeStatus, setActiveStatus] = useState<"pending" | "sent" | "failed">("pending");
  const notificationGroups = {
    pending: notifications.filter((notification) => isPendingNotification(notification.status)),
    sent: notifications.filter((notification) => isSentNotification(notification.status)),
    failed: notifications.filter((notification) => isFailedNotification(notification.status)),
  };
  const activeNotifications = notificationGroups[activeStatus];

  return (
    <Panel
      title="Notification Center"
      kicker={`${notifications.length} records`}
      actionIcon={Bell}
      actionText="Outbound queue"
    >
      <div className="mb-16 flex flex-wrap gap-8">
        {(["pending", "sent", "failed"] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setActiveStatus(status)}
            className={`admin-secondary-button h-34 px-12 text-[12px] ${
              activeStatus === status ? "bg-forest-ink text-pure-white" : ""
            }`}
          >
            {titleCase(status)}
            <span className="rounded-[999px] bg-pure-white/25 px-7 py-2">
              {notificationGroups[status].length}
            </span>
          </button>
        ))}
      </div>

      {activeNotifications.length ? (
        <div className="grid gap-12 lg:grid-cols-2">
          {activeNotifications.map((notification) => {
            const statusTone = isFailedNotification(notification.status)
              ? "danger"
              : isPendingNotification(notification.status)
                ? "warning"
                : "success";
            return (
              <article
                key={notification.id}
                className="rounded-[8px] border border-forest-ink/10 bg-pure-white p-16 shadow-sm"
              >
                <div className="flex items-start justify-between gap-10">
                  <div>
                    <p className="text-[14px] font-semibold text-charcoal">
                      {getNotificationMessage(notification)}
                    </p>
                    <p className="mt-4 text-[12px] text-graphite">
                      {getNotificationRecipient(notification)}
                    </p>
                  </div>
                  <StatusPill tone={statusTone}>{notification.status}</StatusPill>
                </div>
                <div className="mt-14 grid gap-10 sm:grid-cols-2">
                  <Field
                    label="Channel"
                    value={titleCase(notification.channel || notification.type)}
                  />
                  <Field label="Time" value={formatDateTime(getNotificationTime(notification))} />
                </div>
                {isFailedNotification(notification.status) ? (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => onRetry(notification.id)}
                    className="admin-primary-button mt-14 h-34 px-11 text-[12px]"
                  >
                    <RefreshCcw className="h-[12px] w-[12px]" strokeWidth={1.9} />
                    Retry
                  </button>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title={`No ${activeStatus} notifications`} />
      )}
    </Panel>
  );
}

function Panel({
  title,
  kicker,
  actionIcon: Icon,
  actionText,
  children,
}: {
  title: string;
  kicker: string;
  actionIcon: LucideIcon;
  actionText: string;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-panel p-16 sm:p-[22px] xl:p-24">
      <div className="mb-16 flex flex-col gap-10 border-b border-forest-ink/10 pb-14 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-caption font-semibold uppercase tracking-[0.18em] text-forest-ink">
            {kicker}
          </p>
          <h2 className="mt-3 font-inter text-[18px] font-semibold tracking-normal text-charcoal">
            {title}
          </h2>
        </div>
        <div className="inline-flex w-fit items-center gap-8 rounded-[8px] border border-forest-ink/10 bg-[#eef2e3] px-12 py-9 text-[13px] font-medium text-forest-ink">
          <Icon className="h-[12px] w-[12px]" strokeWidth={1.9} />
          {actionText}
        </div>
      </div>
      {children}
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  detail: string;
  tone: "orders" | "revenue" | "sales" | "pending" | "delivered" | "users";
}) {
  const toneClass = {
    orders: "from-sky-card/70 to-pure-white text-forest-ink bg-sky-card/80 border-sky-card",
    revenue: "from-sage-card to-pure-white text-forest-ink bg-sage-card border-moss",
    sales: "from-vivid-lime/35 to-pure-white text-forest-ink bg-vivid-lime/45 border-vivid-lime",
    pending: "from-amber-50 to-pure-white text-amber-700 bg-amber-100 border-amber-200",
    delivered: "from-moss/35 to-pure-white text-forest-ink bg-moss/40 border-moss",
    users: "from-bone to-pure-white text-forest-ink bg-bone border-moss",
  }[tone];

  return (
    <div className={`crm-stat-card rounded-[8px] border bg-gradient-to-br p-16 ${toneClass}`}>
      <div className="mb-14 flex items-center justify-between gap-12">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-charcoal/62">
          {label}
        </p>
        <span className="crm-stat-icon inline-flex h-30 w-30 items-center justify-center bg-pure-white/80 shadow-sm">
          <Icon className="h-[14px] w-[14px]" strokeWidth={1.8} />
        </span>
      </div>
      <p className="font-reckless text-[34px] font-medium leading-none tracking-normal text-charcoal">
        {value}
      </p>
      <p className="mt-5 inline-flex rounded-[999px] bg-pure-white/70 px-9 py-4 text-[12px] font-medium text-graphite">
        {detail}
      </p>
    </div>
  );
}

function Field({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-pewter">{label}</p>
      <p className="mt-2 text-[13px] text-graphite">{value}</p>
    </div>
  );
}

function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "success" | "warning" | "danger" | "neutral";
}) {
  return (
    <span className={`admin-status-badge admin-status-${tone}`} data-tone={tone}>
      {children}
    </span>
  );
}

function Alert({ children, tone }: { children: React.ReactNode; tone: "success" | "error" }) {
  return (
    <div
      className={`mb-14 rounded-[8px] border px-14 py-12 text-[14px] ${
        tone === "success"
          ? "border-forest-ink/15 bg-vivid-lime/25 text-forest-ink"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {children}
    </div>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="rounded-[8px] border border-dashed border-forest-ink/20 bg-pure-white p-24 text-center text-[14px] text-graphite">
      {title}
    </div>
  );
}

function getInventoryRows(products: Product[], subscriptions: Subscription[]): InventoryRow[] {
  const reservedByProduct = new Map<string, number>();
  for (const subscription of subscriptions) {
    if (!["pending", "active", "paused"].includes(subscription.status)) continue;
    const productType = String(subscription.productType || "").toLowerCase();
    reservedByProduct.set(
      productType,
      (reservedByProduct.get(productType) || 0) + Number(subscription.quantity || 0),
    );
  }

  return products.map((product) => {
    const productType = String(product.productType || product.name || "").toLowerCase();
    const hasStockData =
      product.currentStock != null ||
      product.availableStock != null ||
      product.reservedStock != null ||
      Boolean(product.stockStatus);
    const reservedStock = Number(product.reservedStock ?? reservedByProduct.get(productType) ?? 0);
    const currentStock = Number(product.currentStock ?? (hasStockData ? 0 : 100));
    const availableStock = Number(
      product.availableStock ?? Math.max(currentStock - reservedStock, 0),
    );
    const reorderLevel = Number(
      product.reorderLevel ?? Math.max(Number(product.defaultQuantity || 1) * 10, 10),
    );
    const normalizedStatus = String(product.stockStatus || "").toLowerCase();
    const status: InventoryStatus =
      normalizedStatus.includes("out") || (hasStockData && availableStock <= 0)
        ? "out"
        : normalizedStatus.includes("low") || (hasStockData && availableStock <= reorderLevel)
          ? "low"
          : "healthy";

    return {
      id: product.id,
      name: product.name,
      unit: product.unit || "unit",
      currentStock,
      reservedStock,
      availableStock,
      reorderLevel,
      status,
    };
  });
}

function inventoryStatusMeta(status: InventoryStatus): {
  label: string;
  tone: "success" | "warning" | "danger";
} {
  if (status === "out") return { label: "Out of Stock", tone: "danger" };
  if (status === "low") return { label: "Low Stock", tone: "warning" };
  return { label: "Healthy", tone: "success" };
}

function isPendingNotification(status: string) {
  return ["pending", "queued", "retrying", "scheduled"].includes(status.toLowerCase());
}

function isSentNotification(status: string) {
  return ["sent", "delivered", "success"].includes(status.toLowerCase());
}

function isFailedNotification(status: string) {
  return ["failed", "error", "bounced"].includes(status.toLowerCase());
}

function getNotificationDetail(notification: NotificationRecord, key: string) {
  const value = notification.details?.[key] ?? notification.metadata?.[key];
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function getNotificationMessage(notification: NotificationRecord) {
  return (
    notification.message ||
    notification.body ||
    notification.title ||
    getNotificationDetail(notification, "message") ||
    getNotificationDetail(notification, "body") ||
    `${titleCase(notification.type)} notification`
  );
}

function getNotificationRecipient(notification: NotificationRecord) {
  return (
    notification.recipient ||
    notification.phone ||
    getNotificationDetail(notification, "recipient") ||
    getNotificationDetail(notification, "phone") ||
    getNotificationDetail(notification, "to") ||
    "Recipient unavailable"
  );
}

function getNotificationTime(notification: NotificationRecord) {
  return notification.sentAt || notification.failedAt || notification.createdAt;
}

function buildCrmMetrics(data: AdminDashboardData): CrmMetrics {
  const days = getTrailingDays(8);
  const salesGrowth = days.map((day) => ({
    ...day,
    leads: 0,
    salesUnits: 0,
  }));
  const growthByKey = new Map(salesGrowth.map((point) => [point.key, point]));

  for (const lead of data.leads) {
    const key = toDateKey(lead.submittedAt);
    const point = key ? growthByKey.get(key) : undefined;
    if (point) point.leads += 1;
  }

  for (const subscription of data.subscriptions) {
    const key = toDateKey(subscription.createdAt || subscription.startDate);
    const point = key ? growthByKey.get(key) : undefined;
    if (point && subscription.status !== "terminated") {
      point.salesUnits += Number(subscription.quantity || 0);
    }
  }

  if (Array.isArray(data.commerceOrders)) {
    for (const order of data.commerceOrders) {
      if (order.status === "cancelled" || order.status === "refunded") continue;
      const key = toDateKey(order.createdAt);
      const point = key ? growthByKey.get(key) : undefined;
      if (point) {
        let quantity = 0;
        if (Array.isArray(order.items)) {
          quantity = order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        }
        point.salesUnits += quantity;
      }
    }
  }

  const statusOrder: SubscriptionStatus[] = ["pending", "active", "paused", "terminated"];
  const pipeline = statusOrder.map((status) => ({
    stage: titleCase(status),
    count: data.subscriptions.filter((subscription) => subscription.status === status).length,
    color: PIPELINE_COLORS[status],
  }));

  const productMap = new Map<string, number>();
  for (const subscription of data.subscriptions) {
    if (subscription.status === "terminated") continue;
    const product = titleCase(subscription.productType || "Milk");
    productMap.set(product, (productMap.get(product) || 0) + Number(subscription.quantity || 0));
  }

  if (Array.isArray(data.commerceOrders)) {
    for (const order of data.commerceOrders) {
      if (order.status === "cancelled" || order.status === "refunded") continue;
      if (Array.isArray(order.items)) {
        for (const item of order.items) {
          const product = titleCase(item.name || "Milk");
          productMap.set(product, (productMap.get(product) || 0) + Number(item.quantity || 0));
        }
      }
    }
  }

  const productMix = Array.from(productMap.entries())
    .map(([product, units]) => ({ product, units }))
    .sort((a, b) => b.units - a.units);

  const activeUnits = data.subscriptions
    .filter((subscription) => subscription.status === "active")
    .reduce((total, subscription) => total + Number(subscription.quantity || 0), 0);
  const pendingUnits = data.subscriptions
    .filter((subscription) => subscription.status === "pending")
    .reduce((total, subscription) => total + Number(subscription.quantity || 0), 0);
  const totalPipeline = data.subscriptions.filter(
    (subscription) => subscription.status !== "terminated",
  ).length;
  const conversionRate =
    totalPipeline === 0
      ? 0
      : Math.round(
          (data.subscriptions.filter((subscription) => subscription.status === "active").length /
            totalPipeline) *
            100,
        );

  const currentWindow = salesGrowth.slice(-4).reduce((total, point) => total + point.salesUnits, 0);
  const previousWindow = salesGrowth
    .slice(0, -4)
    .reduce((total, point) => total + point.salesUnits, 0);
  const salesGrowthPercent =
    previousWindow === 0
      ? currentWindow > 0
        ? 100
        : 0
      : Math.round(((currentWindow - previousWindow) / previousWindow) * 100);

  return {
    salesGrowth,
    pipeline,
    productMix: productMix.length ? productMix : [{ product: "No demand", units: 1 }],
    conversionRate,
    pendingUnits,
    activeUnits,
    salesGrowthPercent,
  };
}

function getTrailingDays(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (count - index - 1));
    return {
      key: toDateKey(date) || "",
      label: new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
      }).format(date),
    };
  });
}

function toDateKey(value?: string | Date | null) {
  if (!value) return "";
  if (value instanceof Date) {
    const yyyy = value.getFullYear();
    const mm = String(value.getMonth() + 1).padStart(2, "0");
    const dd = String(value.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function statusTone(status: string): "success" | "warning" | "danger" | "neutral" {
  if (["active", "accepted", "assigned", "out_for_delivery", "delivered"].includes(status)) {
    return "success";
  }
  if (["pending", "processing", "paused"].includes(status)) return "warning";
  if (["terminated", "failed", "rejected", "cancelled", "refunded"].includes(status)) {
    return "danger";
  }
  return "neutral";
}

function titleCase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function formatDate(value?: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value?: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatTimeOnly(value?: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function formatCurrency(value?: number | string | null) {
  if (value == null) return "Not priced";
  return `INR ${formatNumber(Number(value))}`;
}
