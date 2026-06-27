import "reflect-metadata";
import { Logger, ValidationPipe, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module.js";
async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        bufferLogs: true,
    });
    const configService = app.get(ConfigService);
    const port = configService.get("app.port") || 5000;
    const corsOrigins = configService.get("app.corsOrigins") || [];
    app.setGlobalPrefix("api");
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: "1",
    });
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
    });
    app.use(helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    }));
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const swaggerConfig = new DocumentBuilder()
        .setTitle("HasuMane Enterprise Backend API")
        .setDescription("Production-grade NestJS API with JWT auth, RBAC, Prisma, Redis, and Swagger.")
        .setVersion("1.0.0")
        .addBearerAuth()
        .addCookieAuth("access_token")
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api/docs", app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.get("/", (_request, response) => {
        response.json({
            service: "hasumane-api",
            status: "ok",
            message: "HasuMane backend is running.",
            docs: "/api/docs",
            health: "/api/v1/health/live",
            checkedAt: new Date().toISOString(),
        });
    });
    await app.listen(port, "0.0.0.0");
    Logger.log(`HasuMane NestJS API listening on http://localhost:${port}/api`, "Bootstrap");
    Logger.log(`Swagger docs available at http://localhost:${port}/api/docs`, "Bootstrap");
}
void bootstrap();
//# sourceMappingURL=main.js.map
