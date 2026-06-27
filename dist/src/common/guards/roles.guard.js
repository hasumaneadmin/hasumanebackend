var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLE_HIERARCHY } from "../constants/roles.js";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator.js";
import { ROLES_KEY } from "../decorators/roles.decorator.js";
let RolesGuard = class RolesGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic)
            return true;
        const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles?.length)
            return true;
        const request = context.switchToHttp().getRequest();
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
};
RolesGuard = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Reflector])
], RolesGuard);
export { RolesGuard };
//# sourceMappingURL=roles.guard.js.map