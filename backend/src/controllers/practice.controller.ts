import { Request, Response } from "express";
import { Difficulty, QuestionType, TestCategory } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { generatePracticeQuestions } from "../services/llm.service";

type DifficultyName = "EASY" | "MEDIUM" | "HARD";

type GeneratedQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
};

type TestFilter = {
  isActive: boolean;
  category?: TestCategory;
  difficulty?: Difficulty;
};

const DIFFICULTY_MAP: Record<DifficultyName, Difficulty> = {
  EASY: Difficulty.EASY,
  MEDIUM: Difficulty.MEDIUM,
  HARD: Difficulty.HARD,
};

// POST /api/generate-test
export async function generateTest(req: Request, res: Response) {
  const topic = typeof req.body?.topic === "string" ? req.body.topic.trim() : "";

  if (!topic || topic.length > 100) {
    return res.status(400).json({ error: "Topic is required and must be 100 characters or fewer." });
  }

  try {
    const questions = await generatePracticeQuestions(topic);

    if (questions.length !== 90) {
      throw new Error(`Question generator returned ${questions.length} questions.`);
    }

    return res.json({ topic, questions });
  } catch (error) {
    console.error("generateTest error:", error);
    return res.status(500).json({ error: "Failed to generate test" });
  }
}

// ---------------------------------------------------------------------------
// GET /api/practice/tests
// ---------------------------------------------------------------------------

export async function getTests(req: Request, res: Response) {
  try {
    const { category, difficulty } = req.query;

    const where: TestFilter = {
      isActive: true,
    };

    if (category && category !== "ALL" && isTestCategory(String(category))) {
      where.category = String(category) as TestCategory;
    }

    if (difficulty && isDifficulty(String(difficulty))) {
      where.difficulty = String(difficulty) as Difficulty;
    }

    const tests = await prisma.test.findMany({
      where,
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
      orderBy: {
        attempts: "desc",
      },
    });

    return res.json({ tests });
  } catch (error) {
    console.error("getTests error:", error);
    return res.status(500).json({
      message: "Unable to load practice tests.",
    });
  }
}

// ---------------------------------------------------------------------------
// GET /api/practice/leaderboard
// ---------------------------------------------------------------------------

export async function getLeaderboard(_req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        points: true,
      },
      orderBy: {
        points: "desc",
      },
      take: 5,
    });

    const leaderboard = users.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    return res.json({ leaderboard });
  } catch (error) {
    console.error("getLeaderboard error:", error);
    return res.status(500).json({
      message: "Unable to load leaderboard.",
    });
  }
}

// ---------------------------------------------------------------------------
// GET /api/practice/streak/:userId
// ---------------------------------------------------------------------------

