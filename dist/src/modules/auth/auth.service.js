var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BadRequestException, Injectable, UnauthorizedException, ForbiddenException, } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { randomBytes, createHash } from "node:crypto";
import { Role } from "../../common/constants/roles.js";
import { bcrypt } from "../../common/utils/bcrypt.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { AuditLogService } from "../audit/audit-log.service.js";
const ADMIN_ROLES = new Set([Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.SUPPORT]);
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    auditLogService;
    constructor(prisma, jwtService, configService, auditLogService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.auditLogService = auditLogService;
    }
    createSessionForUser(user, request) {
        return this.issueTokenPair(user.id, user.email || `${user.id}@hasumane.local`, user.role, request);
    }
    async register(dto, request) {
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
    async login(dto, request) {
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
        if (user.twoFactorEnabled && ADMIN_ROLES.has(user.role) && !dto.twoFactorCode) {
            throw new UnauthorizedException("Two-factor code is required.");
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        await this.writeLogin(user.id, "success", request, user.role);
        const tokens = await this.issueTokenPair(user.id, user.email || "", user.role, request);
        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }
    async refresh(refreshToken, request) {
        if (!refreshToken) {
            throw new UnauthorizedException("Refresh token is required.");
        }
        const payload = await this.jwtService.verifyAsync(refreshToken, {
            secret: this.configService.getOrThrow("app.jwt.refreshSecret"),
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
        return this.issueTokenPair(session.user.id, session.user.email, session.user.role, request);
    }
    async logout(sessionId, request) {
        if (sessionId) {
            await this.prisma.userSession.updateMany({
                where: { id: sessionId, revokedAt: null },
                data: { revokedAt: new Date(), updatedBy: request.user?.id },
            });
        }
        await this.writeAudit("logout", "auth", sessionId, request);
        return { revoked: Boolean(sessionId) };
    }
    async profile(userId) {
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
        if (!user)
            throw new UnauthorizedException("Profile is unavailable.");
        return user;
    }
    async updateProfile(userId, dto, request) {
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
    async resendVerification(userId, request) {
        const user = await this.prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
        if (!user)
            throw new UnauthorizedException("Profile is unavailable.");
        if (user.emailVerifiedAt)
            return { queued: false, alreadyVerified: true };
        const verificationToken = await this.createEmailVerificationToken(user.id);
        await this.writeAudit("resend_verification", "auth", user.id, request);
        return { queued: true, verificationToken };
    }
    async requestPasswordReset(email, request) {
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
    async resetPassword(token, password, request) {
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
    async verifyEmail(token, request) {
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
    async issueTokenPair(userId, email, role, request) {
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
        const accessToken = await this.jwtService.signAsync({ sub: userId, email, role, sessionId: session.id, type: "access" }, {
            secret: this.configService.getOrThrow("app.jwt.accessSecret"),
            expiresIn: accessTtl,
        });
        const refreshToken = await this.jwtService.signAsync({ sub: userId, email, role, sessionId: session.id, type: "refresh" }, {
            secret: this.configService.getOrThrow("app.jwt.refreshSecret"),
            expiresIn: refreshTtl,
        });
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
    jwtTtl(configKey) {
        return this.configService.getOrThrow(configKey);
    }
    async createEmailVerificationToken(userId) {
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
    sanitizeUser(user) {
        const { passwordHash: _passwordHash, twoFactorSecret: _twoFactorSecret, ...safeUser } = user;
        return safeUser;
    }
    get hashRounds() {
        return this.configService.get("app.passwordHashRounds") || 12;
    }
    randomToken() {
        return randomBytes(32).toString("hex");
    }
    sha256(value) {
        return createHash("sha256").update(value).digest("hex");
    }
    daysFromNow(days) {
        return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }
    minutesFromNow(minutes) {
        return new Date(Date.now() + minutes * 60 * 1000);
    }
    async writeAudit(action, module, entityId, request) {
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
    async writeLogin(userId, status, request, role) {
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
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        JwtService,
        ConfigService,
        AuditLogService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map