// ---------------------------------------------------------------------------
// Prisma client singleton.
// ---------------------------------------------------------------------------
// A single PrismaClient instance is shared across the app. Creating a new
// client per request would exhaust the database connection pool under load.
// ---------------------------------------------------------------------------
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "production" ? ["error"] : ["query", "error", "warn"],
});
