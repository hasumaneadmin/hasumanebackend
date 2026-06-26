import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import envConfig from "./config/env.js";
import { RedisService } from "./config/redis.service.js";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter.js";
import { CsrfGuard } from "./common/guards/csrf.guard.js";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard.js";
import { RolesGuard } from "./common/guards/roles.guard.js";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor.js";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor.js";
import { RequestContextMiddleware } from "./common/middleware/request-context.middleware.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { AdminSessionModule } from "./modules/admin-session/admin-session.module.js";
import { AdminModule } from "./modules/admin/admin.module.js";
import { AnalyticsModule } from "./modules/analytics/analytics.module.js";
import { AuditLogModule } from "./modules/audit/audit-log.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { CatalogModule } from "./modules/catalog/catalog.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { InventoryModule } from "./modules/inventory/inventory.module.js";
import { LoggingModule } from "./modules/logging/logging.module.js";
import { PinoHttpMiddleware } from "./modules/logging/pino-http.middleware.js";
import { MonitoringModule } from "./modules/monitoring/monitoring.module.js";
import { NotificationModule } from "./modules/notifications/notification.module.js";
import { OperationsModule } from "./modules/operations/operations.module.js";
import { OrdersModule } from "./modules/orders/orders.module.js";
import { RbacModule } from "./modules/rbac/rbac.module.js";
import { ResourcesModule } from "./modules/resources/resources.module.js";
import { UsersModule } from "./modules/users/users.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
      cache: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 240,
      },
    ]),
    PrismaModule,
    AuditLogModule,
    AuthModule,
    AdminSessionModule,
    CatalogModule,
    OrdersModule,
    InventoryModule,
    AnalyticsModule,
    NotificationModule,
    LoggingModule,
    MonitoringModule,
    OperationsModule,
    AdminModule,
    UsersModule,
    RbacModule,
    ResourcesModule,
    HealthModule,
  ],
  providers: [
    RedisService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: CsrfGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware, PinoHttpMiddleware).forRoutes("*path");
  }
}
