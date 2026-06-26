import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { createHash } from "node:crypto";
import { of, throwError } from "rxjs";
import { Role } from "../common/constants/roles.js";
import { CsrfGuard } from "../common/guards/csrf.guard.js";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard.js";
import { RolesGuard } from "../common/guards/roles.guard.js";
import { LoggingInterceptor } from "../common/interceptors/logging.interceptor.js";
import { ResponseInterceptor } from "../common/interceptors/response.interceptor.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { AnalyticsService } from "./analytics/analytics.service.js";
import { AuditLogService } from "./audit/audit-log.service.js";
import { AuthService } from "./auth/auth.service.js";
import { CatalogService } from "./catalog/catalog.service.js";
import { InventoryService } from "./inventory/inventory.service.js";
import { LoggingService } from "./logging/logging.service.js";
import { MetricsService } from "./monitoring/metrics.service.js";
import { NotificationService } from "./notifications/notification.service.js";
import { OperationsService } from "./operations/operations.service.js";
import { OrdersService } from "./orders/orders.service.js";
import { RbacService } from "./rbac/rbac.service.js";
import { UsersService } from "./users/users.service.js";

process.env.LOG_LEVEL = "silent";

type MockPrisma = Record<string, any>;

const buildPrisma = () => {
  const prisma: MockPrisma = {
    $transaction: jest.fn((input: unknown) => {
      if (typeof input === "function") return input(prisma);
      if (Array.isArray(input)) return Promise.all(input);
      return input;
    }),
    user: {},
    userSession: {},
    emailVerificationToken: {},
    loginHistory: {},
    passwordResetToken: {},
    product: {},
    productCategory: {},
    productVariant: {},
    order: {},
    orderStatusHistory: {},
    cart: {},
    cartItem: {},
    subscription: {},
    dailyOrder: {},
    lead: {},
    notification: {},
    inventoryItem: {},
    stockMovement: {},
    auditLog: {},
    systemLog: {},
    rolePermission: {},
  };
  return prisma;
};

const requestContext = (role: Role = Role.ADMIN) =>
  ({
    user: { id: "actor-1", email: "actor@hasumane.test", role, sessionId: "session-1" },
    context: { requestId: "req-1", ipAddress: "127.0.0.1", userAgent: "jest" },
    cookies: { csrf_token: "csrf" },
    header: jest.fn((name: string) => (name.toLowerCase() === "x-csrf-token" ? "csrf" : undefined)),
    method: "POST",
    originalUrl: "/api/v1/test",
    route: { path: "/api/v1/test" },
  }) as any;

const executionContext = (request: any, response: any = {}) =>
  ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  }) as any;

describe("AuthService", () => {
  let prisma: MockPrisma;
  let service: AuthService;
  let auditLogService: { record: jest.Mock };

  beforeEach(async () => {
    prisma = buildPrisma();
    prisma.user.findFirst = jest.fn();
    prisma.user.create = jest.fn();
    prisma.user.update = jest.fn();
    prisma.userSession.create = jest.fn();
    prisma.userSession.update = jest.fn();
    prisma.emailVerificationToken.create = jest.fn();
    prisma.loginHistory.create = jest.fn();
    auditLogService = { record: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValueOnce("access").mockResolvedValueOnce("refresh"),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => 4),
            getOrThrow: jest.fn((key: string) =>
              key.includes("Ttl") ? "15m" : "test-secret",
            ),
          },
        },
        { provide: AuditLogService, useValue: auditLogService },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
  });

  it("rejects duplicate registration", async () => {
    prisma.user.findFirst.mockResolvedValue({ id: "existing" });

    await expect(
      service.register(
        {
          name: "Test User",
          email: "test@example.com",
          phone: "9999999999",
          password: "Secret123!",
          role: Role.CUSTOMER,
        },
        requestContext(),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("prevents non-super-admins from creating admin users", async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    await expect(
      service.register(
        {
          name: "Admin User",
          email: "admin@example.com",
          phone: "9999999998",
          password: "Secret123!",
          role: Role.ADMIN,
        },
        requestContext(Role.MANAGER),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("registers a customer and records an audit event", async () => {
    const user = {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      phone: "9999999999",
      role: Role.CUSTOMER,
      passwordHash: "hash",
    };
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(user);
    prisma.emailVerificationToken.create.mockResolvedValue({ id: "token-1" });

    const result = await service.register(
      {
        name: " Test User ",
        email: "TEST@example.com",
        phone: "9999999999",
        password: "Secret123!",
        role: Role.CUSTOMER,
      },
      requestContext(Role.SUPER_ADMIN),
    );

    expect(result.user).not.toHaveProperty("passwordHash");
    expect(auditLogService.record).toHaveBeenCalledWith(expect.objectContaining({ action: "register" }));
  });

  it("logs failed login attempts and rejects invalid credentials", async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.loginHistory.create.mockResolvedValue({ id: "login-1" });

    await expect(
      service.login({ email: "missing@example.com", password: "bad" }, requestContext()),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.loginHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "failed" }) }),
    );
  });
});

