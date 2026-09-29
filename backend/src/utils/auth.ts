import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET must be configured.");
  }
  return secret;
}

export type AuthUser = { id: string; email: string; role: string; name?: string; branch?: string | null; rollNo?: string | null };

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signUserToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name, branch: user.branch, rollNo: user.rollNo },
    getJwtSecret(),
    { expiresIn: "1d" }
  );
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.header("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }
  const token = header.slice(7).trim();
  if (!token) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    if (typeof payload !== "object" || payload === null) {
      res.status(401).json({ message: "Invalid token." });
      return;
    }
    const claims = payload as jwt.JwtPayload;
    if (typeof claims.id !== "string" || typeof claims.email !== "string" || typeof claims.role !== "string") {
      res.status(401).json({ message: "Invalid token." });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: claims.id },
      select: { id: true, email: true, role: true, name: true, branch: true, rollNo: true, isActive: true },
    });
    if (!user || !user.isActive || user.email !== claims.email || user.role !== claims.role) {
      res.status(401).json({ message: "Invalid token." });
      return;
    }

    req.user = { id: user.id, email: user.email, role: user.role, branch: user.branch, rollNo: user.rollNo };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token." });
  }
}