export async function getStreak(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);

    const submissions = await prisma.testSubmission.findMany({
      where: {
        userId,
        createdAt: {
          gte: start,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const doneByDay = new Set<string>();

    for (const submission of submissions) {
      doneByDay.add(dayKey(submission.createdAt));
    }

    const days: Array<{ label: string; date: string; completed: boolean }> = [];
    const streak: boolean[] = [];
    const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      const completed = doneByDay.has(dayKey(date));
      days.push({
        label: weekday[date.getDay()],
        date: dayKey(date),
        completed,
      });
      streak.push(completed);
    }

    return res.json({ userId, streak, days });
  } catch (error) {
    console.error("getStreak error:", error);
    return res.status(500).json({
      message: "Unable to load streak.",
    });
  }
}

// ---------------------------------------------------------------------------
// GET /api/practice/tests/:id
// ---------------------------------------------------------------------------

export async function getTestById(req: Request, res: Response) {
  try {
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
          orderBy: {
            order: "asc",
          },
          select: {
            id: true,
            title: true,
            order: true,
            timeLimitMinutes: true,
            questions: {
              orderBy: {
                order: "asc",
              },
              select: {
                id: true,
                type: true,
                difficulty: true,
                prompt: true,
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
      return res.status(404).json({
        message: "Test not found.",
      });
    }

    return res.json({ test });
  } catch (error) {
    console.error("getTestById error:", error);
    return res.status(500).json({
      message: "Unable to load test.",
    });
  }
}

// ---------------------------------------------------------------------------
// POST /api/practice/generate
// ---------------------------------------------------------------------------

export async function generatePracticeTest(req: Request, res: Response) {
  const topic = typeof req.body?.topic === "string" ? req.body.topic.trim() : "";

  if (!topic) {
    return res.status(400).json({
      message: "Please enter a topic.",
    });
  }

  if (topic.length > 120) {
    return res.status(400).json({
      message: "Topic is too long.",
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      message:
        "Question generation is not configured. Add GEMINI_API_KEY to the backend environment.",
    });
  }

  try {
    console.log(`Generating 90 questions for topic: ${topic}`);

    const seenPrompts = new Set<string>();

    const easyBatch = await generateDifficultyQuestions(topic, "EASY", apiKey, seenPrompts);
    const easy = dedupeByPrompt(easyBatch, seenPrompts);

    if (easy.length !== 30) {
      throw new Error(
        `Gemini returned ${easy.length} EASY questions instead of exactly 30.`
      );
    }

    const mediumBatch = await generateDifficultyQuestions(topic, "MEDIUM", apiKey, seenPrompts);
    const medium = dedupeByPrompt(mediumBatch, seenPrompts);

    if (medium.length !== 30) {
      throw new Error(
        `Gemini returned ${medium.length} MEDIUM questions instead of exactly 30.`
      );
    }

    const hardBatch = await generateDifficultyQuestions(topic, "HARD", apiKey, seenPrompts);
    const hard = dedupeByPrompt(hardBatch, seenPrompts);

    if (hard.length !== 30) {
      throw new Error(
        `Gemini returned ${hard.length} HARD questions instead of exactly 30.`
      );
    }

    const test = await prisma.$transaction(async (tx) => {
      return tx.test.create({
        data: {
          title: `${topic} - AI Practice Test`,
          category: TestCategory.DSA,
          difficulty: Difficulty.MEDIUM,
          durationMinutes: 90,
          questionCount: 90,
          attempts: 0,
          isActive: true,
          sections: {
            create: [
              {
                title: "Easy",
                order: 1,
                timeLimitMinutes: 30,
                questions: {
                  create: easy.map((question, index) => ({
                    type: QuestionType.MCQ,
                    difficulty: Difficulty.EASY,
                    prompt: question.question,
                    options: question.options.map((text, optionIndex) => ({
                      id: String.fromCharCode(65 + optionIndex),
                      label: String.fromCharCode(65 + optionIndex),
                      text: text.trim(),
                    })),
                    correctAnswer: String.fromCharCode(65 + question.correctAnswer),
                    marks: 1,
                    negativeMarks: 0,
                    order: index + 1,
                  })),
                },
              },
              {
                title: "Medium",
                order: 2,
                timeLimitMinutes: 30,
                questions: {
                  create: medium.map((question, index) => ({
                    type: QuestionType.MCQ,
                    difficulty: Difficulty.MEDIUM,
                    prompt: question.question,
                    options: question.options.map((text, optionIndex) => ({
                      id: String.fromCharCode(65 + optionIndex),
                      label: String.fromCharCode(65 + optionIndex),
                      text: text.trim(),
                    })),
                    correctAnswer: String.fromCharCode(65 + question.correctAnswer),
                    marks: 1,
                    negativeMarks: 0,
                    order: index + 1,
                  })),
                },
              },
              {
                title: "Hard",
                order: 3,
                timeLimitMinutes: 30,
                questions: {
                  create: hard.map((question, index) => ({
                    type: QuestionType.MCQ,
                    difficulty: Difficulty.HARD,
                    prompt: question.question,
                    options: question.options.map((text, optionIndex) => ({
                      id: String.fromCharCode(65 + optionIndex),
                      label: String.fromCharCode(65 + optionIndex),
                      text: text.trim(),
                    })),
                    correctAnswer: String.fromCharCode(65 + question.correctAnswer),
                    marks: 1,
                    negativeMarks: 0,
                    order: index + 1,
                  })),
                },
              },
            ],
          },
        },
        select: {
          id: true,
          title: true,
        },
      });
    });

    return res.status(201).json({
      testId: test.id,
      title: test.title,
      topic,
      totalQuestions: 90,
      counts: {
        easy: 30,
        medium: 30,
        hard: 30,
      },
    });
  } catch (error) {
    console.error("Practice test generation error:", error);
    return res.status(502).json({
      message:
        error instanceof Error
          ? error.message
          : "Unable to generate the practice test right now. Please try again.",
    });
  }
}

// ---------------------------------------------------------------------------
// Generate 30 questions for one difficulty
// ---------------------------------------------------------------------------

async function generateDifficultyQuestions(
  topic: string,
  difficulty: DifficultyName,
  apiKey: string,
  excludedPrompts: Set<string>
): Promise<GeneratedQuestion[]> {
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  const difficultyDescriptions: Record<DifficultyName, string> = {
    EASY: "beginner level, testing basic concepts and simple applications",
    MEDIUM: "intermediate level, requiring understanding and moderate reasoning",
    HARD: "advanced level, requiring deeper reasoning, edge cases, and application",
  };

  const excluded = [...excludedPrompts].slice(-90);
  const prompt = `
Generate EXACTLY 30 multiple-choice questions about "${topic}".

Difficulty: ${difficulty}

Difficulty requirements:
- ${difficultyDescriptions[difficulty]}
- Every question must genuinely match the requested difficulty.
- Do not repeat questions.
- Do not create trivial variations of the same question.
- Cover different subtopics where possible.
- Do not use any of these existing prompts, even with minor wording changes:
${excluded.length > 0 ? excluded.map((item) => `- ${item}`).join("\n") : "- None"}

Each question MUST:
- have exactly 4 options
- each option must have id and label exactly "A", "B", "C", and "D" in order
- have exactly one correct answer
- have a correctAnswer of exactly "A", "B", "C", or "D"
- be technically accurate
- be answerable from the question itself

Return ONLY valid JSON.

Required format:
[
  {
    "prompt": "Question text",
    "options": [
      { "id": "A", "label": "A", "text": "Option A" },
      { "id": "B", "label": "B", "text": "Option B" },
      { "id": "C", "label": "C", "text": "Option C" },
      { "id": "D", "label": "D", "text": "Option D" }
    ],
    "correctAnswer": "A"
  }
]

Do NOT return:
- markdown
- code fences
- explanations
- numbering outside JSON
- additional fields
`;

  let lastFailure = "";

  for (let attempt = 1; attempt <= 2; attempt++) {
    const response = await generateWithRetry(model, apiKey, prompt, 3);

    if (!response) {
      lastFailure = `Gemini was unavailable while generating ${difficulty} questions.`;
      continue;
    }

    const payload = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const content = payload.candidates
      ?.map((candidate) => candidate.content?.parts?.map((part) => part.text || "").join("") || "")
      .join("")
      .trim();
    const questions = parseGeneratedQuestions(content || "");
    const uniqueQuestions = questions
      ? dedupeByPrompt(questions, new Set(excludedPrompts))
      : [];

    if (uniqueQuestions.length === 30) {
      return uniqueQuestions;
    }

    lastFailure = `Gemini returned ${uniqueQuestions.length} new ${difficulty} questions instead of exactly 30.`;
  }

  throw new Error(lastFailure);
}

// ---------------------------------------------------------------------------
// Gemini request with retry
// ---------------------------------------------------------------------------

async function generateWithRetry(
  model: string,
  apiKey: string,
  prompt: string,
  retries: number
): Promise<globalThis.Response | null> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          model
        )}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (response.ok) {
        return response;
      }

      const errorText = await response.text();
      lastError = new Error(`Gemini returned ${response.status}: ${errorText}`);
      console.error(lastError);
    } catch (error) {
      lastError = error;
      console.error(`Gemini request attempt ${attempt + 1} failed:`, error);
    }

    if (attempt < retries - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
    }
  }

  console.error("Gemini request failed after retries:", lastError);
  return null;
}

