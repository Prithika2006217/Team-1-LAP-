// ---------------------------------------------------------------------------
// Auth routes.
// ---------------------------------------------------------------------------
// Signup stores a securely hashed password and returns the new user's id.
// ---------------------------------------------------------------------------
import { Router, Request, Response } from "express";
import { randomBytes, scryptSync } from "node:crypto";
import { prisma } from "../lib/prisma";

const router = Router();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

// POST /api/auth/signup
router.post("/signup", async (req: Request, res: Response) => {
  const { name, email, password } = req.body as {
    name?: unknown;
    email?: unknown;
    password?: unknown;
  };

  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    typeof email !== "string" ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    typeof password !== "string" ||
    password.length < 6
  ) {
    res.status(400).json({ message: "Name, valid email, and a password of at least 6 characters are required." });
    return;
  }

  try {
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash: hashPassword(password),
        role: "STUDENT",
      },
      select: { id: true, name: true, email: true, role: true },
    });

    res.status(201).json({ user });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      res.status(409).json({ message: "An account with that email already exists." });
      return;
    }
    console.error("Signup failed", error);
    res.status(500).json({ message: "Unable to create account." });
  }
});

// POST /api/auth/login — retained as a placeholder until real sign-in is wired.
router.post("/login", (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented — auth login is an intern task." });
});

export default router;
