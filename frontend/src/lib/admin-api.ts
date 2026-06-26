import type { LeadSubmission } from "./leads";

export type UserRole =
  | "consumer"
  | "rider"
  | "farmer"
  | "super_admin"
  | "admin"
  | "manager"
  | "customer_support"
  | "inventory_manager"
  | "delivery_manager";
export type SubscriptionStatus = "pending" | "active" | "paused" | "terminated";
export type OrderStatus =
  | "pending"
  | "processing"
  | "accepted"
  | "assigned"
  | "out_for_delivery"
  | "delivered"
  | "failed"
  | "rejected"
  | "cancelled"
  | "refunded";

export type Address = {
  id: string;
  userId: string;
  streetAddress: string;
  pincode?: string;
  isActive?: boolean;
};

export type User = {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  createdAt?: string;
  addresses?: Address[];
  subscriptions?: Subscription[];
};

export type Lead = {
  id: string;
  userId: string;
  subscriptionId: string;
  name: string;
  phone: string;
  area: string;
  productType: string;
  quantity: number;
  scheduleType: string;
  notes?: string;
  source?: string;
  status?: string;
  submittedAt: string;
};

export type Subscription = {
  id: string;
  userId: string;
  user?: User;
  productType: string;
  quantity: number;
  scheduleType: string;
  status: SubscriptionStatus;
  startDate?: string;
  pauseUntil?: string | null;
  createdAt?: string;
  dailyOrders?: DailyOrder[];
};

export type DailyOrder = {
  id: string;
  subscriptionId: string;
  subscription?: Subscription;
  deliveryDate: string;
  quantity: number;
  status: OrderStatus;
  riderId?: string | null;
  deliveredAt?: string | null;
  proofPhotoUrl?: string | null;
};

export type CommerceOrder = {
  id: string;
  orderNumber: string;
  userId?: string | null;
  user?: Pick<User, "id" | "name" | "phone"> & { email?: string | null };
  status: OrderStatus | string;
  subtotal?: number | string | null;
  taxAmount?: number | string | null;
  shippingFee?: number | string | null;
  discount?: number | string | null;
  total?: number | string | null;
  currency?: string | null;
  items?: Array<{
    id: string;
    name: string;
    quantity: number | string;
    unitPrice?: number | string | null;
    total?: number | string | null;
  }>;
  createdAt?: string;
  updatedAt?: string;
};

export type ProcurementLog = {
  id: string;
  farmerId: string;
  farmer?: User | null;
  collectionDate: string;
  quantityLiters: number;
  fatPercentage: number;
  snfPercentage: number;
  ratePerLiter: number;
  totalPayout: number;
};