describe("UsersService", () => {
  let prisma: MockPrisma;
  let service: UsersService;
  let auditLogService: { record: jest.Mock };

  beforeEach(async () => {
    prisma = buildPrisma();
    prisma.user.findFirst = jest.fn();
    prisma.user.findMany = jest.fn().mockResolvedValue([{ id: "user-1" }]);
    prisma.user.count = jest.fn().mockResolvedValue(1);
    prisma.user.create = jest.fn();
    prisma.user.update = jest.fn();
    auditLogService = { record: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: { get: jest.fn(() => 4) } },
        { provide: AuditLogService, useValue: auditLogService },
      ],
    }).compile();
    service = moduleRef.get(UsersService);
  });

  it("returns paginated users", async () => {
    const result = await service.findAll({ page: 1, limit: 10, sortOrder: "desc" });

    expect(result.meta.total).toBe(1);
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it("rejects duplicate user creation", async () => {
    prisma.user.findFirst.mockResolvedValue({ id: "existing" });

    await expect(
      service.create({
        name: "Test",
        email: "test@example.com",
        phone: "9999999999",
        role: Role.CUSTOMER,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("audits role changes", async () => {
    const existing = {
      id: "user-1",
      name: "Test",
      email: "test@example.com",
      phone: "9999999999",
      role: Role.CUSTOMER,
      isBlocked: false,
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prisma.user.findFirst.mockResolvedValue(existing);
    prisma.user.update.mockResolvedValue({ ...existing, role: Role.ADMIN });

    await service.update("user-1", { role: Role.ADMIN }, "actor-1");

    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: "role_change", entityId: "user-1" }),
    );
  });
});

describe("CatalogService", () => {
  let prisma: MockPrisma;
  let service: CatalogService;
  let auditLogService: { record: jest.Mock };

  beforeEach(async () => {
    prisma = buildPrisma();
    prisma.product.findFirst = jest.fn();
    prisma.product.create = jest.fn();
    prisma.product.update = jest.fn();
    auditLogService = { record: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CatalogService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLogService },
      ],
    }).compile();
    service = moduleRef.get(CatalogService);
  });

  it("creates products with audit metadata", async () => {
    prisma.product.create.mockResolvedValue({ id: "product-1", name: "Milk" });

    await service.createProduct(
      {
        name: "Milk",
        code: "MILK",
        productType: "milk",
        unit: "litre",
        defaultQuantity: 1,
        defaultSchedule: "daily",
        isActive: true,
      },
      "actor-1",
    );

    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: "create", module: "products", entityId: "product-1" }),
    );
  });

  it("throws when a product cannot be found", async () => {
    prisma.product.findFirst.mockResolvedValue(null);

    await expect(service.getProduct("missing")).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe("OrdersService", () => {
  let prisma: MockPrisma;
  let service: OrdersService;

  beforeEach(async () => {
    prisma = buildPrisma();
    prisma.product.findFirst = jest.fn();
    prisma.productVariant.findFirst = jest.fn();
    prisma.order.create = jest.fn();
    prisma.order.findFirst = jest.fn();
    prisma.order.update = jest.fn();
    prisma.orderStatusHistory.create = jest.fn();
    prisma.auditLog.create = jest.fn();
    prisma.cart.updateMany = jest.fn();

    const moduleRef = await Test.createTestingModule({
      providers: [OrdersService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(OrdersService);
  });

  it("creates an order from explicit items and audits it", async () => {
    prisma.product.findFirst.mockResolvedValue({
      id: "product-1",
      code: "MILK",
      name: "Milk",
      price: 50,
      taxPercent: 5,
    });
    prisma.productVariant.findFirst.mockResolvedValue(null);
    prisma.order.create.mockResolvedValue({ id: "order-1", userId: "user-1", items: [] });
    prisma.auditLog.create.mockResolvedValue({ id: "audit-1" });

    const result = await service.createOrder("user-1", {
      items: [{ productId: "product-1", quantity: 2 }],
    });

    expect(result.id).toBe("order-1");
    expect(prisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ total: 105 }),
      }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });

  it("prevents access to another user's order", async () => {
    prisma.order.findFirst.mockResolvedValue({ id: "order-1", userId: "other" });

    await expect(service.getOrder("user-1", "order-1")).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rejects cancellation for delivered orders", async () => {
    prisma.order.findFirst.mockResolvedValue({ id: "order-1", userId: "user-1", status: "delivered" });

    await expect(service.cancelOrder("user-1", "order-1")).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe("OperationsService subscription lifecycle", () => {
  let prisma: MockPrisma;
  let service: OperationsService;

  beforeEach(async () => {
    prisma = buildPrisma();
    prisma.subscription.create = jest.fn();
    prisma.subscription.findFirst = jest.fn();
    prisma.subscription.update = jest.fn();
    prisma.auditLog.create = jest.fn().mockResolvedValue({ id: "audit-1" });

    const moduleRef = await Test.createTestingModule({
      providers: [OperationsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(OperationsService);
  });

  it("creates subscriptions and writes an audit record", async () => {
    prisma.subscription.create.mockResolvedValue({ id: "subscription-1", status: "active" });

    const result = await service.createSubscription({ userId: "user-1", quantity: 2 }, "actor-1");

    expect(result.subscription.id).toBe("subscription-1");
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ module: "subscriptions" }) }),
    );
  });

  it("fails status updates for missing subscriptions", async () => {
    prisma.subscription.findFirst.mockResolvedValue(null);

    await expect(service.updateSubscriptionStatus("missing", "paused", "actor-1")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("pauses and resumes subscriptions", async () => {
    prisma.subscription.update
      .mockResolvedValueOnce({ id: "subscription-1", status: "paused" })
      .mockResolvedValueOnce({ id: "subscription-1", status: "active" });

    await service.pauseSubscription("subscription-1", "2030-01-01", "actor-1");
    await service.resumeSubscription("subscription-1", "actor-1");

    expect(prisma.subscription.update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ data: expect.objectContaining({ status: "paused" }) }),
    );
    expect(prisma.subscription.update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ data: expect.objectContaining({ status: "active" }) }),
    );
  });
});

describe("InventoryService", () => {
  let prisma: MockPrisma;
  let service: InventoryService;

  beforeEach(async () => {
    prisma = buildPrisma();
    prisma.inventoryItem.findMany = jest.fn();
    prisma.inventoryItem.findFirst = jest.fn();
    prisma.inventoryItem.update = jest.fn();
    prisma.stockMovement.findMany = jest.fn();
    prisma.stockMovement.create = jest.fn();
    prisma.auditLog.create = jest.fn();

    const moduleRef = await Test.createTestingModule({
      providers: [InventoryService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(InventoryService);
  });

  it("returns low-stock products", async () => {
    prisma.inventoryItem.findMany.mockResolvedValue([
      { id: "low", currentStock: 2, reorderLevel: 5 },
      { id: "ok", currentStock: 20, reorderLevel: 5 },
    ]);

    const result = await service.lowStock();

    expect(result.items).toEqual([{ id: "low", currentStock: 2, reorderLevel: 5 }]);
  });

  it("adjusts stock and writes movement history", async () => {
    prisma.inventoryItem.findFirst.mockResolvedValue({ id: "item-1", currentStock: 10, reservedStock: 0, reorderLevel: 5 });
    prisma.stockMovement.create.mockResolvedValue({ id: "movement-1" });
    prisma.inventoryItem.update.mockResolvedValue({ id: "item-1", currentStock: 7, reservedStock: 0, status: "in_stock" });
    prisma.auditLog.create.mockResolvedValue({ id: "audit-1" });

    const result = await service.adjust("item-1", { movementType: "out", quantity: 3 }, "actor-1");

    expect(result.item.currentStock).toBe(7);
    expect(prisma.stockMovement.create).toHaveBeenCalled();
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });

  it("lists inventory, out-of-stock items and movement history", async () => {
    prisma.inventoryItem.findMany
      .mockResolvedValueOnce([{ id: "item-1" }])
      .mockResolvedValueOnce([{ id: "item-2", currentStock: 0 }]);
    prisma.stockMovement.findMany.mockResolvedValue([{ id: "movement-1" }]);

    await expect(service.list()).resolves.toEqual({ items: [{ id: "item-1" }] });
    await expect(service.outOfStock()).resolves.toEqual({ items: [{ id: "item-2", currentStock: 0 }] });
    await expect(service.movements("item-1")).resolves.toEqual({ movements: [{ id: "movement-1" }] });
  });

  it("rejects stock adjustment when inventory item is missing", async () => {
    prisma.inventoryItem.findFirst.mockResolvedValue(null);

    await expect(service.adjust("missing", { movementType: "in", quantity: 1 }, "actor-1")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("handles adjustment, reserve and release movement branches", async () => {
    prisma.inventoryItem.findFirst
      .mockResolvedValueOnce({ id: "item-1", currentStock: 10, reservedStock: 0, reorderLevel: 5 })
      .mockResolvedValueOnce({ id: "item-1", currentStock: 4, reservedStock: 1, reorderLevel: 5 })
      .mockResolvedValueOnce({ id: "item-1", currentStock: 4, reservedStock: 6, reorderLevel: 5 });
    prisma.stockMovement.create.mockResolvedValue({ id: "movement-1" });
    prisma.inventoryItem.update
      .mockResolvedValueOnce({ id: "item-1", currentStock: 4, reservedStock: 0, status: "low_stock" })
      .mockResolvedValueOnce({ id: "item-1", currentStock: 4, reservedStock: 6, status: "low_stock" })
      .mockResolvedValueOnce({ id: "item-1", currentStock: 4, reservedStock: 2, status: "low_stock" });
    prisma.auditLog.create.mockResolvedValue({ id: "audit-1" });

    await service.adjust("item-1", { movementType: "adjustment", quantity: 4 }, "actor-1");
    await service.adjust("item-1", { movementType: "reserved", quantity: 5 }, "actor-1");
    await service.adjust("item-1", { movementType: "released", quantity: 4 }, "actor-1");

    expect(prisma.inventoryItem.update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ data: expect.objectContaining({ currentStock: 4, status: "low_stock" }) }),
    );
    expect(prisma.inventoryItem.update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ data: expect.objectContaining({ reservedStock: 6 }) }),
    );
    expect(prisma.inventoryItem.update).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ data: expect.objectContaining({ reservedStock: 2 }) }),
    );
  });
});

describe("NotificationService", () => {
  let prisma: MockPrisma;
  let service: NotificationService;
  let auditLogService: { record: jest.Mock };

  beforeEach(async () => {
    prisma = buildPrisma();
    prisma.notification.findMany = jest.fn();
    prisma.notification.findFirst = jest.fn();
    prisma.notification.update = jest.fn();
    auditLogService = { record: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLogService },
      ],
    }).compile();
    service = moduleRef.get(NotificationService);
  });

  it("lists notifications by status", async () => {
    prisma.notification.findMany.mockResolvedValue([{ id: "notification-1", status: "failed" }]);

    const result = await service.byStatus("failed");

    expect(result.notifications).toHaveLength(1);
    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { deletedAt: null, status: "failed" } }),
    );
  });

  it("retries failed notifications and records audit logs", async () => {
    prisma.notification.findFirst.mockResolvedValue({ id: "notification-1", status: "failed", metadata: { retryCount: 1 } });
    prisma.notification.update.mockResolvedValue({ id: "notification-1", status: "simulated" });

    await service.retry("notification-1", "actor-1");

    expect(prisma.notification.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "simulated" }) }),
    );
    expect(auditLogService.record).toHaveBeenCalled();
  });

  it("rejects retry for already sent notifications", async () => {
    prisma.notification.findFirst.mockResolvedValue({ id: "notification-1", status: "sent" });

    await expect(service.retry("notification-1", "actor-1")).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects retry for missing notifications", async () => {
    prisma.notification.findFirst.mockResolvedValue(null);

    await expect(service.retry("missing", "actor-1")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("queues retries when WhatsApp provider is configured", async () => {
    const originalKey = process.env.WATI_API_KEY;
    process.env.WATI_API_KEY = "configured";
    prisma.notification.findFirst.mockResolvedValue({ id: "notification-1", status: "queued", metadata: null });
    prisma.notification.update.mockResolvedValue({ id: "notification-1", status: "queued" });

    await service.retry("notification-1", "actor-1");

    expect(prisma.notification.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "queued" }) }),
    );
    if (originalKey === undefined) delete process.env.WATI_API_KEY;
    else process.env.WATI_API_KEY = originalKey;
  });
});