// ---------------------------------------------------------------------------
// Parse Gemini JSON
// ---------------------------------------------------------------------------

function parseGeneratedQuestions(raw: string): GeneratedQuestion[] | null {
  try {
    let cleaned = raw.trim();

    cleaned = cleaned
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const firstBracket = cleaned.indexOf("[");
    const lastBracket = cleaned.lastIndexOf("]");

    if (firstBracket === -1 || lastBracket === -1 || lastBracket <= firstBracket) {
      return null;
    }

    cleaned = cleaned.slice(firstBracket, lastBracket + 1);
    const parsed = JSON.parse(cleaned) as unknown;

    if (!Array.isArray(parsed)) {
      return null;
    }

    const normalized = parsed.map((item) => normalizeGeneratedQuestion(item));
    if (normalized.some((item): item is null => item === null)) {
      return null;
    }

    const mapped = normalized.filter((item): item is GeneratedQuestion => item !== null);
    const unique = new Set<string>();
    const deduped = mapped.filter((item) => {
      const key = item.question.toLowerCase();
      if (unique.has(key)) {
        return false;
      }
      unique.add(key);
      return true;
    });

    return deduped.length === mapped.length ? mapped : deduped;
  } catch (error) {
    console.error("Unable to parse generated questions:", error);
    return null;
  }
}