export type Product = {
  id: string;
  code: string;
  name: string;
  productType: string;
  categoryId?: string | null;
  unit: string;
  price?: number | null;
  compareAtPrice?: number | null;
  taxPercent?: number | null;
  defaultQuantity: number;
  defaultSchedule: string;
  description?: string | null;
  tags?: unknown;
  isActive: boolean;
  active?: boolean;
  sortOrder?: number;
  currentStock?: number | null;
  reservedStock?: number | null;
  availableStock?: number | null;
  reorderLevel?: number | null;
  stockStatus?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type InventoryItem = {
  id: string;
  productId?: string | null;
  variantId?: string | null;
  sku?: string | null;
  currentStock?: number | string | null;
  reservedStock?: number | string | null;
  reorderLevel?: number | string | null;
  unit?: string | null;
  warehouseName?: string | null;
  status?: string | null;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  product?: Product | null;
  variant?: { id: string; name?: string | null; unit?: string | null } | null;
};

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductCategoryPayload = {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
};

export type ProductPayload = {
  code: string;
  name: string;
  productType: string;
  categoryId?: string | null;
  unit: string;
  price?: number | null;
  compareAtPrice?: number | null;
  taxPercent?: number | null;
  defaultQuantity: number;
  defaultSchedule: string;
  description?: string;
  tags?: unknown;
  isActive: boolean;
  sortOrder?: number;
};

export type InventoryItemPayload = {
  productId: string;
  variantId?: string | null;
  currentStock: number;
  reservedStock?: number;
  reorderLevel?: number;
  unit?: string;
  sku?: string;
  warehouseName?: string;
};

export type StockAdjustmentPayload = {
  movementType: "in" | "out" | "adjustment" | "reserved" | "released";
  quantity: number;
  reason?: string;
  referenceType?: string;
  referenceId?: string;
};

export type NotificationRecord = {
  id: string;
  type: string;
  phone?: string | null;
  channel?: string | null;
  title?: string | null;
  body?: string | null;
  recipient?: string | null;
  message?: string | null;
  sentAt?: string | null;
  failedAt?: string | null;
  details?: Record<string, unknown>;
  metadata?: Record<string, unknown> | null;
  status: string;
  createdAt: string;
};

export type AuditLog = {
  id: string;
  actorId?: string | null;
  action: string;
  module: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

export type LoginHistory = {
  id: string;
  userId?: string | null;
  role?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  status: string;
  createdAt: string;
};

export type AppSetting = {
  id: string;
  key: string;
  group: string;
  label: string;
  value: unknown;
  isSecret: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AppSettingPayload = {
  group: string;
  label: string;
  value: unknown;
  isSecret: boolean;
};

export type RolePermission = {
  id: string;
  role: UserRole;
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminSummary = {
  users: {
    total: number;
    byRole: Record<UserRole, number>;
  };
  subscriptions: {
    total: number;
    byStatus: Record<SubscriptionStatus, number>;
  };
  orders: {
    total: number;
    byStatus: Record<OrderStatus, number>;
  };
  procurement: {
    totalLogs: number;
    totalVolumeLiters: number;
    totalPayoutAmount: number;
  };
  notifications: {
    total: number;
    latest: NotificationRecord[];
  };
  dashboard?: {
    totalOrders: number;
    totalRevenue: number;
    todaySales: number;
    pendingOrders: number;
    deliveredOrders: number;
    activeUsers: number;
    activeProducts: number;
    openSupportTickets: number;
  };
  leads?: {
    total: number;
    latest: Lead[];
    bySource: Record<string, number>;
  };
};

export type AdminDashboardData = {
  summary: AdminSummary;
  users: User[];
  leads: Lead[];
  subscriptions: Subscription[];
  orders: DailyOrder[];
  commerceOrders: CommerceOrder[];
  farmers: User[];
  procurementLogs: ProcurementLog[];
  products: Product[];
  categories: ProductCategory[];
  notifications: NotificationRecord[];
  auditLogs: AuditLog[];
  loginHistory: LoginHistory[];
  settings: AppSetting[];
  rolePermissions: RolePermission[];
};

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const API_PATH_PREFIX = "/api/v1";
const ADMIN_CSRF_STORAGE_KEY = "hasumane-admin-csrf";
const ADMIN_ACCESS_STORAGE_KEY = "hasumane-admin-access-token";

export function getAdminApiBaseUrl() {
  return API_BASE_URL;
}

function getStoredCsrfToken() {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(ADMIN_CSRF_STORAGE_KEY) || "";
}

function setStoredCsrfToken(token: string) {
  if (typeof window === "undefined") return;
  if (token) {
    window.sessionStorage.setItem(ADMIN_CSRF_STORAGE_KEY, token);
  } else {
    window.sessionStorage.removeItem(ADMIN_CSRF_STORAGE_KEY);
  }
}

function getStoredAccessToken() {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(ADMIN_ACCESS_STORAGE_KEY) || "";
}

function setStoredAccessToken(token: string) {
  if (typeof window === "undefined") return;
  if (token) {
    window.sessionStorage.setItem(ADMIN_ACCESS_STORAGE_KEY, token);
  } else {
    window.sessionStorage.removeItem(ADMIN_ACCESS_STORAGE_KEY);
  }
}

export function getStoredAdminAccessToken() {
  return getStoredAccessToken();
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json") ? response.json() : response.text();
}

function apiPath(path: string) {
  let normalized = path;
  if (normalized.startsWith("/api/v1/")) {
    normalized = normalized.slice(7); // strip '/api/v1'
  } else if (normalized.startsWith("/api/")) {
    normalized = normalized.slice(4); // strip '/api'
  }
  return `${API_PATH_PREFIX}${normalized.startsWith("/") ? normalized : `/${normalized}`}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function unwrapApiResponse<T>(data: unknown) {
  if (isRecord(data) && "success" in data && "data" in data) {
    return data.data as T;
  }
  return data as T;
}

function toArray<T>(value: unknown, key?: string): T[] {
  if (Array.isArray(value)) return value as T[];
  if (isRecord(value)) {
    if (key && Array.isArray(value[key])) return value[key] as T[];
    if (Array.isArray(value.data)) return value.data as T[];
  }
  return [];
}

function normalizeRole(role: unknown): UserRole {
  const value = String(role || "").toLowerCase();
  const map: Record<string, UserRole> = {
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
    delivery_manager: "delivery_manager",
  };
  return map[value] || "consumer";
}

function normalizeUser(user: User): User {
  return {
    ...user,
    role: normalizeRole(user.role),
  };
}

function normalizeSubscription(subscription: Subscription): Subscription {
  return {
    ...subscription,
    user: subscription.user ? normalizeUser(subscription.user) : subscription.user,
  };
}

function normalizeRolePermission(permission: RolePermission): RolePermission {
  return {
    ...permission,
    role: normalizeRole(permission.role),
  };
}

async function request<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${apiPath(path)}`, {
      ...init,
      headers,
      credentials: "include",
    });
  } catch {
    throw new Error(`Backend is not reachable at ${API_BASE_URL}. Start the backend and refresh.`);
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    const message =
      isRecord(data) && "message" in data
        ? String(data.message)
        : isRecord(data) && "error" in data
          ? String(data.error)
          : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return unwrapApiResponse<T>(data);
}

async function adminRequest<T>(token: string, path: string, init: RequestInit = {}) {
  const method = String(init.method || "GET").toUpperCase();
  const headers = new Headers(init.headers);
  const accessToken = token || getStoredAccessToken();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrfToken = getStoredCsrfToken();
    if (csrfToken) headers.set("x-csrf-token", csrfToken);
  }
  return request<T>(path, {
    ...init,
    headers,
  });
}

async function optionalAdminRequest<T>(token: string, path: string, fallback: T) {
  try {
    return await adminRequest<T>(token, path);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/route not found|not found|status 404/i.test(message)) {
      return fallback;
    }
    throw error;
  }
}

export async function createAdminSession(password: string, role?: UserRole) {
  const session = await request<{
    success: boolean;
    authenticated: boolean;
    accessToken: string;
    csrfToken: string;
    expiresAt: string;
    role?: UserRole;
  }>("/api/admin/session", {
    method: "POST",
    body: JSON.stringify({ password, role }),
  });
  setStoredCsrfToken(session.csrfToken);
  setStoredAccessToken(session.accessToken);
  return session;
}

export async function verifyAdminSession() {
  try {
    await adminRequest<{ authenticated: boolean }>(getStoredAccessToken(), "/api/admin/session");
    return true;
  } catch {
    setStoredCsrfToken("");
    setStoredAccessToken("");
    return false;
  }
}

export async function destroyAdminSession(token = getStoredAccessToken()) {
  try {
    await adminRequest(token, "/api/admin/session", {
      method: "DELETE",
    });
  } finally {
    setStoredCsrfToken("");
    setStoredAccessToken("");
  }
}

export async function fetchAdminDashboard(token: string): Promise<AdminDashboardData> {
  const [
    summary,
    users,
    leads,
    subscriptions,
    orders,
    farmers,
    procurementLogs,
    products,
    notifications,
  ] = await Promise.all([
    adminRequest<{ summary: AdminSummary }>(token, "/api/admin/summary"),
    adminRequest<unknown>(token, "/api/users"),
    adminRequest<{ leads: Lead[] }>(token, "/api/admin/leads"),
    adminRequest<{ subscriptions: Subscription[] }>(token, "/api/subscriptions"),
    adminRequest<{ orders: DailyOrder[] }>(token, "/api/dispatch/orders"),
    adminRequest<{ farmers: User[] }>(token, "/api/farmers"),
    adminRequest<{ logs: ProcurementLog[] }>(token, "/api/procurement/logs"),
    adminRequest<unknown>(token, "/api/admin/products?limit=200"),
    adminRequest<{ notifications: NotificationRecord[] }>(token, "/api/notifications"),
  ]);

  const [commerceOrders, categories, auditLogs, loginHistory, settings, rolePermissions] =
    await Promise.all([
      optionalAdminRequest<unknown>(token, "/api/admin/orders?limit=200", []),
      optionalAdminRequest<unknown>(token, "/api/categories?limit=200", []),
      optionalAdminRequest<{ auditLogs: AuditLog[] }>(token, "/api/security/audit-logs?limit=80", {
        auditLogs: [],
      }),
      optionalAdminRequest<{ logins: LoginHistory[] }>(
        token,
        "/api/security/login-history?limit=80",
        { logins: [] },
      ),
      optionalAdminRequest<{ settings: AppSetting[] }>(token, "/api/settings?limit=200", {
        settings: [],
      }),
      optionalAdminRequest<{ permissions: RolePermission[] }>(
        token,
        "/api/roles/permissions?limit=500",
        { permissions: [] },
      ),
    ]);

  return {
    summary: summary.summary,
    users: toArray<User>(users, "users").map(normalizeUser),
    leads: leads.leads,
    subscriptions: subscriptions.subscriptions.map(normalizeSubscription),
    orders: orders.orders,
    commerceOrders: toArray<CommerceOrder>(commerceOrders, "orders"),
    farmers: farmers.farmers.map(normalizeUser),
    procurementLogs: procurementLogs.logs,
    products: toArray<Product>(products, "products"),
    categories: toArray<ProductCategory>(categories, "categories"),
    notifications: notifications.notifications,
    auditLogs: auditLogs.auditLogs,
    loginHistory: loginHistory.logins,
    settings: settings.settings,
    rolePermissions: rolePermissions.permissions.map(normalizeRolePermission),
  };
}

function unwrapProduct(value: Product | { product: Product }) {
  if (isRecord(value) && "product" in value && isRecord(value.product)) {
    return value.product as Product;
  }
  return value as Product;
}

export async function createProduct(token: string, payload: ProductPayload) {
  const product = await adminRequest<Product | { product: Product }>(token, "/api/admin/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return unwrapProduct(product);
}

export async function updateProduct(
  token: string,
  productId: string,
  payload: Partial<ProductPayload>,
) {
  const product = await adminRequest<Product | { product: Product }>(
    token,
    `/api/admin/products/${productId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
  return unwrapProduct(product);
}

export async function deleteProduct(token: string, productId: string) {
  const product = await adminRequest<Product | { product: Product }>(
    token,
    `/api/admin/products/${productId}`,
    {
      method: "DELETE",
    },
  );
  return unwrapProduct(product);
}

export async function captureLead(token: string, payload: LeadSubmission) {
  return adminRequest<{
    lead: {
      id: string;
      submittedAt: string;
      userId: string;
      subscriptionId: string;
      name: string;
      phone: string;
      area: string;
      productType: string;
      quantity: number;
      scheduleType: string;
      notes?: string;
      source?: string;
      status?: string;
    };
  }>(token, "/api/leads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteLead(token: string, leadId: string) {
  return adminRequest<{ lead: unknown }>(token, `/api/admin/leads/${leadId}`, {
    method: "DELETE",
  });
}

export async function createCategory(token: string, payload: ProductCategoryPayload) {
  return adminRequest<{ category: ProductCategory }>(token, "/api/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCategory(
  token: string,
  categoryId: string,
  payload: Partial<ProductCategoryPayload>,
) {
  return adminRequest<{ category: ProductCategory }>(token, `/api/categories/${categoryId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteCategory(token: string, categoryId: string) {
  return adminRequest<{ category: ProductCategory }>(token, `/api/categories/${categoryId}`, {
    method: "DELETE",
  });
}

export async function fetchInventoryItems(token: string) {
  const response = await adminRequest<{ items: InventoryItem[] }>(token, "/api/v1/inventory");
  return response.items;
}

export async function createInventoryItem(token: string, payload: InventoryItemPayload) {
  return adminRequest<{ item: InventoryItem }>(token, "/api/v1/inventory", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adjustInventoryItem(
  token: string,
  inventoryItemId: string,
  payload: StockAdjustmentPayload,
) {
  return adminRequest<{ item: InventoryItem }>(
    token,
    `/api/v1/inventory/${inventoryItemId}/adjust`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteInventoryItem(token: string, inventoryItemId: string) {
  return adminRequest<{ item: InventoryItem }>(token, `/api/v1/inventory/${inventoryItemId}`, {
    method: "DELETE",
  });
}

export async function saveSetting(token: string, key: string, payload: AppSettingPayload) {
  return adminRequest<{ setting: AppSetting }>(token, `/api/settings/${encodeURIComponent(key)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateSubscriptionStatus(
  token: string,
  subscriptionId: string,
  status: SubscriptionStatus,
) {
  return adminRequest<{ subscription: Subscription }>(
    token,
    `/api/subscriptions/${subscriptionId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
}

export async function deleteSubscription(token: string, subscriptionId: string) {
  return adminRequest<{ subscription: unknown }>(token, `/api/subscriptions/${subscriptionId}`, {
    method: "DELETE",
  });
}

export async function runDispatch(token: string, date?: string) {
  return adminRequest<{ message: string; orders: DailyOrder[] }>(token, "/api/dispatch/run", {
    method: "POST",
    body: JSON.stringify(date ? { date } : {}),
  });
}

export async function createFarmer(token: string, payload: { name: string; phone: string }) {
  return adminRequest<{ farmer: User }>(token, "/api/farmers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createProcurementLog(
  token: string,
  payload: {
    farmerId: string;
    collectionDate?: string;
    quantityLiters: number;
    fatPercentage: number;
    snfPercentage: number;
  },
) {
  return adminRequest<{ log: ProcurementLog }>(token, "/api/procurement/logs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function markOrderDelivered(token: string, orderId: string) {
  return adminRequest<{ order: DailyOrder }>(token, `/api/dispatch/orders/${orderId}/deliver`, {
    method: "PATCH",
    body: JSON.stringify({}),
  });
}

export async function updateCommerceOrderStatus(token: string, orderId: string, status: string) {
  return adminRequest<{ success: boolean; message: string }>(token, `/api/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function retryNotification(token: string, notificationId: string) {
  return adminRequest<{ notification: NotificationRecord }>(
    token,
    `/api/notification-center/${notificationId}/retry`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );
}
