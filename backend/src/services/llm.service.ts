export type PracticeDifficulty = "easy" | "medium" | "hard";

export type GeneratedQuestion = {
  id: string;
  difficulty: PracticeDifficulty;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
};

type RawQuestion = {
  id?: unknown;
  question?: unknown;
  prompt?: unknown;
  options?: unknown;
  correctIndex?: unknown;
  correctAnswer?: unknown;
  explanation?: unknown;
};

const DIFFICULTIES: PracticeDifficulty[] = ["easy", "medium", "hard"];
const QUESTIONS_PER_DIFFICULTY = 30;
const MAX_BATCH_RETRIES = 2;
const REQUEST_TIMEOUT_MS = 60_000;

export async function generatePracticeQuestions(
  topic: string
): Promise<GeneratedQuestion[]> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Question generation is not configured.");
  }

  const initialBatches = await Promise.all(
    DIFFICULTIES.map((difficulty) =>
      generateDifficultyBatch(topic, difficulty, QUESTIONS_PER_DIFFICULTY, apiKey, [])
    )
  );

  const used = new Set<string>();
  const completeBatches: GeneratedQuestion[][] = [];

  for (let index = 0; index < DIFFICULTIES.length; index += 1) {
    const difficulty = DIFFICULTIES[index];
    const unique = takeUnique(initialBatches[index], used);
    const missing = QUESTIONS_PER_DIFFICULTY - unique.length;

    if (missing > 0) {
      const refill = await generateDifficultyBatch(
        topic,
        difficulty,
        missing,
        apiKey,
        [...used]
      );
      unique.push(...takeUnique(refill, used));
    }

    if (unique.length !== QUESTIONS_PER_DIFFICULTY) {
      throw new Error(`Could not produce 30 ${difficulty} questions.`);
    }

    completeBatches.push(unique);
  }

  return completeBatches.flat();
}

async function generateDifficultyBatch(
  topic: string,
  difficulty: PracticeDifficulty,
  requestedCount: number,
  apiKey: string,
  excludedQuestions: string[]
): Promise<GeneratedQuestion[]> {
  let requested = requestedCount;
  let lastError = "";

  for (let attempt = 0; attempt <= MAX_BATCH_RETRIES; attempt += 1) {
    try {
      const raw = await requestGemini(
        buildPrompt(topic, difficulty, requested, excludedQuestions),
        apiKey
      );
      const parsed = parseQuestions(raw, difficulty);
      const unique = dedupeQuestions(parsed);

      if (unique.length >= requestedCount) {
        return unique.slice(0, requestedCount);
      }

      lastError = `Gemini returned ${unique.length} valid ${difficulty} questions; ${requestedCount} were required.`;
      requested = requestedCount - unique.length;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Invalid Gemini response.";
      requested = requestedCount;
    }
  }

  throw new Error(lastError || `Could not generate ${difficulty} questions.`);
}

function buildPrompt(
  topic: string,
  difficulty: PracticeDifficulty,
  count: number,
  excludedQuestions: string[]
): string {
  const exclusions = excludedQuestions.length
    ? `Do not repeat these existing questions:\n${excludedQuestions
        .slice(-90)
        .map((question) => `- ${question}`)
        .join("\n")}`
    : "Do not repeat any question.";

  return `Generate ${count} ${difficulty} multiple-choice questions on '${topic}' for a Computer Science student. Each has 4 options, one correct answer, and a short explanation. Cover varied subtopics, no duplicates. ${exclusions}

Return ONLY a valid JSON array matching this schema, with no markdown fences and no extra text:
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Short explanation"
  }
]`;
}

async function requestGemini(prompt: string, apiKey: string): Promise<string> {
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Gemini request failed with status ${response.status}: ${body.slice(0, 300)}`);
    }

    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = payload.candidates
      ?.flatMap((candidate) => candidate.content?.parts ?? [])
      .map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!text) throw new Error("Gemini returned an empty response.");
    return text;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Question generation timed out.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function parseQuestions(raw: string, difficulty: PracticeDifficulty): GeneratedQuestion[] {
  const cleaned = raw
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start < 0 || end <= start) throw new Error("Gemini returned invalid JSON.");

  const parsed = JSON.parse(cleaned.slice(start, end + 1)) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Gemini response was not an array.");

  return parsed
    .map((item, index) => normalizeQuestion(item, difficulty, index))
    .filter((question): question is GeneratedQuestion => question !== null);
}

function normalizeQuestion(
  value: unknown,
  difficulty: PracticeDifficulty,
  index: number
): GeneratedQuestion | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as RawQuestion;
  const question = typeof raw.question === "string" ? raw.question.trim() : typeof raw.prompt === "string" ? raw.prompt.trim() : "";
  const explanation = typeof raw.explanation === "string" ? raw.explanation.trim() : "";
  const options = Array.isArray(raw.options) ? raw.options.map((option) => typeof option === "string" ? option.trim() : "") : [];
  const correctIndex = typeof raw.correctIndex === "number"
    ? raw.correctIndex
    : typeof raw.correctAnswer === "string"
      ? raw.correctAnswer.trim().toUpperCase().charCodeAt(0) - 65
      : -1;

  if (
    !question ||
    !explanation ||
    options.length !== 4 ||
    options.some((option) => !option) ||
    !Number.isInteger(correctIndex) ||
    correctIndex < 0 ||
    correctIndex > 3
  ) {
    return null;
  }

  return {
    id: typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : `${difficulty}-${index + 1}`,
    difficulty,
    question,
    options: options as [string, string, string, string],
    correctIndex: correctIndex as 0 | 1 | 2 | 3,
    explanation,
  };
}

function dedupeQuestions(questions: GeneratedQuestion[]): GeneratedQuestion[] {
  const seen = new Set<string>();
  return questions.filter((question) => {
    const key = question.question.toLowerCase().replace(/\s+/g, " ").trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function takeUnique(
  questions: GeneratedQuestion[],
  used: Set<string>
): GeneratedQuestion[] {
  const unique: GeneratedQuestion[] = [];
  for (const question of questions) {
    const key = question.question.toLowerCase().replace(/\s+/g, " ").trim();
    if (used.has(key)) continue;
    used.add(key);
    unique.push({ ...question, id: `${question.difficulty}-${used.size}` });
  }
  return unique;
}
