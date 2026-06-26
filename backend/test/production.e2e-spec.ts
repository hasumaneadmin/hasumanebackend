import { INestApplication, VersioningType } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { Role } from "../src/common/constants/roles.js";
import { AuditLogController } from "../src/modules/audit/audit-log.controller.js";
import { AuditLogService } from "../src/modules/audit/audit-log.service.js";
import { AnalyticsController } from "../src/modules/analytics/analytics.controller.js";
import { AnalyticsService } from "../src/modules/analytics/analytics.service.js";
import { AuthController } from "../src/modules/auth/auth.controller.js";
import { AuthService } from "../src/modules/auth/auth.service.js";
import { OperationsService } from "../src/modules/operations/operations.service.js";
import { SubscriptionsController } from "../src/modules/operations/operations.controller.js";
import { OrdersController } from "../src/modules/orders/orders.controller.js";
import { OrdersService } from "../src/modules/orders/orders.service.js";

describe("Production API e2e", () => {
  let app: INestApplication;
  const authService = {
    login: jest.fn().mockResolvedValue({
      user: { id: "admin-1", role: Role.ADMIN },
      accessToken: "access-token",
      refreshToken: "refresh-token",
      csrfToken: "csrf-token",
      expiresIn: "15m",
    }),
  };
  const ordersService = {
    createOrder: jest.fn().mockResolvedValue({ id: "order-1", status: "pending" }),
    listOrders: jest.fn().mockResolvedValue({ data: [{ id: "order-1" }], meta: { total: 1 } }),
    cancelOrder: jest.fn().mockResolvedValue({ id: "order-1", status: "cancelled" }),
  };
  const operationsService = {
    subscriptions: jest.fn().mockResolvedValue({ subscriptions: [{ id: "subscription-1" }] }),
    createSubscription: jest.fn().mockResolvedValue({ subscription: { id: "subscription-1", status: "active" } }),
    pauseSubscription: jest.fn().mockResolvedValue({ subscription: { id: "subscription-1", status: "paused" } }),
    resumeSubscription: jest.fn().mockResolvedValue({ subscription: { id: "subscription-1", status: "active" } }),
  };
  const analyticsService = {
    overview: jest.fn().mockResolvedValue({ totalUsers: 10, totalOrders: 4 }),
    orders: jest.fn().mockResolvedValue({ byStatus: [{ status: "pending", count: 1 }] }),
    subscriptions: jest.fn().mockResolvedValue({ activeSubscribers: 5 }),
    leads: jest.fn().mockResolvedValue({ newLeads: 3 }),
    inventory: jest.fn().mockResolvedValue({ lowStockProducts: 1 }),
    notifications: jest.fn().mockResolvedValue({ notificationSuccessRate: 100 }),
    toCsv: jest.fn(() => "key,value\nmetric,1\n"),
    toPdf: jest.fn(() => Buffer.from("%PDF-1.4\n")),
  };
  const auditLogService = {
    list: jest.fn().mockResolvedValue({ data: [{ id: "audit-1", action: "login" }], meta: { total: 1 } }),
    dashboard: jest.fn().mockResolvedValue({
      recentActivities: [{ id: "audit-1" }],
      userActivitySummary: [{ userId: "admin-1", eventCount: 1 }],
      securityEvents: [{ id: "audit-1" }],
    }),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [
        AuthController,
        OrdersController,
        SubscriptionsController,
        AnalyticsController,
        AuditLogController,
      ],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: OrdersService, useValue: ordersService },
        { provide: OperationsService, useValue: operationsService },
        { provide: AnalyticsService, useValue: analyticsService },
        { provide: AuditLogService, useValue: auditLogService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api");
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });
    app.use((req: { user?: unknown }, _res: unknown, next: () => void) => {
      req.user = { id: "user-1", role: Role.ADMIN, email: "admin@hasumane.local", sessionId: "session-1" };
      next();
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("supports the admin login flow", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: "admin@hasumane.local", password: "ChangeMe@12345" })
      .expect(200);

    expect(response.body.accessToken).toBe("access-token");
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("supports an order lifecycle", async () => {
    await request(app.getHttpServer())
      .post("/api/v1/orders")
      .send({ items: [{ productId: "product-1", quantity: 1 }] })
      .expect(201)
      .expect(({ body }) => expect(body.status).toBe("pending"));

    await request(app.getHttpServer()).get("/api/v1/orders").expect(200);
    await request(app.getHttpServer()).put("/api/v1/orders/order-1/cancel").expect(200);
  });

  it("supports a subscription lifecycle", async () => {
    await request(app.getHttpServer())
      .post("/api/v1/subscriptions")
      .send({ userId: "user-1", quantity: 1 })
      .expect(201)
      .expect(({ body }) => expect(body.subscription.status).toBe("active"));

    await request(app.getHttpServer())
      .patch("/api/v1/subscriptions/subscription-1/pause")
      .send({ pauseUntil: "2030-01-01" })
      .expect(200)
      .expect(({ body }) => expect(body.subscription.status).toBe("paused"));

    await request(app.getHttpServer())
      .patch("/api/v1/subscriptions/subscription-1/resume")
      .expect(200)
      .expect(({ body }) => expect(body.subscription.status).toBe("active"));
  });

  it("serves analytics APIs and exports", async () => {
    await request(app.getHttpServer()).get("/api/v1/analytics/overview").expect(200);
    await request(app.getHttpServer())
      .get("/api/v1/analytics/orders?format=csv")
      .expect(200)
      .expect("Content-Type", /text\/csv/);
    await request(app.getHttpServer())
      .get("/api/v1/analytics/notifications?format=pdf")
      .expect(200)
      .expect("Content-Type", /application\/pdf/);
  });

  it("serves audit list and dashboard APIs", async () => {
    await request(app.getHttpServer())
      .get("/api/v1/audit-logs")
      .expect(200)
      .expect(({ body }) => expect(body.data).toHaveLength(1));

    await request(app.getHttpServer())
      .get("/api/v1/audit-logs/dashboard")
      .expect(200)
      .expect(({ body }) => expect(body.securityEvents).toHaveLength(1));
  });
});
