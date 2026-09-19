// ---------------------------------------------------------------------------
// Auth routes (BASE placeholder).
// ---------------------------------------------------------------------------
// Only the route shells exist. Interns implement real auth here:
//   - validate credentials against the User table (Prisma)
//   - verify password hash (bcrypt/argon2)
//   - sign a JWT with JWT_SECRET
// ---------------------------------------------------------------------------
import { Router, Request, Response } from "express";

const router = Router();

// POST /api/auth/login  — placeholder
router.post("/login", (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented — auth login is an intern task." });
});

export default router;
