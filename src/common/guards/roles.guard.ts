import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLE_HIERARCHY, type Role } from "../constants/roles.js";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator.js";
import { ROLES_KEY } from "../decorators/roles.decorator.js";
import type { AuthenticatedRequest } from "../types/authenticated-request.js";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const role = request.user?.role;
    if (!role) {
      throw new ForbiddenException("Authenticated role is required.");
    }

    const userLevel = ROLE_HIERARCHY[role] ?? 0;
    const allowed = requiredRoles.some((requiredRole) => userLevel >= ROLE_HIERARCHY[requiredRole]);
    if (!allowed) {
      throw new ForbiddenException("Insufficient role permissions.");
    }
    return true;
  }
}