describe("AuditLogService", () => {
  let prisma: MockPrisma;
  let service: AuditLogService;

  beforeEach(async () => {
    prisma = buildPrisma();
    prisma.auditLog.create = jest.fn();
    prisma.auditLog.findMany = jest.fn().mockResolvedValue([{ id: "audit-1" }]);
    prisma.auditLog.count = jest.fn().mockResolvedValue(1);
    prisma.auditLog.groupBy = jest.fn().mockResolvedValue([{ userId: "user-1", _count: { _all: 3 } }]);

    const moduleRef = await Test.createTestingModule({
      providers: [AuditLogService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(AuditLogService);
  });

  it("records enriched audit events", async () => {
    prisma.auditLog.create.mockResolvedValue({ id: "audit-1" });

    await service.record({
      action: "create",
      module: "orders",
      entityType: "order",
      entityId: "order-1",
      newValue: { total: 100 },
      request: requestContext(),
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "actor-1", ipAddress: "127.0.0.1" }),
      }),
    );
  });

  it("combines user, search, action and date filters", async () => {
    await service.list({
      page: 1,
      limit: 10,
      sortOrder: "desc",
      userId: "user-1",
      search: "role",
      action: "role_change",
      from: "2026-01-01",
      to: "2026-01-31",
    });

    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          action: "role_change",
          AND: expect.any(Array),
          createdAt: expect.objectContaining({ gte: expect.any(Date), lte: expect.any(Date) }),
        }),
      }),
    );
  });

  it("returns dashboard summaries", async () => {
    const result = await service.dashboard({ page: 1, limit: 10, sortOrder: "desc" });

    expect(result.recentActivities).toHaveLength(1);
    expect(result.userActivitySummary).toEqual([{ userId: "user-1", eventCount: 3 }]);
    expect(result.securityEvents).toHaveLength(1);
  });

  it("handles system audit events without optional payloads", async () => {
    prisma.auditLog.create.mockResolvedValue({ id: "audit-1" });

    await service.record({ action: "run", module: "dispatch" });

    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: "run", userId: undefined }) }),
    );
  });
});

