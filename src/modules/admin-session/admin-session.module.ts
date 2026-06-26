import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { AdminSessionController } from "./admin-session.controller.js";
import { AdminSessionService } from "./admin-session.service.js";

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [AdminSessionController],
  providers: [AdminSessionService],
})
export class AdminSessionModule {}
