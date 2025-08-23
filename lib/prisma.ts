import { PrismaClient } from "@prisma/client";

declare global {
  // this prevents exhausting your database connections in dev
  var prisma: PrismaClient;
}

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
