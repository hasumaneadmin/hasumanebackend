import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

type PrismaQueryEmitter = {
  $on(event: "query", callback: () => void): void;
};

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private queryCount = 0;

  constructor() {
    super({
      log: [{ emit: "event", level: "query" }],
    });
    (this as unknown as PrismaQueryEmitter).$on("query", () => {
      this.queryCount += 1;
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log("Connected to PostgreSQL through Prisma.");
    } catch (error: any) {
      this.logger.error(`Failed to connect to PostgreSQL: ${error.message}`);
      this.logger.warn("NestJS server started, but database-dependent features will be unavailable.");
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  getQueryCount() {
    return this.queryCount;
  }
}