describe("LoggingService", () => {
  let prisma: MockPrisma;
  let service: LoggingService;

  beforeEach(async () => {
    process.env.NODE_ENV = "production";
    prisma = buildPrisma();
    prisma.systemLog.create = jest.fn();
    prisma.systemLog.findMany = jest.fn().mockResolvedValue([{ id: "log-1" }]);
    prisma.systemLog.count = jest.fn().mockResolvedValue(1);

    const moduleRef = await Test.createTestingModule({
      providers: [LoggingService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(LoggingService);
  });

  it("persists structured API logs", async () => {
    prisma.systemLog.create.mockResolvedValue({ id: "log-1" });

    await service.log({
      level: "info",
      category: "api",
      module: "orders",
      message: "request complete",
      requestId: "req-1",
      statusCode: 200,
      durationMs: 12,
    });

    expect(prisma.systemLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ level: "info", module: "orders" }) }),
    );
  });

  it("lists searchable logs with pagination", async () => {
    const result = await service.list({
      page: 1,
      limit: 10,
      sortOrder: "desc",
      severity: "error",
      module: "auth",
      search: "failed",
    });

    expect(result.meta.total).toBe(1);
    expect(prisma.systemLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ level: "error", module: "auth" }) }),
    );
  });

  it("does not fail request flow when log persistence fails", async () => {
    prisma.systemLog.create.mockRejectedValue(new Error("database unavailable"));

    await expect(
      service.log({
        level: "error",
        category: "error",
        module: "auth",
        message: "failed",
        errorStack: "stack",
      }),
    ).resolves.toBeUndefined();
  });

  it("lists logs without optional filters", async () => {
    const result = await service.list({ page: 1, limit: 10, sortOrder: "desc" });

    expect(result.data).toEqual([{ id: "log-1" }]);
    expect(prisma.systemLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {}, orderBy: { createdAt: "desc" } }),
    );
  });

  it("supports category and date filters and exposes the pino logger", async () => {
    const logger = service.getLogger();
    const result = await service.list({
      page: 1,
      limit: 10,
      sortOrder: "desc",
      category: "security",
      from: "2026-01-01",
      to: "2026-01-02",
    });

    expect(logger).toBeDefined();
    expect(result.meta.total).toBe(1);
    expect(prisma.systemLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: "security",
          createdAt: expect.objectContaining({ gte: expect.any(Date), lte: expect.any(Date) }),
        }),
      }),
    );
  });

  it("configures pretty transport outside production", async () => {
    process.env.NODE_ENV = "development";
    const moduleRef = await Test.createTestingModule({
      providers: [LoggingService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    expect(moduleRef.get(LoggingService).getLogger()).toBeDefined();
  });
});

describe("AnalyticsService", () => {
  let prisma: MockPrisma;
  let service: AnalyticsService;

  beforeEach(async () => {
    prisma = buildPrisma();
    prisma.user.count = jest.fn().mockResolvedValueOnce(10).mockResolvedValueOnce(4);
    prisma.order.count = jest
      .fn()
      .mockResolvedValueOnce(20)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(6);
    prisma.subscription.count = jest.fn().mockResolvedValueOnce(5).mockResolvedValueOnce(3).mockResolvedValueOnce(1);
    prisma.lead.count = jest.fn().mockResolvedValueOnce(7).mockResolvedValueOnce(2);
    prisma.lead.groupBy = jest.fn().mockResolvedValue([{ source: "website", _count: { _all: 7 } }]);
    prisma.inventoryItem.findMany = jest.fn().mockResolvedValue([
      { id: "low", currentStock: 2, reservedStock: 1, reorderLevel: 5 },
      { id: "ok", currentStock: 20, reservedStock: 4, reorderLevel: 5 },
    ]);
    prisma.notification.findMany = jest.fn().mockResolvedValue([
      { id: "sent", status: "sent" },
      { id: "failed", status: "failed" },
    ]);
    prisma.order.groupBy = jest.fn().mockResolvedValue([{ status: "pending", _count: { _all: 2 }, _sum: { total: 100 } }]);
    prisma.order.aggregate = jest.fn().mockResolvedValue({ _sum: { subtotal: 90, taxAmount: 5, shippingFee: 5, discount: 0, total: 100 } });
    prisma.order.findMany = jest.fn().mockResolvedValue([{ id: "order-1" }]);

    const moduleRef = await Test.createTestingModule({
      providers: [AnalyticsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(AnalyticsService);
  });

  it("calculates SaaS dashboard overview metrics", async () => {
    const result = await service.overview({ period: "weekly", format: "json" });

    expect(result.totalUsers).toBe(10);
    expect(result.activeSubscribers).toBe(5);
    expect(result.lowStockProducts).toBe(1);
    expect(result.notificationSuccessRate).toBe(50);
  });

  it("returns order analytics and exports CSV/PDF", async () => {
    const result = await service.orders({ period: "daily", format: "json" });
    const csv = service.toCsv(result);
    const pdf = service.toPdf(result, "Orders");

    expect(result.revenue.total).toBe(100);
    expect(csv).toContain("key");
    expect(pdf.toString("utf8")).toContain("%PDF-1.4");
  });

  it("returns subscription, lead, inventory and notification reports", async () => {
    prisma.subscription.groupBy = jest.fn().mockResolvedValue([{ status: "active", _count: { _all: 5 } }]);

    await expect(service.subscriptions({ period: "monthly", format: "json" })).resolves.toEqual(
      expect.objectContaining({ activeSubscribers: 5, byStatus: [{ status: "active", _count: { _all: 5 } }] }),
    );
    await expect(service.leads({ period: "monthly", format: "json" })).resolves.toEqual(
      expect.objectContaining({ newLeads: 7, bySource: [{ source: "website", _count: { _all: 7 } }] }),
    );
    await expect(service.inventory()).resolves.toEqual(expect.objectContaining({ lowStockProducts: 1 }));
    await expect(service.notifications({ period: "monthly", format: "json" })).resolves.toEqual(
      expect.objectContaining({ notificationSuccessRate: 50 }),
    );
  });

  it("supports custom date ranges", async () => {
    const result = await service.overview({
      period: "custom",
      from: "2026-01-01T00:00:00.000Z",
      to: "2026-01-31T23:59:59.000Z",
      format: "json",
    });

    expect(result.range.from.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(result.range.to.toISOString()).toBe("2026-01-31T23:59:59.000Z");
  });

  it("handles zero-data analytics branches", async () => {
    const zeroPrisma = buildPrisma();
    zeroPrisma.user.count = jest.fn().mockResolvedValue(0);
    zeroPrisma.order.count = jest.fn().mockResolvedValue(0);
    zeroPrisma.subscription.count = jest.fn().mockResolvedValue(0);
    zeroPrisma.lead.count = jest.fn().mockResolvedValue(0);
    zeroPrisma.inventoryItem.findMany = jest.fn().mockResolvedValue([]);
    zeroPrisma.notification.findMany = jest.fn().mockResolvedValue([]);
    const zeroService = new AnalyticsService(zeroPrisma as PrismaService);

    const result = await zeroService.overview({ period: "monthly", format: "json" });
    const csv = zeroService.toCsv([]);

    expect(result.subscriptionGrowth).toBe(0);
    expect(result.leadConversionRate).toBe(0);
    expect(result.inventoryUtilization).toBe(0);
    expect(result.notificationSuccessRate).toBe(0);
    expect(csv).toBe("\n\n");
  });
});

describe("MetricsService", () => {
  it("emits Prometheus metrics for requests, errors and system resources", async () => {
    const prisma = buildPrisma();
    prisma.user.count = jest.fn().mockResolvedValue(2);
    prisma.inventoryItem.count = jest.fn().mockResolvedValue(1);
    prisma.getQueryCount = jest.fn(() => 12);
    const service = new MetricsService(prisma as PrismaService);

    service.recordHttp({ method: "GET", route: "/api/v1/orders", statusCode: 200, durationMs: 20 });
    service.recordHttp({ method: "GET", route: "/api/v1/orders", statusCode: 500, durationMs: 30 });
    const metrics = await service.prometheus();

    expect(metrics).toContain("hasumane_api_requests_total 2");
    expect(metrics).toContain("hasumane_api_errors_total 1");
    expect(metrics).toContain("hasumane_api_active_users 2");
    expect(metrics).toContain("hasumane_api_database_queries_total 12");
  });

  it("emits zero request metrics before traffic arrives", async () => {
    const prisma = buildPrisma();
    prisma.user.count = jest.fn().mockResolvedValue(0);
    prisma.inventoryItem.count = jest.fn().mockResolvedValue(0);
    prisma.getQueryCount = jest.fn(() => 0);
    const service = new MetricsService(prisma as PrismaService);

    const metrics = await service.prometheus();

    expect(metrics).toContain("hasumane_api_requests_total 0");
    expect(metrics).toContain("hasumane_api_request_duration_average_ms 0.00");
  });
});

describe("RbacService", () => {
  it("audits permission changes", async () => {
    const prisma = buildPrisma();
    prisma.rolePermission.findUnique = jest.fn().mockResolvedValue({ id: "perm-1", canView: true });
    prisma.rolePermission.upsert = jest.fn().mockResolvedValue({ id: "perm-1", canRead: false });
    const auditLogService = { record: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        RbacService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLogService },
      ],
    }).compile();

    await moduleRef.get(RbacService).upsertPermission(
      {
        role: Role.ADMIN,
        module: "orders",
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canExport: false,
      },
      "actor-1",
    );

    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: "permission_change", module: "rbac" }),
    );
  });

  it("lists permissions and audit history", async () => {
    const prisma = buildPrisma();
    prisma.rolePermission.findMany = jest.fn().mockResolvedValue([{ id: "perm-1" }]);
    prisma.auditLog.findMany = jest.fn().mockResolvedValue([{ id: "audit-1" }]);
    const moduleRef = await Test.createTestingModule({
      providers: [
        RbacService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: { record: jest.fn() } },
      ],
    }).compile();
    const service = moduleRef.get(RbacService);

    await expect(service.listPermissions()).resolves.toEqual([{ id: "perm-1" }]);
    await expect(service.auditLogs(1000)).resolves.toEqual([{ id: "audit-1" }]);
    await expect(service.auditLogs()).resolves.toEqual([{ id: "audit-1" }]);
    expect(prisma.auditLog.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ take: 100 }),
    );
  });
});

