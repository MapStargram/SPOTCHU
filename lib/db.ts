import { PrismaClient } from "@prisma/client";

// Prisma Client 싱글턴. dev의 HMR로 커넥션이 폭증하지 않도록 global에 캐시.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
