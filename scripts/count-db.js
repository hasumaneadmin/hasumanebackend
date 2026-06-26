import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const subs = await prisma.subscription.groupBy({
    by: ['status'],
    _count: { _all: true }
  });
  console.log("Subscriptions by status:", subs);
}
main().catch(console.error).finally(() => prisma.$disconnect());
