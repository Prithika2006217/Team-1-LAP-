// ---------------------------------------------------------------------------
// Tenzorce API — Express server entry point (BASE).
// ---------------------------------------------------------------------------
// This is the foundational server. It wires up security, rate limiting, CORS,
// the database and cache clients, and mounts placeholder routes. Interns add
// real controllers/routes per tab (dashboard, study, practice, assessment...).
// ---------------------------------------------------------------------------
import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { prisma } from "./lib/prisma";
import authRoutes from "./routes/auth.routes";
import studyRoutes from "./routes/study.routes";
import practiceRoutes from "./routes/practice.routes";
import examRoutes from "./routes/exam.routes";
import assessmentRoutes from "./routes/assessment.routes";
import generateTestRoutes from "./routes/generate-test.routes";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// --- Security headers (helmet) ------------------------------------------------
app.use(helmet());

// --- Body parsing -------------------------------------------------------------
app.use(express.json());

// --- CORS ---------------------------------------------------------------------
// Only allow the configured frontend origin to call this API.
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// --- Global rate limiter ------------------------------------------------------
// Protects against spam/DDoS: max 100 requests per 15 minutes per IP.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});
app.use(limiter);

// --- Cache client -------------------------------------------------------------
// Redis is temporarily disabled until REDIS_URL is configured with a valid URL.
// import { getRedis } from "./lib/redis";
// getRedis();

// --- Health check -------------------------------------------------------------
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "tenzorce-api" });
});

// --- Routes -------------------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/study", studyRoutes);
// Practice Arena: read endpoints + live exam engine (both under /api/practice).
app.use("/api/practice", practiceRoutes);
app.use("/api/practice", examRoutes);
// Assessment Center: read endpoints for student view.
app.use("/api/assessments", assessmentRoutes);
app.use("/api", generateTestRoutes);

// Keep API failures JSON even when parsing or middleware fails before a controller runs.
app.use((error: unknown, _req: Request, res: Response, _next: express.NextFunction) => {
  console.error("Unhandled API error:", error);
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal server error" });
});

// --- Start --------------------------------------------------------------------
const server = require.main === module
  ? app.listen(PORT, () => {
      console.log(`[tenzorce-api] listening on http://localhost:${PORT}`);
    })
  : undefined;

// --- Graceful shutdown --------------------------------------------------------
async function shutdown() {
  console.log("\n[tenzorce-api] shutting down...");
  await prisma.$disconnect();
  server?.close(() => process.exit(0));
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export { app };
