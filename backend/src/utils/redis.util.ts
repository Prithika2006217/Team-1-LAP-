// ---------------------------------------------------------------------------
// Redis exam-state cache helpers.
// ---------------------------------------------------------------------------
// WHY THIS EXISTS (read this, interns):
// During a LIVE exam the client auto-saves the candidate's answer every time
// they pick an option or edit code (debounced). With 1,000+ concurrent
// candidates that is a firehose of writes. If every keystroke hit Neon
// PostgreSQL we would exhaust the connection pool and melt write throughput.
//
// So we buffer live answers in Upstash Redis instead. Each in-progress exam is
// ONE Redis Hash:
//
//     key   = exam:${testId}:${userId}
//     field = questionId
//     value = the selected answer (string; JSON-encoded for multi-select)
//
// Writes are O(1) HSET calls that never touch Postgres. Only on final SUBMIT do
// we read the whole hash once, grade it, persist a single TestSubmission row,
// and delete the Redis key. This turns thousands of DB writes into one.
// ---------------------------------------------------------------------------
import { getRedis } from "../lib/redis";

/** Build the canonical Redis hash key for an in-progress exam. */
export function examKey(testId: string, userId: string): string {
  return `exam:${testId}:${userId}`;
}

/**
 * Buffer a single answer for a live exam. O(1), never touches PostgreSQL.
 * Returns false if Redis is unavailable so callers can decide how to respond.
 */
export async function saveExamAnswer(
  testId: string,
  userId: string,
  questionId: string,
  selectedAnswer: unknown
): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;

  const key = examKey(testId, userId);
  const value = typeof selectedAnswer === "string" ? selectedAnswer : JSON.stringify(selectedAnswer);

  await redis.hset(key, questionId, value);
  // Safety TTL: drop abandoned exams after 6 hours so Redis never leaks memory.
  await redis.expire(key, 60 * 60 * 6);
  return true;
}

/**
 * Read every buffered answer for an exam as a { questionId: answer } map.
 * Returns null if Redis is unavailable (caller falls back to the request body).
 */
export async function getExamAnswers(
  testId: string,
  userId: string
): Promise<Record<string, string> | null> {
  const redis = getRedis();
  if (!redis) return null;

  const answers = await redis.hgetall(examKey(testId, userId));
  return answers ?? {};
}

/** Delete an exam's buffered answers (called after a successful submit). */
export async function clearExamAnswers(testId: string, userId: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.del(examKey(testId, userId));
}
