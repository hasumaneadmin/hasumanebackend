import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator.js";
import type { Role } from "../constants/roles.js";
import type { AuthenticatedRequest } from "../types/authenticated-request.js";

type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
  sessionId: string;
  type: "access" | "refresh";
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException("Missing access token.");
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>("app.jwt.accessSecret"),
      });
      if (payload.type !== "access") {
        throw new UnauthorizedException("Invalid token type.");
      }
      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        sessionId: payload.sessionId,
      };
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired access token.");
    }
  }

  private extractToken(request: AuthenticatedRequest) {
    const authHeader = request.header("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      return authHeader.slice(7);
    }
    return request.signedCookies?.access_token || request.cookies?.access_token;
  }
}
