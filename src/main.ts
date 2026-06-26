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
  const port = configService.get<number>("app.port") || 5000;
  const corsOrigins = configService.get<string[]>("app.corsOrigins") || [];
  const cookieSecret = configService.getOrThrow<string>("app.cookieSecret");

  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(cookieParser(cookieSecret));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

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

  await app.listen(port, "0.0.0.0");
  Logger.log(`HasuMane NestJS API listening on http://localhost:${port}/api`, "Bootstrap");
  Logger.log(`Swagger docs available at http://localhost:${port}/api/docs`, "Bootstrap");
}

void bootstrap();
