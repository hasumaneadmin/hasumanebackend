import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service.js";
export declare class CsrfGuard implements CanActivate {
    private readonly configService;
    private readonly reflector;
    private readonly prisma;
    constructor(configService: ConfigService, reflector: Reflector, prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private sha256;
    private safeEqual;
}