describe("Security guards and interceptors", () => {
  it("allows higher roles and rejects insufficient roles", () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValueOnce(false).mockReturnValueOnce([Role.ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(executionContext(requestContext(Role.SUPER_ADMIN)))).toBe(true);

    const rejectingReflector = {
      getAllAndOverride: jest.fn().mockReturnValueOnce(false).mockReturnValueOnce([Role.ADMIN]),
    } as unknown as Reflector;
    const rejectingGuard = new RolesGuard(rejectingReflector);
    expect(() => rejectingGuard.canActivate(executionContext(requestContext(Role.CUSTOMER)))).toThrow(
      ForbiddenException,
    );
  });

  it("allows public and unprotected routes without role checks", () => {
    const publicReflector = { getAllAndOverride: jest.fn().mockReturnValueOnce(true) } as unknown as Reflector;
    expect(new RolesGuard(publicReflector).canActivate(executionContext(requestContext(Role.CUSTOMER)))).toBe(true);

    const unprotectedReflector = {
      getAllAndOverride: jest.fn().mockReturnValueOnce(false).mockReturnValueOnce(undefined),
    } as unknown as Reflector;
    expect(new RolesGuard(unprotectedReflector).canActivate(executionContext(requestContext(Role.CUSTOMER)))).toBe(true);
  });

  it("enforces CSRF headers for unsafe methods", async () => {
    const config = { get: jest.fn(() => "x-csrf-token") } as unknown as ConfigService;
    const reflector = { getAllAndOverride: jest.fn(() => false) } as unknown as Reflector;
    const prisma = { userSession: { findFirst: jest.fn() } } as unknown as PrismaService;
    const guard = new CsrfGuard(config, reflector, prisma);
    await expect(guard.canActivate(executionContext(requestContext()))).resolves.toBe(true);

    const request = { ...requestContext(), cookies: {}, header: jest.fn(() => undefined) };
    await expect(guard.canActivate(executionContext(request))).rejects.toThrow(ForbiddenException);
  });

  it("allows CSRF header validation against the authenticated session", async () => {
    const config = { get: jest.fn(() => "x-csrf-token") } as unknown as ConfigService;
    const reflector = { getAllAndOverride: jest.fn(() => false) } as unknown as Reflector;
    const csrfTokenHash = createHash("sha256").update("csrf").digest("hex");
    const prisma = {
      userSession: {
        findFirst: jest.fn().mockResolvedValue({ csrfTokenHash }),
      },
    } as unknown as PrismaService;
    const request = { ...requestContext(), cookies: {} };

    await expect(new CsrfGuard(config, reflector, prisma).canActivate(executionContext(request))).resolves.toBe(true);
    expect((prisma as any).userSession.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: "session-1",
          userId: "actor-1",
          revokedAt: null,
          deletedAt: null,
        }),
        select: { csrfTokenHash: true },
      }),
    );
  });

  it("allows public and safe CSRF requests", async () => {
    const config = { get: jest.fn(() => "x-csrf-token") } as unknown as ConfigService;
    const prisma = { userSession: { findFirst: jest.fn() } } as unknown as PrismaService;
    const publicReflector = { getAllAndOverride: jest.fn(() => true) } as unknown as Reflector;
    await expect(new CsrfGuard(config, publicReflector, prisma).canActivate(executionContext(requestContext()))).resolves.toBe(true);

    const safeReflector = { getAllAndOverride: jest.fn(() => false) } as unknown as Reflector;
    const request = { ...requestContext(), method: "GET", cookies: {}, header: jest.fn(() => undefined) };
    await expect(new CsrfGuard(config, safeReflector, prisma).canActivate(executionContext(request))).resolves.toBe(true);
  });

  it("validates JWT access tokens and rejects refresh tokens", async () => {
    const reflector = { getAllAndOverride: jest.fn(() => false) } as unknown as Reflector;
    const jwt = {
      verifyAsync: jest.fn().mockResolvedValueOnce({
        sub: "user-1",
        email: "user@example.com",
        role: Role.ADMIN,
        sessionId: "session-1",
        type: "access",
      }),
    } as unknown as JwtService;
    const config = { getOrThrow: jest.fn(() => "secret") } as unknown as ConfigService;
    const guard = new JwtAuthGuard(reflector, jwt, config);
    const request = { ...requestContext(), header: jest.fn(() => "Bearer token") };

    await expect(guard.canActivate(executionContext(request))).resolves.toBe(true);
    expect(request.user.id).toBe("user-1");

    const badJwt = {
      verifyAsync: jest.fn().mockResolvedValue({ type: "refresh" }),
    } as unknown as JwtService;
    await expect(new JwtAuthGuard(reflector, badJwt, config).canActivate(executionContext(request))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it("allows public JWT routes and rejects missing tokens", async () => {
    const publicReflector = { getAllAndOverride: jest.fn(() => true) } as unknown as Reflector;
    const jwt = { verifyAsync: jest.fn() } as unknown as JwtService;
    const config = { getOrThrow: jest.fn(() => "secret") } as unknown as ConfigService;
    await expect(new JwtAuthGuard(publicReflector, jwt, config).canActivate(executionContext(requestContext()))).resolves.toBe(
      true,
    );

    const protectedReflector = { getAllAndOverride: jest.fn(() => false) } as unknown as Reflector;
    const request = { ...requestContext(), cookies: {}, header: jest.fn(() => undefined) };
    await expect(new JwtAuthGuard(protectedReflector, jwt, config).canActivate(executionContext(request))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it("wraps standard API responses", (done) => {
    const response = { getHeader: jest.fn(() => "application/json") };
    const request = { originalUrl: "/api/v1/orders" };
    const interceptor = new ResponseInterceptor();

    interceptor.intercept(executionContext(request, response), { handle: () => of({ id: "order-1" }) }).subscribe((payload) => {
      expect(payload).toEqual({
        success: true,
        message: "Request completed successfully.",
        data: { id: "order-1" },
      });
      done();
    });
  });

  it("preserves already wrapped API responses", (done) => {
    const response = { getHeader: jest.fn(() => "application/json") };
    const request = { originalUrl: "/api/v1/orders" };
    const interceptor = new ResponseInterceptor();
    const wrapped = { success: true, message: "ok", data: { id: "order-1" } };

    interceptor.intercept(executionContext(request, response), { handle: () => of(wrapped) }).subscribe((payload) => {
      expect(payload).toBe(wrapped);
      done();
    });
  });

  it("records successful requests in metrics and structured logs", (done) => {
    const metrics = { recordHttp: jest.fn() };
    const logging = { log: jest.fn().mockResolvedValue(undefined) };
    const interceptor = new LoggingInterceptor(metrics as any, logging as any);
    const request = { ...requestContext(), originalUrl: "/", route: undefined };
    const response = { statusCode: 200 };

    interceptor
      .intercept(executionContext(request, response), {
        handle: () => of({ ok: true }),
      })
      .subscribe({
        complete: () => {
          expect(metrics.recordHttp).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 200, route: "/" }));
          expect(logging.log).toHaveBeenCalledWith(
            expect.objectContaining({ level: "info", category: "api", module: "root" }),
          );
          done();
        },
      });
  });

  it("records warning logs for handled 4xx responses", (done) => {
    const metrics = { recordHttp: jest.fn() };
    const logging = { log: jest.fn().mockResolvedValue(undefined) };
    const interceptor = new LoggingInterceptor(metrics as any, logging as any);
    const response = { statusCode: 404 };

    interceptor
      .intercept(executionContext(requestContext(), response), {
        handle: () => of({ missing: true }),
      })
      .subscribe({
        complete: () => {
          expect(logging.log).toHaveBeenCalledWith(expect.objectContaining({ level: "warn" }));
          done();
        },
      });
  });

  it("normalizes thrown non-Error values and unset error status codes", (done) => {
    const metrics = { recordHttp: jest.fn() };
    const logging = { log: jest.fn().mockResolvedValue(undefined) };
    const interceptor = new LoggingInterceptor(metrics as any, logging as any);
    const response = { statusCode: 200 };

    interceptor
      .intercept(executionContext(requestContext(), response), {
        handle: () => throwError(() => "boom"),
      })
      .subscribe({
        error: () => {
          expect(metrics.recordHttp).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
          expect(logging.log).toHaveBeenCalledWith(expect.objectContaining({ errorStack: "boom" }));
          done();
        },
      });
  });

  it("skips API wrapping for metrics and export responses", (done) => {
    const response = { getHeader: jest.fn(() => "text/csv") };
    const request = { originalUrl: "/api/v1/analytics/orders" };
    const interceptor = new ResponseInterceptor();

    interceptor.intercept(executionContext(request, response), { handle: () => of("csv") }).subscribe((payload) => {
      expect(payload).toBe("csv");
      done();
    });
  });

  it("records request metrics and structured errors", (done) => {
    const metrics = { recordHttp: jest.fn() };
    const logging = { log: jest.fn().mockResolvedValue(undefined) };
    const interceptor = new LoggingInterceptor(metrics as any, logging as any);
    const request = requestContext();
    const response = { statusCode: 500 };

    interceptor
      .intercept(executionContext(request, response), {
        handle: () => throwError(() => new Error("boom")),
      })
      .subscribe({
        error: () => {
          expect(metrics.recordHttp).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
          expect(logging.log).toHaveBeenCalledWith(expect.objectContaining({ category: "error" }));
          done();
        },
      });
  });
});
