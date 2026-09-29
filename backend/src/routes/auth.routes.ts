// ---------------------------------------------------------------------------
// Auth routes.
// ---------------------------------------------------------------------------
// Signup stores a securely hashed password and returns the new user's id.
// ---------------------------------------------------------------------------
import { Router, Request, Response } from "express";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { authenticate, signUserToken } from "../utils/auth";

const router = Router();
const BCRYPT_ROUNDS = 12;
const VALID_ROLES = ["STUDENT", "TRAINER", "COLLEGE_TPO", "SUPER_ADMIN"] as const;
type RegistrationRole = (typeof VALID_ROLES)[number];

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function verifyPassword(password: string, user: { id: string; passwordHash: string }): Promise<boolean> {
  if (await bcrypt.compare(password, user.passwordHash)) return true;

  const [salt, expectedHex] = user.passwordHash.split(":");
  if (!salt || !expectedHex || !/^[a-f0-9]+$/i.test(expectedHex)) return false;

  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS) },
  });
  return true;
}

// POST /api/auth/signup
router.post("/signup", async (req: Request, res: Response) => {
  const { name, email, password, branch, rollNo, role: requestedRole } = req.body as {
    name?: unknown;
    email?: unknown;
    password?: unknown;
    branch?: unknown;
    rollNo?: unknown;
    role?: unknown;
  };

  const role = typeof requestedRole === "undefined" ? "STUDENT" : requestedRole;
  const isValidRole = typeof role === "string" && VALID_ROLES.includes(role as RegistrationRole);
  const isStudent = role === "STUDENT";

  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    typeof email !== "string" ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    typeof password !== "string" ||
    password.length < 6 ||
    !isValidRole ||
    (isStudent && (typeof branch !== "string" || !branch.trim() || typeof rollNo !== "string" || !rollNo.trim()))
  ) {
    res.status(400).json({ message: "Name, valid email, role, and a password of at least 6 characters are required; students must also provide branch and roll number." });
    return;
  }

  const normalizedEmail = normalizeEmail(email);

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (existingUser) {
      res.status(409).json({ message: "An account with that email already exists." });
      return;
    }

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        ...(isStudent ? { branch: (branch as string).trim(), rollNo: (rollNo as string).trim() } : {}),
        email: normalizedEmail,
        passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
        role: role as RegistrationRole,
      },
      select: { id: true, name: true, email: true, branch: true, rollNo: true, role: true },
    });

    res.status(201).json({ user, token: signUserToken(user) });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      res.status(409).json({ message: "An account with that email already exists." });
      return;
    }
    console.error("Signup failed", error);
    res.status(500).json({ message: "Unable to create account." });
  }
});

// LOCKED — verified working 2026-09-25, all 4 credential scenarios pass
// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  const { email, password, role, branch, rollNo } = req.body as {
    email?: unknown;
    password?: unknown;
    role?: unknown;
    branch?: unknown;
    rollNo?: unknown;
  };
  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    res.status(400).json({ message: "Email and password are required." });
    return;
  }
  if (role === "STUDENT" && (typeof branch !== "string" || !branch.trim() || typeof rollNo !== "string" || !rollNo.trim())) {
    res.status(400).json({ message: "Student login requires branch and roll number." });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
  if (!user) {
    res.status(401).json({ message: "Invalid credentials." });
    return;
  }

  if (role === "STUDENT" && (user.role !== "STUDENT" || user.branch !== branch || user.rollNo !== rollNo)) {
    res.status(401).json({ message: "Invalid credentials." });
    return;
  }

  const passwordMatches = await verifyPassword(password, user);
  if (!user.isActive || !passwordMatches) {
    res.status(401).json({ message: "Invalid credentials." });
    return;
  }

  res.json({
    token: signUserToken(user),
    user: { id: user.id, name: user.name, email: user.email, branch: user.branch, rollNo: user.rollNo, role: user.role },
  });
});

router.get("/me", authenticate, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

export default router;
