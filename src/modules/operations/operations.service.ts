import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { Role } from "../../common/constants/roles.js";
import type { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { PrismaService } from "../../prisma/prisma.service.js";

type JsonRecord = Record<string, unknown>;

const DEFAULT_SETTINGS = [
  {
    key: "store.name",
    group: "store",
    label: "Store name",
    value: "HasuMane",
    isSecret: false,
  },
  {
    key: "store.support_phone",
    group: "store",
    label: "Support phone",
    value: process.env.ADMIN_PHONE || "+919344259815",
    isSecret: false,
  },
  {
    key: "security.admin_session_minutes",
    group: "security",
    label: "Admin session minutes",
    value: 10080,
    isSecret: false,
  },
  {
    key: "notifications.whatsapp_enabled",
    group: "notifications",
    label: "WhatsApp notifications enabled",
    value: Boolean(process.env.WATI_API_KEY),
    isSecret: false,
  },
  {
    key: "analytics.retention_days",
    group: "analytics",
    label: "Analytics retention days",
    value: 365,
    isSecret: false,
  },
] as const;

const ROLE_PERMISSION_MODULES = [
  "dashboard",
  "users",
  "leads",
  "subscriptions",
  "products",
  "categories",
  "orders",
  "procurement",
  "notifications",
  "settings",
  "security",
] as const;

@Injectable()
export class OperationsService {
  constructor(private readonly prisma: PrismaService) {}

  async captureLead(payload: JsonRecord, request: AuthenticatedRequest) {
    const name = this.requiredString(payload, "name", "Name");
    const phone = this.requiredString(payload, "phone", "Phone");
    const area = this.requiredString(payload, "area", "Area");
    const productType = this.normalizeSlug(
      this.stringValue(payload.product ?? payload.productType, "milk"),
    );
    const quantity = this.positiveQuantity(payload.quantity, 1);
    const scheduleType = this.normalizeSchedule(
      this.stringValue(payload.plan ?? payload.scheduleType, "daily"),
    );
    const notes = this.optionalString(payload.notes);
    const source = this.optionalString(payload.source) || "website";
    const userAgent = this.optionalString(payload.userAgent) || request.context?.userAgent;
    const referrer = this.optionalString(payload.referrer);
    const requestType = this.stringValue(payload.requestType, "subscription");

    const result = await this.prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findFirst({
        where: { phone, deletedAt: null },
      });
      const user =
        existingUser ??
        (await tx.user.create({
          data: {
            name,
            phone,
            role: Role.CUSTOMER,
          },
        }));

      await tx.user.update({
        where: { id: user.id },
        data: {
          name,
          updatedBy: user.id,
        },
      });

      await tx.address.create({
        data: {
          userId: user.id,
          streetAddress: area,
          pincode: area,
          latitude: 0,
          longitude: 0,
          isActive: true,
          createdBy: user.id,
          updatedBy: user.id,
        },
      });

      let subscriptionId: string | null = null;
      if (requestType !== "order") {
        const subscription = await tx.subscription.create({
          data: {
            userId: user.id,
            productType,
            quantity,
            scheduleType,
            status: "pending",
            createdBy: user.id,
            updatedBy: user.id,
          },
        });
        subscriptionId = subscription.id;
      }

      const lead = await tx.lead.create({
        data: {
          userId: user.id,
          subscriptionId,
          name,
          phone,
          area,
          productType,
          quantity,
          scheduleType,
          notes,
          source,
          userAgent,
          referrer,
        },
      });

      const product = await tx.product.findFirst({
        where: { productType, deletedAt: null },
      });
      const unitPrice = product?.price ? Number(product.price) : 0;
      const subtotal = unitPrice * quantity;

      let orderId: string | null = null;
      let orderNumber: string | null = null;
      if (requestType === "order") {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        orderNumber = `ORD-${dateStr}-${randomUUID().slice(0, 8).toUpperCase()}`;

        const order = await tx.order.create({
          data: {
            orderNumber,
            userId: user.id,
            status: "pending",
            subtotal,
            taxAmount: 0,
            shippingFee: 0,
            discount: 0,
            total: subtotal,
            currency: "INR",
            createdBy: user.id,
            updatedBy: user.id,
            items: {
              create: {
                productId: product?.id || null,
                name: product?.name || `${productType.charAt(0).toUpperCase() + productType.slice(1)} Pack`,
                quantity,
                unitPrice,
                total: subtotal,
              },
            },
            statusHistory: {
              create: {
                status: "pending",
                note: "Order created from website lead form.",
                changedBy: user.id,
              },
            },
          },
        });
        orderId = order.id;
      }

      const notificationTitle = requestType === "order" ? "New order request" : "New subscription lead";
      const notificationBody = requestType === "order"
        ? `${name} ordered ${quantity} ${productType}.`
        : `${name} requested ${quantity} ${productType} on ${scheduleType}.`;

      await tx.notification.create({
        data: {
          userId: user.id,
          channel: "whatsapp",
          type: requestType === "order" ? "order_created" : "lead_created",
          title: notificationTitle,
          body: notificationBody,
          status: process.env.WATI_API_KEY ? "queued" : "simulated",
          metadata: {
            phone,
            leadId: lead.id,
            ...(subscriptionId ? { subscriptionId } : {}),
            area,
            ...(orderId ? { orderId } : {}),
          },
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          actorId: user.id,
          action: "create",
          module: "leads",
          entityType: "lead",
          entityId: lead.id,
          newValue: this.jsonSafe(lead),
          ipAddress: request.context?.ipAddress,
          userAgent: request.context?.userAgent,
          metadata: {
            source,
          },
        },
      });

      if (orderId && orderNumber) {
        await tx.auditLog.create({
          data: {
            userId: user.id,
            actorId: user.id,
            action: "create",
            module: "orders",
            entityType: "order",
            entityId: orderId,
            newValue: { orderNumber },
            ipAddress: request.context?.ipAddress,
            userAgent: request.context?.userAgent,
            metadata: {
              source,
            },
          },
        });
      }

      return lead;
    });

    return {
      id: result.id,
      submittedAt: result.submittedAt.toISOString(),
    };
  }

  async summary() {
    const [
      users,
      subscriptions,
      orders,
      procurementLogs,
      notifications,
      productsCount,
      supportTicketsCount,
      leads,
      revenue,
    ] = await Promise.all([
      this.prisma.user.findMany({ where: { deletedAt: null }, select: { role: true } }),
      this.prisma.subscription.findMany({ where: { deletedAt: null }, select: { status: true } }),
      this.prisma.dailyOrder.findMany({
        where: { deletedAt: null },
        select: { status: true, deliveryDate: true },
      }),
      this.prisma.milkProcurementLog.findMany({
        where: { deletedAt: null },
        select: { quantityLiters: true, totalPayout: true },
      }),
      this.prisma.notification.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      this.prisma.product.count({ where: { deletedAt: null, isActive: true } }),
      this.prisma.supportTicket.count({ where: { status: { in: ["open", "pending"] } } }),
      this.prisma.lead.findMany({ orderBy: { submittedAt: "desc" }, take: 50 }),
      this.prisma.order.aggregate({
        where: { deletedAt: null, status: { notIn: ["cancelled", "refunded"] } },
        _sum: { total: true },
      }),
    ]);

    const todayKey = this.dateKey(new Date());
    const byRole = this.countBy(users.map((user) => this.toClientRole(user.role)));
    const bySubscriptionStatus = this.countBy(
      subscriptions.map((subscription) => subscription.status),
    );
    const byOrderStatus = this.countBy(orders.map((order) => order.status));
    const bySource = this.countBy(leads.map((lead) => lead.source || "unknown"));

    return {
      summary: {
        users: {
          total: users.length,
          byRole,
        },
        subscriptions: {
          total: subscriptions.length,
          byStatus: bySubscriptionStatus,
        },
        orders: {
          total: orders.length,
          byStatus: byOrderStatus,
        },
        procurement: {
          totalLogs: procurementLogs.length,
          totalVolumeLiters: this.sumNumbers(procurementLogs.map((log) => log.quantityLiters)),
          totalPayoutAmount: this.sumNumbers(procurementLogs.map((log) => log.totalPayout)),
        },
        notifications: {
          total: notifications.length,
          latest: notifications.map((notification) => this.toClientNotification(notification)),
        },
        dashboard: {
          totalOrders: orders.length,
          totalRevenue: Number(revenue._sum.total ?? 0),
          todaySales: orders.filter((order) => this.dateKey(order.deliveryDate) === todayKey)
            .length,
          pendingOrders: byOrderStatus.pending ?? 0,
          deliveredOrders: byOrderStatus.delivered ?? 0,
          activeUsers: users.length,
          activeProducts: productsCount,
          openSupportTickets: supportTicketsCount,
        },
        leads: {
          total: leads.length,
          latest: leads.slice(0, 10).map((lead) => this.toClientLead(lead)),
          bySource,
        },
      },
    };
  }

  async leads() {
    const leads = await this.prisma.lead.findMany({
      orderBy: { submittedAt: "desc" },
      take: 200,
    });
    return { leads: leads.map((lead) => this.toClientLead(lead)) };
  }

  async deleteLead(id: string, actorId?: string) {
    const existing = await this.prisma.lead.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException("Lead not found.");

    const subscriptionId = existing.subscriptionId;
    if (subscriptionId) {
      await this.prisma.$transaction(async (tx) => {
        await tx.dailyOrder.updateMany({
          where: { subscriptionId, deletedAt: null },
          data: { deletedAt: new Date(), status: "cancelled", updatedBy: actorId },
        });
        await tx.subscription.updateMany({
          where: { id: subscriptionId, deletedAt: null },
          data: { deletedAt: new Date(), status: "terminated", updatedBy: actorId },
        });
        await tx.lead.delete({ where: { id } });
        await tx.auditLog.create({
          data: {
            userId: existing.userId || undefined,
            actorId,
            action: "delete",
            module: "leads",
            entityType: "lead",
            entityId: id,
            oldValue: this.jsonSafe(existing),
            metadata: {
              subscriptionId: existing.subscriptionId,
            },
          },
        });
      });
      return { lead: existing, deletedSubscriptionId: existing.subscriptionId };
    }

    await this.prisma.lead.delete({ where: { id } });
    await this.prisma.auditLog.create({
      data: {
        userId: existing.userId || undefined,
        actorId,
        action: "delete",
        module: "leads",
        entityType: "lead",
        entityId: id,
        oldValue: this.jsonSafe(existing),
      },
    });
    return { lead: existing };
  }

  async subscriptions() {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: { user: { include: { addresses: true } }, dailyOrders: true },
      take: 200,
    });
    return {
      subscriptions: subscriptions.map((subscription) => ({
        ...subscription,
        user: subscription.user ? this.toClientUser(subscription.user) : undefined,
      })),
    };
  }

  async deleteSubscription(id: string, actorId?: string) {
    const existing = await this.prisma.subscription.findFirst({
      where: { id, deletedAt: null },
      include: { user: true, dailyOrders: true },
    });
    if (!existing) throw new NotFoundException("Subscription not found.");

    const lead = await this.prisma.lead.findFirst({ where: { subscriptionId: id } });

    await this.prisma.$transaction(async (tx) => {
      await tx.dailyOrder.updateMany({
        where: { subscriptionId: id, deletedAt: null },
        data: { deletedAt: new Date(), status: "cancelled", updatedBy: actorId },
      });
      if (lead) {
        await tx.lead.delete({ where: { id: lead.id } });
      }
      await tx.subscription.update({
        where: { id },
        data: { deletedAt: new Date(), status: "terminated", updatedBy: actorId },
      });
      await tx.auditLog.create({
        data: {
          userId: existing.userId,
          actorId,
          action: "delete",
          module: "subscriptions",
          entityType: "subscription",
          entityId: id,
          oldValue: this.jsonSafe(existing),
          metadata: lead ? { leadId: lead.id } : undefined,
        },
      });
    });

    return { subscription: existing };
  }

  async createSubscription(payload: JsonRecord, actorId?: string) {
    const userId = this.requiredString(payload, "userId", "User ID");
    const productType = this.normalizeSlug(
      this.stringValue(payload.productType ?? payload.product, "milk"),
    );
    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        productType,
        quantity: this.positiveQuantity(payload.quantity, 1),
        scheduleType: this.normalizeSchedule(this.stringValue(payload.scheduleType, "daily")),
        status: this.stringValue(payload.status, "active"),
        createdBy: actorId,
        updatedBy: actorId,
      },
      include: { user: true, dailyOrders: true },
    });
    await this.writeAudit(actorId, "create", "subscriptions", "subscription", subscription.id, {
      newValue: subscription,
    });
    return { subscription };
  }

  async updateSubscriptionStatus(id: string, status: string, actorId?: string) {
    const existing = await this.prisma.subscription.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException("Subscription not found.");
    const subscription = await this.prisma.subscription.update({
      where: { id },
      data: { status: this.normalizeSubscriptionStatus(status), updatedBy: actorId },
      include: { user: true, dailyOrders: true },
    });
    await this.writeAudit(actorId, "update_status", "subscriptions", "subscription", id, {
      oldValue: { status: existing.status },
      newValue: { status: subscription.status },
    });
    return { subscription };
  }

  async pauseSubscription(id: string, pauseUntil: string, actorId?: string) {
    const date = this.validDate(pauseUntil, "Pause until");
    const subscription = await this.prisma.subscription.update({
      where: { id },
      data: { status: "paused", pauseUntil: date, updatedBy: actorId },
    });
    await this.writeAudit(actorId, "pause", "subscriptions", "subscription", id, {
      newValue: { pauseUntil: date.toISOString() },
    });
    return { subscription };
  }

  async resumeSubscription(id: string, actorId?: string) {
    const subscription = await this.prisma.subscription.update({
      where: { id },
      data: { status: "active", pauseUntil: null, updatedBy: actorId },
    });
    await this.writeAudit(actorId, "resume", "subscriptions", "subscription", id, {
      newValue: { status: "active" },
    });
    return { subscription };
  }

  async runDispatch(dateValue?: string, actorId?: string) {
    const targetDate = dateValue ? this.validDate(dateValue, "Dispatch date") : new Date();
    const start = this.startOfDay(targetDate);
    const end = this.addDays(start, 1);
    const subscriptions = await this.prisma.subscription.findMany({
      where: { deletedAt: null, status: "active" },
    });
    const orders = [];

    for (const subscription of subscriptions) {
      const existing = await this.prisma.dailyOrder.findFirst({
        where: {
          subscriptionId: subscription.id,
          deliveryDate: { gte: start, lt: end },
          deletedAt: null,
        },
      });
      if (existing) {
        orders.push(existing);
        continue;
      }
      orders.push(
        await this.prisma.dailyOrder.create({
          data: {
            subscriptionId: subscription.id,
            deliveryDate: start,
            quantity: subscription.quantity,
            status: "pending",
            createdBy: actorId,
            updatedBy: actorId,
          },
        }),
      );
    }

    await this.writeAudit(actorId, "run", "dispatch", "daily_order", undefined, {
      date: start.toISOString(),
      createdCount: orders.length,
    });

    return {
      message: `Dispatch generated ${orders.length} order${orders.length === 1 ? "" : "s"}.`,
      orders,
    };
  }

  async orders() {
    const orders = await this.prisma.dailyOrder.findMany({
      where: { deletedAt: null },
      orderBy: { deliveryDate: "desc" },
      take: 300,
      include: { subscription: { include: { user: true } } },
    });
    return { orders };
  }

  async markDelivered(id: string, payload: JsonRecord, actorId?: string) {
    const order = await this.prisma.dailyOrder.update({
      where: { id },
      data: {
        status: "delivered",
        deliveredAt: new Date(),
        proofPhotoUrl: this.optionalString(payload.proofPhotoUrl),
        updatedBy: actorId,
      },
    });
    await this.writeAudit(actorId, "deliver", "dispatch", "daily_order", id, {
      newValue: { status: "delivered" },
    });
    return { order };
  }

  async farmers() {
    const farmers = await this.prisma.user.findMany({
      where: { deletedAt: null, role: "FARMER" },
      orderBy: { createdAt: "desc" },
    });
    return { farmers: farmers.map((farmer) => this.toClientUser(farmer)) };
  }

  async createFarmer(payload: JsonRecord, actorId?: string) {
    const farmer = await this.prisma.user.create({
      data: {
        name: this.requiredString(payload, "name", "Name"),
        phone: this.requiredString(payload, "phone", "Phone"),
        role: "FARMER",
        createdBy: actorId,
        updatedBy: actorId,
      },
    });
    await this.writeAudit(actorId, "create", "procurement", "farmer", farmer.id, {
      newValue: this.toClientUser(farmer),
    });
    return { farmer: this.toClientUser(farmer) };
  }

  async procurementLogs(farmerId?: string) {
    const logs = await this.prisma.milkProcurementLog.findMany({
      where: { deletedAt: null, ...(farmerId ? { farmerId } : {}) },
      orderBy: { collectionDate: "desc" },
      take: 300,
      include: { farmer: true },
    });
    return { logs: logs.map((log) => this.toClientProcurementLog(log)) };
  }

  async createProcurementLog(payload: JsonRecord, actorId?: string) {
    const quantityLiters = this.positiveNumber(payload.quantityLiters, "Quantity liters");
    const fatPercentage = this.positiveNumber(payload.fatPercentage, "Fat percentage");
    const snfPercentage = this.positiveNumber(payload.snfPercentage, "SNF percentage");
    const ratePerLiter = Number((45 + fatPercentage * 3 + snfPercentage).toFixed(2));
    const log = await this.prisma.milkProcurementLog.create({
      data: {
        farmerId: this.requiredString(payload, "farmerId", "Farmer ID"),
        collectionDate: payload.collectionDate
          ? this.validDate(String(payload.collectionDate), "Collection date")
          : new Date(),
        quantityLiters,
        fatPercentage,
        snfPercentage,
        ratePerLiter,
        totalPayout: Number((quantityLiters * ratePerLiter).toFixed(2)),
        createdBy: actorId,
        updatedBy: actorId,
      },
      include: { farmer: true },
    });
    await this.writeAudit(actorId, "create", "procurement", "milk_procurement_log", log.id, {
      newValue: this.toClientProcurementLog(log),
    });
    return { log: this.toClientProcurementLog(log) };
  }

  async notifications() {
    const notifications = await this.prisma.notification.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 300,
    });
    return {
      notifications: notifications.map((notification) => this.toClientNotification(notification)),
    };
  }

  async enqueueNotification(payload: JsonRecord, actorId?: string) {
    const phone = this.requiredString(payload, "phone", "Phone");
    const type = this.stringValue(payload.type, "manual");
    const details = this.recordValue(payload.details);
    const notification = await this.prisma.notification.create({
      data: {
        channel: this.stringValue(payload.channel, "whatsapp"),
        type,
        title: this.optionalString(payload.title) || "Admin notification",
        body: this.optionalString(payload.body) || `Notification queued for ${phone}.`,
        status: process.env.WATI_API_KEY ? "queued" : "simulated",
        metadata: { ...details, phone },
      },
    });
    await this.writeAudit(actorId, "enqueue", "notifications", "notification", notification.id, {
      newValue: this.toClientNotification(notification),
    });
    return { notification: this.toClientNotification(notification) };
  }

  async settings() {
    await this.ensureDefaultSettings();
    const settings = await this.prisma.appSetting.findMany({
      orderBy: [{ group: "asc" }, { key: "asc" }],
    });
    return { settings };
  }

  async saveSetting(key: string, payload: JsonRecord, actorId?: string) {
    const existing = await this.prisma.appSetting.findUnique({ where: { key } });
    const setting = await this.prisma.appSetting.upsert({
      where: { key },
      update: {
        group: this.stringValue(payload.group, existing?.group || "general"),
        label: this.stringValue(payload.label, existing?.label || key),
        value: this.toJsonInput(payload.value),
        isSecret: this.booleanValue(payload.isSecret, existing?.isSecret ?? false),
      },
      create: {
        key,
        group: this.stringValue(payload.group, "general"),
        label: this.stringValue(payload.label, key),
        value: this.toJsonInput(payload.value),
        isSecret: this.booleanValue(payload.isSecret, false),
      },
    });
    await this.writeAudit(actorId, "update", "settings", "app_setting", setting.id, {
      oldValue: existing,
      newValue: setting,
    });
    return { setting };
  }

  async auditLogs() {
    const auditLogs = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 300,
    });
    return { auditLogs };
  }

  async loginHistory() {
    const logins = await this.prisma.loginHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: 300,
    });
    return { logins };
  }

  async rolePermissions() {
    await this.ensureRolePermissions();
    const permissions = await this.prisma.rolePermission.findMany({
      orderBy: [{ role: "asc" }, { module: "asc" }],
    });
    return { permissions };
  }

  private async ensureDefaultSettings() {
    for (const setting of DEFAULT_SETTINGS) {
      await this.prisma.appSetting.upsert({
        where: { key: setting.key },
        update: {},
        create: {
          key: setting.key,
          group: setting.group,
          label: setting.label,
          value: setting.value,
          isSecret: setting.isSecret,
        },
      });
    }
  }

  private async ensureRolePermissions() {
    const roles = [
      Role.SUPER_ADMIN,
      Role.ADMIN,
      Role.MANAGER,
      Role.SUPPORT,
      Role.DELIVERY_PARTNER,
      Role.CUSTOMER,
    ];

    for (const role of roles) {
      for (const module of ROLE_PERMISSION_MODULES) {
        const level = this.roleLevel(role);
        await this.prisma.rolePermission.upsert({
          where: { role_module: { role, module } },
          update: {},
          create: {
            role,
            module,
            canView: level >= this.moduleReadLevel(module),
            canCreate: level >= 60,
            canEdit: level >= 60,
            canDelete: level >= 80,
            canExport: level >= 60,
          },
        });
      }
    }
  }

  private moduleReadLevel(module: string) {
    if (["settings", "security"].includes(module)) return 80;
    if (["procurement", "notifications"].includes(module)) return 40;
    return 10;
  }

  private roleLevel(role: Role) {
    const levels: Record<Role, number> = {
      [Role.SUPER_ADMIN]: 100,
      [Role.ADMIN]: 80,
      [Role.MANAGER]: 60,
      [Role.SUPPORT]: 40,
      [Role.DELIVERY_PARTNER]: 20,
      [Role.CUSTOMER]: 10,
    };
    return levels[role] ?? 0;
  }

  private async writeAudit(
    actorId: string | undefined,
    action: string,
    module: string,
    entityType?: string,
    entityId?: string,
    metadata?: unknown,
  ) {
    await this.prisma.auditLog.create({
      data: {
        userId: actorId,
        actorId,
        action,
        module,
        entityType,
        entityId,
        oldValue: this.extractAuditValue(metadata, "oldValue"),
        newValue: this.extractAuditValue(metadata, "newValue"),
        metadata: metadata === undefined ? undefined : this.toJsonInput(this.jsonSafe(metadata)),
      },
    });
  }

  private extractAuditValue(metadata: unknown, key: "oldValue" | "newValue") {
    if (metadata && typeof metadata === "object" && key in metadata) {
      return this.toJsonInput(this.jsonSafe((metadata as Record<string, unknown>)[key]));
    }
    return undefined;
  }

  private toClientLead(lead: {
    id: string;
    userId: string | null;
    subscriptionId: string | null;
    name: string;
    phone: string;
    area: string;
    productType: string;
    quantity: Prisma.Decimal | number;
    scheduleType: string;
    notes: string | null;
    source: string | null;
    status: string;
    submittedAt: Date;
  }) {
    return {
      id: lead.id,
      userId: lead.userId || "",
      subscriptionId: lead.subscriptionId ?? null,
      name: lead.name,
      phone: lead.phone,
      area: lead.area,
      productType: lead.productType,
      quantity: Number(lead.quantity),
      scheduleType: lead.scheduleType,
      notes: lead.notes || "",
      source: lead.source || "website",
      status: lead.status,
      submittedAt: lead.submittedAt.toISOString(),
    };
  }

  private toClientUser(user: { role: string } & JsonRecord) {
    return {
      ...user,
      role: this.toClientRole(user.role),
    };
  }

  private toClientProcurementLog(
    log: JsonRecord & { farmer?: ({ role: string } & JsonRecord) | null },
  ) {
    return {
      ...log,
      quantityLiters: Number(log.quantityLiters ?? 0),
      fatPercentage: Number(log.fatPercentage ?? 0),
      snfPercentage: Number(log.snfPercentage ?? 0),
      ratePerLiter: Number(log.ratePerLiter ?? 0),
      totalPayout: Number(log.totalPayout ?? 0),
      farmer: log.farmer ? this.toClientUser(log.farmer) : null,
    };
  }

  private toClientNotification(notification: {
    id: string;
    type: string;
    channel: string;
    body: string;
    status: string;
    metadata: Prisma.JsonValue;
    createdAt: Date;
  }) {
    const metadata = this.recordValue(notification.metadata);
    return {
      id: notification.id,
      type: notification.type,
      channel: notification.channel,
      phone: this.stringValue(metadata.phone, ""),
      details: metadata,
      body: notification.body,
      status: notification.status,
      createdAt: notification.createdAt.toISOString(),
    };
  }

  private toClientRole(role: string) {
    const map: Record<string, string> = {
      [Role.SUPER_ADMIN]: "super_admin",
      [Role.ADMIN]: "admin",
      [Role.MANAGER]: "manager",
      [Role.SUPPORT]: "customer_support",
      [Role.DELIVERY_PARTNER]: "rider",
      [Role.CUSTOMER]: "consumer",
      FARMER: "farmer",
    };
    return map[role] || role.toLowerCase();
  }

  private countBy(values: string[]) {
    return values.reduce<Record<string, number>>((counts, value) => {
      counts[value] = (counts[value] || 0) + 1;
      return counts;
    }, {});
  }

  private sumNumbers(values: Array<Prisma.Decimal | number | null>) {
    const total = values.reduce<number>((sum, value) => sum + Number(value ?? 0), 0);
    return Number(total.toFixed(2));
  }

  private requiredString(payload: JsonRecord, key: string, label: string) {
    const value = this.optionalString(payload[key]);
    if (!value) throw new BadRequestException(`${label} is required.`);
    return value;
  }

  private optionalString(value: unknown) {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }

  private stringValue(value: unknown, fallback: string) {
    return this.optionalString(value) || fallback;
  }

  private recordValue(value: unknown): JsonRecord {
    return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
  }

  private toJsonInput(value: unknown): Prisma.InputJsonValue {
    if (value === undefined) return "";
    return value as Prisma.InputJsonValue;
  }

  private jsonSafe(value: unknown) {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }

  private booleanValue(value: unknown, fallback: boolean) {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return ["true", "1", "yes"].includes(value.toLowerCase());
    return fallback;
  }

  private positiveQuantity(value: unknown, fallback: number) {
    const numberValue = Number(value ?? fallback);
    if (!Number.isFinite(numberValue) || numberValue <= 0) {
      throw new BadRequestException("Quantity must be a positive number.");
    }
    // Allow up to 2 decimal places (e.g. 0.5 litre, 250 gram)
    return Math.round(numberValue * 100) / 100;
  }

  private positiveNumber(value: unknown, label: string) {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue) || numberValue <= 0) {
      throw new BadRequestException(`${label} must be a positive number.`);
    }
    return numberValue;
  }

  private normalizeSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  private normalizeSchedule(value: string) {
    const schedule = this.normalizeSlug(value);
    return ["daily", "alternate", "custom", "weekly", "monthly"].includes(schedule)
      ? schedule
      : "daily";
  }

  private normalizeSubscriptionStatus(value: string) {
    const status = this.normalizeSlug(value);
    return ["pending", "active", "paused", "terminated"].includes(status) ? status : "active";
  }

  private validDate(value: string, label: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${label} is invalid.`);
    }
    return date;
  }

  private startOfDay(value: Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }

  private addDays(value: Date, days: number) {
    return new Date(value.getTime() + days * 24 * 60 * 60 * 1000);
  }

  private dateKey(value: Date) {
    return value.toISOString().slice(0, 10);
  }
}
