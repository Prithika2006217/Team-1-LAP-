// ---------------------------------------------------------------------------
// Practice Arena controllers.
// ---------------------------------------------------------------------------
// Read endpoints for the Practice Arena. Payloads are kept small with Prisma
// `select` — crucially, answer keys are NEVER included in anything a candidate
// can fetch.
// ---------------------------------------------------------------------------
import { Request, Response } from "express";
import { Prisma, TestCategory, Difficulty } from "@prisma/client";
import { prisma } from "../lib/prisma";

// GET /api/practice/tests?category=CODING&difficulty=MEDIUM
// Lightweight catalog. Excludes sections/questions/answer keys entirely.
export async function getTests(req: Request, res: Response) {
  const { category, difficulty } = req.query;

  const where: Prisma.TestWhereInput = { isActive: true };
  if (category && category !== "ALL" && isTestCategory(String(category))) {
    where.category = String(category) as TestCategory;
  }
  if (difficulty && isDifficulty(String(difficulty))) {
    where.difficulty = String(difficulty) as Difficulty;
  }

  const tests = await prisma.test.findMany({
    where,
    // Only the fields the card needs — no heavy relations.
    select: {
      id: true,
      title: true,
      category: true,
      difficulty: true,
      company: true,
      durationMinutes: true,
      questionCount: true,
      attempts: true,
    },
    orderBy: { attempts: "desc" },
  });

  res.json({ tests });
}

// GET /api/practice/leaderboard  — top 5 users by points.
export async function getLeaderboard(_req: Request, res: Response) {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, points: true },
    orderBy: { points: "desc" },
    take: 5,
  });

  const leaderboard = users.map((u, i) => ({ ...u, rank: i + 1 }));
  res.json({ leaderboard });
}

// GET /api/practice/streak/:userId  — 7-day activity as a boolean array.
// Index 0 = 6 days ago ... index 6 = today (Mon–Sun style rolling window).
export async function getStreak(req: Request, res: Response) {
  const { userId } = req.params;

  // Start of the day 6 days ago (inclusive of today = 7 days total).
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);

  const submissions = await prisma.testSubmission.findMany({
    where: { userId, createdAt: { gte: start } },
    select: { createdAt: true },
  });

  // Bucket submissions into per-day "did something" flags.
  const doneByDay = new Set<string>();
  for (const s of submissions) {
    doneByDay.add(dayKey(s.createdAt));
  }

  const days: { label: string; date: string; completed: boolean }[] = [];
  const streak: boolean[] = [];
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const completed = doneByDay.has(dayKey(d));
    days.push({ label: weekday[d.getDay()], date: dayKey(d), completed });
    streak.push(completed);
  }

  res.json({ userId, streak, days });
}

// GET /api/practice/tests/:id  — full blueprint WITHOUT correct answer keys.
export async function getTestById(req: Request, res: Response) {
  const { id } = req.params;

  const test = await prisma.test.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      category: true,
      difficulty: true,
      durationMinutes: true,
      sections: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          order: true,
          timeLimitMinutes: true,
          questions: {
            orderBy: { order: "asc" },
            // NOTE: `correctAnswer` is intentionally omitted.
            select: {
              id: true,
              type: true,
              prompt: true,
              difficulty: true,
              options: true,
              marks: true,
              negativeMarks: true,
              order: true,
            },
          },
        },
      },
    },
  });

  if (!test) {
    return res.status(404).json({ message: "Test not found." });
  }

  res.json({ test });
}

// --- helpers -----------------------------------------------------------------
function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function isTestCategory(v: string): v is TestCategory {
  return (Object.values(TestCategory) as string[]).includes(v);
}
function isDifficulty(v: string): v is Difficulty {
  return (Object.values(Difficulty) as string[]).includes(v);
}
