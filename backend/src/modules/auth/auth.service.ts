import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { StringValue } from "ms";
import { randomBytes, createHash } from "node:crypto";
import { Role } from "../../common/constants/roles.js";
import type { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { bcrypt } from "../../common/utils/bcrypt.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { AuditLogService } from "../audit/audit-log.service.js";
import type { LoginDto } from "./dto/login.dto.js";
import type { RegisterDto } from "./dto/register.dto.js";

type TokenPair = {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  expiresIn: string;
};

const ADMIN_ROLES = new Set<Role>([Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.SUPPORT]);

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditLogService: AuditLogService,
  ) {}

  createSessionForUser(
    user: { id: string; email?: string | null; role: string },
    request: AuthenticatedRequest,
  ) {
    return this.issueTokenPair(
      user.id,
      user.email || `${user.id}@hasumane.local`,
      user.role as Role,
      request,
    );
  }

  async register(dto: RegisterDto, request: AuthenticatedRequest) {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: normalizedEmail }, { phone: dto.phone }] },
    });
    if (existing) {
      throw new BadRequestException("A user with this email or phone already exists.");
    }

    if (ADMIN_ROLES.has(dto.role) && request.user?.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException("Only super admins can create admin users.");
    }

    const passwordHash = await bcrypt.hash(dto.password, this.hashRounds);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: normalizedEmail,
        phone: dto.phone,
        passwordHash,
        role: dto.role,
        createdBy: request.user?.id,
        updatedBy: request.user?.id,
      },
    });

    const verificationToken = await this.createEmailVerificationToken(user.id);
    await this.writeAudit("register", "auth", user.id, request);

    return {
      user: this.sanitizeUser(user),
      verificationToken,
    };
  }

  async login(dto: LoginDto, request: AuthenticatedRequest) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email.toLowerCase().trim(), deletedAt: null },
    });
    if (!user?.passwordHash) {
      await this.writeLogin(null, "failed", request);
      throw new UnauthorizedException("Invalid credentials.");
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      await this.writeLogin(user.id, "failed", request, user.role);
      throw new UnauthorizedException("Invalid credentials.");
    }

    if (user.isBlocked) {
      await this.writeLogin(user.id, "blocked", request, user.role);
      throw new ForbiddenException("This account is blocked.");
    }

    if (user.twoFactorEnabled && ADMIN_ROLES.has(user.role as Role) && !dto.twoFactorCode) {
      throw new UnauthorizedException("Two-factor code is required.");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    await this.writeLogin(user.id, "success", request, user.role);

    const tokens = await this.issueTokenPair(user.id, user.email || "", user.role as Role, request);
    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refresh(refreshToken: string | undefined, request: AuthenticatedRequest) {
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token is required.");
    }

    const payload = await this.jwtService.verifyAsync<{
      sub: string;
      email: string;
      role: Role;
      sessionId: string;
      type: "refresh";
    }>(refreshToken, {
      secret: this.configService.getOrThrow<string>("app.jwt.refreshSecret"),
    });

    const session = await this.prisma.userSession.findFirst({
      where: {
        id: payload.sessionId,
        userId: payload.sub,
        revokedAt: null,
        deletedAt: null,
      },
      include: { user: true },
    });

    if (!session || session.expiresAt <= new Date()) {
      throw new UnauthorizedException("Refresh session is expired.");
    }

    const tokenMatches = await bcrypt.compare(refreshToken, session.refreshTokenHash);
    if (!tokenMatches || !session.user.email) {
      throw new UnauthorizedException("Refresh session is invalid.");
    }

    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date(), updatedBy: session.userId },
    });

    return this.issueTokenPair(session.user.id, session.user.email, session.user.role as Role, request);
  }

  async logout(sessionId: string | undefined, request: AuthenticatedRequest) {
    if (sessionId) {
      await this.prisma.userSession.updateMany({
        where: { id: sessionId, revokedAt: null },
        data: { revokedAt: new Date(), updatedBy: request.user?.id },
      });
    }
    await this.writeAudit("logout", "auth", sessionId, request);
    return { revoked: Boolean(sessionId) };
  }

  async profile(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isBlocked: true,
        emailVerifiedAt: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new UnauthorizedException("Profile is unavailable.");
    return user;
  }

  async updateProfile(
    userId: string,
    dto: { name?: string; phone?: string },
    request: AuthenticatedRequest,
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name?.trim(),
        phone: dto.phone,
        updatedBy: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerifiedAt: true,
        updatedAt: true,
      },
    });
    await this.writeAudit("update_profile", "auth", userId, request);
    return user;
  }

  async resendVerification(userId: string, request: AuthenticatedRequest) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
    if (!user) throw new UnauthorizedException("Profile is unavailable.");
    if (user.emailVerifiedAt) return { queued: false, alreadyVerified: true };
    const verificationToken = await this.createEmailVerificationToken(user.id);
    await this.writeAudit("resend_verification", "auth", user.id, request);
    return { queued: true, verificationToken };
  }

  async requestPasswordReset(email: string, request: AuthenticatedRequest) {
    const user = await this.prisma.user.findFirst({
      where: { email: email.toLowerCase().trim(), deletedAt: null },
    });
    if (!user) {
      return { queued: true };
    }

    const token = this.randomToken();
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: this.sha256(token),
        expiresAt: this.minutesFromNow(30),
      },
    });
    await this.writeAudit("request_password_reset", "auth", user.id, request);
    return { queued: true, resetToken: token };
  }

  async resetPassword(token: string, password: string, request: AuthenticatedRequest) {
    const tokenHash = this.sha256(token);
    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        consumedAt: null,
      },
      include: { user: true },
    });
    if (!resetToken || resetToken.expiresAt <= new Date()) {
      throw new BadRequestException("Password reset token is invalid or expired.");
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: {
          passwordHash: await bcrypt.hash(password, this.hashRounds),
          updatedBy: resetToken.userId,
        },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { consumedAt: new Date() },
      }),
      this.prisma.userSession.updateMany({
        where: { userId: resetToken.userId, revokedAt: null },
        data: { revokedAt: new Date(), updatedBy: resetToken.userId },
      }),
    ]);
    await this.writeAudit("reset_password", "auth", resetToken.userId, request);
    return { reset: true };
  }

  async verifyEmail(token: string, request: AuthenticatedRequest) {
    const tokenHash = this.sha256(token);
    const verificationToken = await this.prisma.emailVerificationToken.findFirst({
      where: { tokenHash, consumedAt: null },
    });
    if (!verificationToken || verificationToken.expiresAt <= new Date()) {
      throw new BadRequestException("Email verification token is invalid or expired.");
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerifiedAt: new Date(), updatedBy: verificationToken.userId },
      }),
      this.prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { consumedAt: new Date() },
      }),
    ]);
    await this.writeAudit("verify_email", "auth", verificationToken.userId, request);
    return { verified: true };
  }

  private async issueTokenPair(
    userId: string,
    email: string,
    role: Role,
    request: AuthenticatedRequest,
  ): Promise<TokenPair> {
    const csrfToken = this.randomToken();
    const session = await this.prisma.userSession.create({
      data: {
        userId,
        refreshTokenHash: "pending",
        csrfTokenHash: this.sha256(csrfToken),
        ipAddress: request.context?.ipAddress,
        userAgent: request.context?.userAgent,
        expiresAt: this.daysFromNow(7),
        createdBy: userId,
        updatedBy: userId,
      },
    });

    const accessTtl = this.jwtTtl("app.jwt.accessTtl");
    const refreshTtl = this.jwtTtl("app.jwt.refreshTtl");
    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email, role, sessionId: session.id, type: "access" },
      {
        secret: this.configService.getOrThrow<string>("app.jwt.accessSecret"),
        expiresIn: accessTtl,
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, email, role, sessionId: session.id, type: "refresh" },
      {
        secret: this.configService.getOrThrow<string>("app.jwt.refreshSecret"),
        expiresIn: refreshTtl,
      },
    );

    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { refreshTokenHash: await bcrypt.hash(refreshToken, this.hashRounds) },
    });

    return {
      accessToken,
      refreshToken,
      csrfToken,
      expiresIn: accessTtl,
    };
  }

  private jwtTtl(configKey: string): StringValue {
    return this.configService.getOrThrow<string>(configKey) as StringValue;
  }

  private async createEmailVerificationToken(userId: string) {
    const token = this.randomToken();
    await this.prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash: this.sha256(token),
        expiresAt: this.daysFromNow(1),
      },
    });
    return token;
  }

  private sanitizeUser(user: { passwordHash?: string | null; twoFactorSecret?: string | null }) {
    const { passwordHash: _passwordHash, twoFactorSecret: _twoFactorSecret, ...safeUser } = user;
    return safeUser;
  }

  private get hashRounds() {
    return this.configService.get<number>("app.passwordHashRounds") || 12;
  }

  private randomToken() {
    return randomBytes(32).toString("hex");
  }

  private sha256(value: string) {
    return createHash("sha256").update(value).digest("hex");
  }

  private daysFromNow(days: number) {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  private minutesFromNow(minutes: number) {
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  private async writeAudit(
    action: string,
    module: string,
    entityId: string | undefined,
    request: AuthenticatedRequest,
  ) {
    await this.auditLogService.record({
      userId: request.user?.id || entityId,
      action,
      module,
      entityType: "auth",
      entityId,
      metadata: {
        requestId: request.context?.requestId,
      },
      request,
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
