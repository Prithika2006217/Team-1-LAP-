// ---------------------------------------------------------------------------
// Exam engine controllers — high-concurrency auto-save & grading.
// ---------------------------------------------------------------------------
// autosave: buffers a single answer in Redis. Returns immediately. No Postgres.
// submit:   grades the buffered answers against Neon, persists ONE row in a
//           transaction, updates points/streak, clears the Redis buffer.
// See utils/redis.util.ts for why we buffer in Redis.
// ---------------------------------------------------------------------------
import { Request, Response } from "express";
import { QuestionType } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { getExamAnswers, saveExamAnswer, clearExamAnswers } from "../utils/redis.util";

// POST /api/practice/autosave
// Body: { userId, testId, questionId, selectedAnswer }
export async function autosave(req: Request, res: Response) {
  const { userId, testId, questionId, selectedAnswer } = req.body ?? {};

  if (!userId || !testId || !questionId) {
    return res.status(400).json({ message: "userId, testId and questionId are required." });
  }

  const saved = await saveExamAnswer(testId, userId, questionId, selectedAnswer);
  if (!saved) {
    // Redis unavailable — tell the client so it can retry / fall back to submit body.
    return res.status(503).json({ status: "unavailable", message: "Cache not available." });
  }

  // Return instantly. We never touched PostgreSQL.
  res.json({ status: "saved", timestamp: new Date().toISOString() });
}

// POST /api/practice/submit
// Body: { userId, testId, answers? }  (answers is the fallback if Redis is empty)
export async function submit(req: Request, res: Response) {
  const { userId, testId } = req.body ?? {};
  const bodyAnswers: Record<string, string> = req.body?.answers ?? {};

  if (!userId || !testId) {
    return res.status(400).json({ message: "userId and testId are required." });
  }

  // 1) Prefer Redis-buffered answers; fall back to the request body.
  const cached = await getExamAnswers(testId, userId);
  const answers = cached && Object.keys(cached).length > 0 ? cached : bodyAnswers;

  // 2) Load the answer keys from Neon (server-side source of truth).
  const questions = await prisma.question.findMany({
    where: { section: { testId } },
    select: { id: true, type: true, correctAnswer: true, marks: true, negativeMarks: true },
  });

  if (questions.length === 0) {
    return res.status(404).json({ message: "Test has no questions or does not exist." });
  }

  // 3) Grade. Only objective questions with a key are auto-graded; coding/
  //    pseudocode questions are left for later manual/automated evaluation.
  let score = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let gradableMarks = 0;

  for (const q of questions) {
    if (!q.correctAnswer || q.type === QuestionType.CODING || q.type === QuestionType.PSEUDOCODE) {
      continue;
    }
    gradableMarks += q.marks;

    const given = answers[q.id];
    if (given === undefined || given === null || given === "") continue; // unanswered

    if (isCorrect(q.type, given, q.correctAnswer)) {
      score += q.marks;
      correctCount += 1;
    } else {
      score -= q.negativeMarks;
      incorrectCount += 1;
    }
  }

  score = Math.max(0, Number(score.toFixed(2)));
  const percentage = gradableMarks > 0 ? Number(((score / gradableMarks) * 100).toFixed(2)) : 0;
  const earnedPoints = Math.round(score);

  // 4) Persist everything atomically, then clear the buffer.
  const submission = await prisma.$transaction(async (tx) => {
    const created = await tx.testSubmission.create({
      data: { userId, testId, score, correctCount, incorrectCount, percentage, answers },
      select: { id: true, score: true, correctCount: true, incorrectCount: true, percentage: true, createdAt: true },
    });

    // Update points and rolling streak on the User row.
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { lastActivityAt: true, currentStreak: true },
    });
    const nextStreak = computeNextStreak(user?.lastActivityAt ?? null, user?.currentStreak ?? 0);

    await tx.user.update({
      where: { id: userId },
      data: {
        points: { increment: earnedPoints },
        currentStreak: nextStreak,
        lastActivityAt: new Date(),
      },
    });

    // Bump the denormalized attempts counter for the catalog label.
    await tx.test.update({ where: { id: testId }, data: { attempts: { increment: 1 } } });

    return created;
  });

  await clearExamAnswers(testId, userId);

  res.json({
    status: "submitted",
    result: { ...submission, earnedPoints, totalQuestions: questions.length },
  });
}

// --- grading helpers ---------------------------------------------------------
function isCorrect(type: QuestionType, given: string, key: string): boolean {
  if (type === QuestionType.MULTIPLE_SELECT) {
    // Compare as order-independent sets.
    return setEqual(parseArray(given), parseArray(key));
  }
  return given.trim() === key.trim();
}

function parseArray(v: string): string[] {
  try {
    const parsed = JSON.parse(v);
    if (Array.isArray(parsed)) return parsed.map(String).sort();
  } catch {
    // fall through — treat as a single value
  }
  return [v];
}

function setEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

// If last activity was yesterday -> continue streak. Today -> unchanged.
// Otherwise (or never) -> reset to 1.
function computeNextStreak(lastActivityAt: Date | null, currentStreak: number): number {
  if (!lastActivityAt) return 1;
  const last = new Date(lastActivityAt);
  last.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - last.getTime()) / 86_400_000);

  if (diffDays === 0) return Math.max(1, currentStreak);
  if (diffDays === 1) return currentStreak + 1;
  return 1;
}
