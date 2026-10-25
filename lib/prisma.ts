import { PrismaClient } from "@prisma/client";

// Strip any quotes or extra text around the database address.
function cleanUrl(raw: string | undefined) {
  if (!raw) return undefined;
  const start = raw.search(/postgres(ql)?:\/\//);
  if (start === -1) return raw;
  return raw.slice(start).replace(/["'\s]+$/, "");
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ datasourceUrl: cleanUrl(process.env.DATABASE_URL) });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
