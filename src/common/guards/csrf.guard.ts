import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { createHash, timingSafeEqual } from "node:crypto";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator.js";
import type { AuthenticatedRequest } from "../types/authenticated-request.js";
import { PrismaService } from "../../prisma/prisma.service.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (SAFE_METHODS.has(request.method)) return true;

    const headerName = this.configService.get<string>("app.csrfHeader") || "x-csrf-token";
    const headerToken = request.header(headerName);
    const cookieToken = request.signedCookies?.csrf_token || request.cookies?.csrf_token;

    if (!headerToken) {
      throw new ForbiddenException("Invalid CSRF token.");
    }

    if (cookieToken && this.safeEqual(headerToken, cookieToken)) {
      return true;
    }

    const sessionId = request.user?.sessionId;
    const userId = request.user?.id;
    if (!sessionId || !userId) {
      throw new ForbiddenException("Invalid CSRF token.");
    }

    const session = await this.prisma.userSession.findFirst({
      where: {
        id: sessionId,
        userId,
        revokedAt: null,
        deletedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { csrfTokenHash: true },
    });

    if (!session?.csrfTokenHash || !this.safeEqual(this.sha256(headerToken), session.csrfTokenHash)) {
      throw new ForbiddenException("Invalid CSRF token.");
    }

    return true;
  }

  private sha256(value: string) {
    return createHash("sha256").update(value).digest("hex");
  }

  private safeEqual(left: string, right: string) {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
  }
}