function normalizeGeneratedQuestion(item: unknown): GeneratedQuestion | null {
  if (!item || typeof item !== "object") return null;

  const candidate = item as {
    question?: unknown;
    prompt?: unknown;
    options?: unknown;
    correctAnswer?: unknown;
  };
  const question = typeof candidate.prompt === "string"
    ? candidate.prompt.trim()
    : typeof candidate.question === "string"
      ? candidate.question.trim()
      : "";

  if (!question || !Array.isArray(candidate.options) || candidate.options.length !== 4) {
    return null;
  }

  const options = candidate.options.map((option, index) => {
    if (typeof option === "string") return option.trim();
    if (!option || typeof option !== "object") return "";

    const structured = option as { id?: unknown; label?: unknown; text?: unknown };
    const expectedId = String.fromCharCode(65 + index);
    if (
      structured.id !== expectedId ||
      structured.label !== expectedId ||
      typeof structured.text !== "string"
    ) return "";
    return structured.text.trim();
  });

  if (options.some((option) => !option)) return null;

  let correctAnswer: number;
  if (typeof candidate.correctAnswer === "number") {
    correctAnswer = candidate.correctAnswer;
  } else if (typeof candidate.correctAnswer === "string") {
    correctAnswer = candidate.correctAnswer.trim().toUpperCase().charCodeAt(0) - 65;
  } else {
    return null;
  }

  if (!Number.isInteger(correctAnswer) || correctAnswer < 0 || correctAnswer > 3) {
    return null;
  }

  return { question, options, correctAnswer };
}

function dedupeByPrompt(
  questions: GeneratedQuestion[],
  seen: Set<string>
): GeneratedQuestion[] {
  const unique: GeneratedQuestion[] = [];

  for (const question of questions) {
    const key = question.question.trim().toLowerCase();
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(question);
  }

  return unique;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isTestCategory(value: string): boolean {
  return Object.values(TestCategory).includes(value as TestCategory);
}

function isDifficulty(value: string): boolean {
  return Object.values(Difficulty).includes(value as Difficulty);
}
