import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Role } from "../../common/constants/roles.js";
import type { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { AuthService } from "../auth/auth.service.js";

@Injectable()
export class AdminSessionService {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(password: string, request: AuthenticatedRequest) {
    const expectedToken = this.configService.getOrThrow<string>("app.adminApiToken");
    if (!password || password !== expectedToken) {
      await this.writeLogin(null, "failed", request);
      throw new UnauthorizedException("Invalid admin token.");
    }

    const user = await this.ensureAdminUser();
    await this.writeLogin(user.id, "success", request, user.role);
    const tokens = await this.authService.createSessionForUser(user, request);

    return {
      session: {
        authenticated: true,
        accessToken: tokens.accessToken,
        csrfToken: tokens.csrfToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        role: this.toClientRole(user.role),
      },
      tokens,
    };
  }

  toClientRole(role: string) {
    const map: Record<string, string> = {
      [Role.SUPER_ADMIN]: "super_admin",
      [Role.ADMIN]: "admin",
      [Role.MANAGER]: "manager",
      [Role.SUPPORT]: "customer_support",
      [Role.DELIVERY_PARTNER]: "rider",
      [Role.CUSTOMER]: "consumer",
    };
    return map[role] || role.toLowerCase();
  }

  private async ensureAdminUser() {
    const email = process.env.ADMIN_EMAIL || "admin@hasumane.local";
    const phone = process.env.ADMIN_PHONE || "+910000000000";
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existing) {
      return this.prisma.user.update({
        where: { id: existing.id },
        data: {
          email,
          phone,
          role: Role.SUPER_ADMIN,
          isBlocked: false,
          updatedBy: existing.id,
        },
      });
    }

    return this.prisma.user.create({
      data: {
        name: "HasuMane Admin",
        email,
        phone,
        role: Role.SUPER_ADMIN,
      },
    });
  }

  private async writeLogin(
    userId: string | null,
    status: string,
    request: AuthenticatedRequest,
    role?: string | null,
  ) {
    await this.prisma.loginHistory.create({
      data: {
        userId,
        role,
        status,
        ipAddress: request.context?.ipAddress,
        userAgent: request.context?.userAgent,
      },
    });
  }
}
