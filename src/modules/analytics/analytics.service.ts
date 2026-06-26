import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { AnalyticsQueryDto } from "./dto/analytics-query.dto.js";

type DateRange = {
  from: Date;
  to: Date;
};

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(query: AnalyticsQueryDto) {
    const range = this.resolveRange(query);
    const [users, activeUsers, orders, dailyOrders, subscriptions, leads, inventory, notifications] =
      await Promise.all([
        this.prisma.user.count({ where: { deletedAt: null } }),
        this.prisma.user.count({
          where: { deletedAt: null, lastLoginAt: { gte: range.from, lte: range.to } },
        }),
        this.prisma.order.count({ where: { deletedAt: null } }),
        this.orderWindowMetrics(range),
        this.subscriptionMetrics(range),
        this.leadMetrics(range),
        this.inventoryMetrics(),
        this.notificationMetrics(range),
      ]);

    return {
      period: query.period,
      range,
      totalUsers: users,
      activeUsers,
      totalOrders: orders,
      ...dailyOrders,
      activeSubscribers: subscriptions.activeSubscribers,
      subscriptionGrowth: subscriptions.subscriptionGrowth,
      newLeads: leads.newLeads,
      leadConversionRate: leads.leadConversionRate,
      inventoryUtilization: inventory.inventoryUtilization,
      lowStockProducts: inventory.lowStockProducts,
      notificationSuccessRate: notifications.notificationSuccessRate,
    };
  }

  async orders(query: AnalyticsQueryDto) {
    const range = this.resolveRange(query);
    const [byStatus, revenue, recentOrders] = await Promise.all([
      this.prisma.order.groupBy({
        by: ["status"],
        where: { deletedAt: null, createdAt: { gte: range.from, lte: range.to } },
        _count: { _all: true },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: { deletedAt: null, createdAt: { gte: range.from, lte: range.to } },
        _sum: { subtotal: true, taxAmount: true, shippingFee: true, discount: true, total: true },
      }),
      this.prisma.order.findMany({
        where: { deletedAt: null, createdAt: { gte: range.from, lte: range.to } },
        orderBy: { createdAt: "desc" },
        take: 25,
        include: { items: true, user: { select: { id: true, name: true, phone: true } } },
      }),
    ]);

    return {
      range,
      byStatus,
      revenue: {
        subtotal: Number(revenue._sum.subtotal ?? 0),
        taxAmount: Number(revenue._sum.taxAmount ?? 0),
        shippingFee: Number(revenue._sum.shippingFee ?? 0),
        discount: Number(revenue._sum.discount ?? 0),
        total: Number(revenue._sum.total ?? 0),
      },
      recentOrders,
    };
  }

  async subscriptions(query: AnalyticsQueryDto) {
    const range = this.resolveRange(query);
    const metrics = await this.subscriptionMetrics(range);
    const byStatus = await this.prisma.subscription.groupBy({
      by: ["status"],
      where: { deletedAt: null },
      _count: { _all: true },
    });
    return { range, ...metrics, byStatus };
  }

  async leads(query: AnalyticsQueryDto) {
    const range = this.resolveRange(query);
    const metrics = await this.leadMetrics(range);
    const bySource = await this.prisma.lead.groupBy({
      by: ["source"],
      where: { submittedAt: { gte: range.from, lte: range.to } },
      _count: { _all: true },
    });
    return { range, ...metrics, bySource };
  }

  async inventory() {
    return this.inventoryMetrics();
  }

  async notifications(query: AnalyticsQueryDto) {
    const range = this.resolveRange(query);
    return { range, ...(await this.notificationMetrics(range)) };
  }

  toCsv(payload: unknown) {
    const rows = this.flatten(payload);
    const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
    const header = keys.join(",");
    const body = rows
      .map((row) =>
        keys
          .map((key) => {
            const value = row[key] ?? "";
            return `"${String(value).replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\n");
    return `${header}\n${body}\n`;
  }

  toPdf(payload: unknown, title: string) {
    const text = `${title}\n\n${JSON.stringify(payload, null, 2)}`;
    const escaped = text.replace(/[\\()]/g, "\\$&").replace(/\r?\n/g, "\\n");
    const stream = `BT /F1 10 Tf 40 780 Td (${escaped}) Tj ET`;
    const objects = [
      "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
      "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
      "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
      "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
      `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
    ];
    const chunks = ["%PDF-1.4\n"];
    const offsets = [0];
    for (const object of objects) {
      offsets.push(chunks.join("").length);
      chunks.push(`${object}\n`);
    }
    const xrefOffset = chunks.join("").length;
    chunks.push(`xref\n0 ${objects.length + 1}\n`);
    chunks.push("0000000000 65535 f \n");
    for (const offset of offsets.slice(1)) {
      chunks.push(`${String(offset).padStart(10, "0")} 00000 n \n`);
    }
    chunks.push(`trailer << /Size ${objects.length + 1} /Root 1 0 R >>\n`);
    chunks.push(`startxref\n${xrefOffset}\n%%EOF`);
    return Buffer.from(chunks.join(""), "utf8");
  }

  private async orderWindowMetrics(range: DateRange) {
    const now = new Date();
    const today = this.startOfDay(now);
    const weekStart = new Date(today);
    weekStart.setUTCDate(today.getUTCDate() - 6);
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const [todayCount, weekCount, monthCount] = await Promise.all([
      this.prisma.order.count({ where: { deletedAt: null, createdAt: { gte: today } } }),
      this.prisma.order.count({ where: { deletedAt: null, createdAt: { gte: weekStart } } }),
      this.prisma.order.count({ where: { deletedAt: null, createdAt: { gte: monthStart } } }),
    ]);
    return {
      ordersToday: todayCount,
      ordersThisWeek: weekCount,
      ordersThisMonth: monthCount,
      ordersInRange: await this.prisma.order.count({
        where: { deletedAt: null, createdAt: { gte: range.from, lte: range.to } },
      }),
    };
  }

  private async subscriptionMetrics(range: DateRange) {
    const [activeSubscribers, createdInRange, previousCreated] = await Promise.all([
      this.prisma.subscription.count({ where: { deletedAt: null, status: "active" } }),
      this.prisma.subscription.count({
        where: { deletedAt: null, createdAt: { gte: range.from, lte: range.to } },
      }),
      this.prisma.subscription.count({
        where: {
          deletedAt: null,
          createdAt: {
            gte: new Date(range.from.getTime() - (range.to.getTime() - range.from.getTime())),
            lt: range.from,
          },
        },
      }),
    ]);
    const growth = previousCreated ? ((createdInRange - previousCreated) / previousCreated) * 100 : createdInRange;
    return {
      activeSubscribers,
      newSubscriptions: createdInRange,
      subscriptionGrowth: Number(growth.toFixed(2)),
    };
  }

  private async leadMetrics(range: DateRange) {
    const [newLeads, convertedLeads] = await Promise.all([
      this.prisma.lead.count({ where: { submittedAt: { gte: range.from, lte: range.to } } }),
      this.prisma.lead.count({
        where: {
          submittedAt: { gte: range.from, lte: range.to },
          subscriptionId: { not: null },
        },
      }),
    ]);
    return {
      newLeads,
      convertedLeads,
      leadConversionRate: newLeads ? Number(((convertedLeads / newLeads) * 100).toFixed(2)) : 0,
    };
  }

  private async inventoryMetrics() {
    const items = await this.prisma.inventoryItem.findMany({ where: { deletedAt: null } });
    const lowStock = items.filter((item) => Number(item.currentStock) <= Number(item.reorderLevel));
    const totalStock = items.reduce((sum, item) => sum + Number(item.currentStock), 0);
    const totalReserved = items.reduce((sum, item) => sum + Number(item.reservedStock), 0);
    return {
      inventoryItems: items.length,
      lowStockProducts: lowStock.length,
      outOfStockProducts: items.filter((item) => Number(item.currentStock) <= 0).length,
      inventoryUtilization: totalStock ? Number(((totalReserved / totalStock) * 100).toFixed(2)) : 0,
      lowStock,
    };
  }

  private async notificationMetrics(range: DateRange) {
    const notifications = await this.prisma.notification.findMany({
      where: { deletedAt: null, createdAt: { gte: range.from, lte: range.to } },
    });
    const sent = notifications.filter((notification) => notification.status === "sent").length;
    const failed = notifications.filter((notification) => notification.status === "failed").length;
    const pending = notifications.filter((notification) => notification.status === "queued").length;
    return {
      totalNotifications: notifications.length,
      sent,
      failed,
      pending,
      notificationSuccessRate: notifications.length
        ? Number(((sent / notifications.length) * 100).toFixed(2))
        : 0,
    };
  }

  private resolveRange(query: AnalyticsQueryDto): DateRange {
    if (query.period === "custom" && query.from && query.to) {
      return { from: new Date(query.from), to: new Date(query.to) };
    }
    const to = new Date();
    const from = new Date(to);
    if (query.period === "daily") from.setUTCDate(to.getUTCDate() - 1);
    if (query.period === "weekly") from.setUTCDate(to.getUTCDate() - 7);
    if (query.period === "monthly") from.setUTCMonth(to.getUTCMonth() - 1);
    return { from, to };
  }

  private startOfDay(value: Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }

  private flatten(payload: unknown): Record<string, unknown>[] {
    if (Array.isArray(payload)) return payload.flatMap((item) => this.flatten(item));
    if (!payload || typeof payload !== "object") return [{ value: payload }];
    const rows: Record<string, unknown>[] = [];
    for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          for (const row of this.flatten(item)) rows.push({ group: key, index, ...row });
        });
        continue;
      }
      if (value && typeof value === "object" && !(value instanceof Date)) {
        for (const row of this.flatten(value)) rows.push({ group: key, ...row });
        continue;
      }
      rows.push({ key, value });
    }
    return rows.length ? rows : [{}];
  }
}
