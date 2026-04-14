// Run `npx prisma generate` after setting DATABASE_URL to generate the typed client.
// Until then, this module exports a lazy-initialized client with a runtime require.

/* eslint-disable @typescript-eslint/no-explicit-any */
type PrismaClientType = any;

declare const globalThis: { _prisma?: PrismaClientType } & typeof global;

function getPrisma(): PrismaClientType {
  if (process.env.NODE_ENV === "production") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require("@prisma/client");
    return new PrismaClient();
  }
  if (!globalThis._prisma) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require("@prisma/client");
    globalThis._prisma = new PrismaClient({ log: ["query", "error", "warn"] });
  }
  return globalThis._prisma!;
}

export const prisma: PrismaClientType = getPrisma();
