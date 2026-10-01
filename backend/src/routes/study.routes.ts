// ---------------------------------------------------------------------------
// Study routes
// ---------------------------------------------------------------------------
// Interns implement the module catalog here:
//   - paginate (skip/take)
//   - select ONLY light fields (title, category, duration, progress)
//   - cache hot reads in Redis
// ---------------------------------------------------------------------------

import { Router, Request, Response as ExpressResponse } from "express";

const router = Router();

type AssessmentQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
};

type CourseLesson = {
  title: string;
  level: "Beginner" | "Intermediate";
  content: string;
  keyPoints: string[];
  codeExample?: string;
  quizCheck: {
    question: string;
    answer: string;
  };
};

type Course = {
  topic: string;
  lessons: CourseLesson[];
};

const questionCache = new Map<string, AssessmentQuestion[]>();
const courseCache = new Map<string, Course>();

const coursePrompt = (topic: string) => `Create a complete, in-depth mini-course on the topic '${topic}' for a computer science student, progressing from beginner to intermediate level. Return ONLY a JSON object with this shape:
{
  "topic": "...",
  "lessons": [
    {
      "title": "...",
      "level": "Beginner" | "Intermediate",
      "content": "...",
      "keyPoints": ["...", "..."],
      "codeExample": "..." (optional, only include for programming/technical topics, as a plain code string),
      "quizCheck": { "question": "...", "answer": "..." }
    }
  ]
}

Requirements:
- Include exactly 8 lessons, ordered from foundational concepts to more advanced ones within the topic.
- The first 4-5 lessons must be 'Beginner' level: assume no prior knowledge, explain terms clearly, use simple real-world analogies.
- The remaining lessons must be 'Intermediate' level: build on earlier lessons, introduce more nuanced concepts, trade-offs, and common pitfalls.
- Each lesson's 'content' must be thorough: at least 5-8 well-developed paragraphs, not just bullet points -- explain the 'why' behind concepts, not just the 'what'.
- Each lesson must include 3-5 'keyPoints' summarizing the core takeaways.
- For programming/technical topics, include a realistic, correct 'codeExample' demonstrating the concept (as plain text, no markdown fences inside the string).
- Each lesson must include one short 'quizCheck' question with its answer, so the student can self-check understanding before moving on.
- Do not include markdown code fences or any text outside the JSON object in the response.`;

function parseCourse(content: string): Course | null {
  const json = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object") return null;

  const course = parsed as Partial<Course>;

  if (
    typeof course.topic !== "string" ||
    !Array.isArray(course.lessons) ||
    course.lessons.length !== 8
  ) {
    return null;
  }

  const valid = course.lessons.every((item) => {
    if (!item || typeof item !== "object") return false;

    const lesson = item as Partial<CourseLesson>;
    const quiz = lesson.quizCheck;

    return (
      typeof lesson.title === "string" &&
      (lesson.level === "Beginner" || lesson.level === "Intermediate") &&
      typeof lesson.content === "string" &&
      Array.isArray(lesson.keyPoints) &&
      lesson.keyPoints.length >= 3 &&
      lesson.keyPoints.length <= 5 &&
      lesson.keyPoints.every((point) => typeof point === "string") &&
      (lesson.codeExample === undefined ||
        typeof lesson.codeExample === "string") &&
      !!quiz &&
      typeof quiz === "object" &&
      typeof quiz.question === "string" &&
      typeof quiz.answer === "string"
    );
  });

  return valid ? (course as Course) : null;
}

function parseQuestions(content: string): AssessmentQuestion[] | null {
  const json = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }

  if (!Array.isArray(parsed) || parsed.length !== 20) return null;

  if (
    !parsed.every((item) => {
      if (!item || typeof item !== "object") return false;

      const question = item as Partial<AssessmentQuestion>;

      return (
        typeof question.question === "string" &&
        Array.isArray(question.options) &&
        question.options.length === 4 &&
        question.options.every((option) => typeof option === "string") &&
        typeof question.correctAnswer === "number" &&
        Number.isInteger(question.correctAnswer) &&
        question.correctAnswer >= 0 &&
        question.correctAnswer <= 3
      );
    })
  ) {
    return null;
  }

  return parsed as AssessmentQuestion[];
}

// ---------------------------------------------------------------------------
// Gemini request helper with automatic retry
// ---------------------------------------------------------------------------

async function generateWithRetry(
  model: string,
  apiKey: string,
  prompt: string,
  maxRetries = 3
): Promise<globalThis.Response | null> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 120_000);

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
          signal: controller.signal,
          body: JSON.stringify({
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 20_000,
            },
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      // Success
      if (response.ok) {
        return response;
      }

      const errorBody = await response.text();

      // Retry only temporary errors
      if (
        (response.status === 503 || response.status === 429) &&
        attempt < maxRetries
      ) {
        const delay = 2000 * Math.pow(2, attempt);

        console.warn(
          `Gemini returned ${response.status}. ` +
            `Retry ${attempt + 1}/${maxRetries} in ${delay / 1000}s...`
        );

        await new Promise((resolve) => setTimeout(resolve, delay));

        continue;
      }

      // Permanent error or all retries exhausted
      console.error(
        "Gemini API error:",
        response.status,
        errorBody
      );

      return null;
    } catch (error) {
      // Retry network/timeout errors
      if (attempt < maxRetries) {
        const delay = 2000 * Math.pow(2, attempt);

        console.warn(
          `Gemini request failed. ` +
            `Retry ${attempt + 1}/${maxRetries} in ${delay / 1000}s...`
        );

        await new Promise((resolve) => setTimeout(resolve, delay));

        continue;
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Generate course
// ---------------------------------------------------------------------------

router.post(
  "/course/generate",
  async (req: Request, res: ExpressResponse) => {
    const topic =
      typeof req.body?.topic === "string"
        ? req.body.topic.trim()
        : "";

    if (!topic || topic.length > 200) {
      res.status(400).json({
        message:
          "A topic between 1 and 200 characters is required.",
      });
      return;
    }

    const cacheKey = topic.toLowerCase();

    // Return cached course if already generated
    const cachedCourse = courseCache.get(cacheKey);

    if (cachedCourse) {
      console.log(`Returning cached course: ${topic}`);
      res.json(cachedCourse);
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      res.status(503).json({
        message:
          "Course generation is not configured. Add GEMINI_API_KEY to the backend environment.",
      });
      return;
    }

    try {
      const model =
        process.env.GEMINI_MODEL || "gemini-1.5-flash";

      console.log(
        `Generating course with Gemini: ${topic}`
      );

      const response = await generateWithRetry(
        model,
        apiKey,
        coursePrompt(topic)
      );

      if (!response) {
        res.status(503).json({
          message:
            "Course generation is temporarily unavailable. Please try again in a moment.",
        });
        return;
      }

      const payload = (await response.json()) as {
        candidates?: Array<{
          content?: {
            parts?: Array<{
              text?: string;
            }>;
          };
        }>;
      };

      const content = payload.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("");

      const course =
        typeof content === "string"
          ? parseCourse(content)
          : null;

      if (!course) {
        res.status(502).json({
          message:
            "The course generation service returned malformed course content.",
        });
        return;
      }

      const result = {
        ...course,
        topic,
      };

      // Store generated course in memory cache
      courseCache.set(cacheKey, result);

      console.log(
        `Course generated and cached successfully: ${topic}`
      );

      res.json(result);
    } catch (error) {
      const message =
        error instanceof Error &&
        error.name === "AbortError"
          ? "Course generation timed out. Please try again."
          : "Unable to generate a course right now. Please try again.";

      console.error(
        "Course generation error:",
        error
      );

      res.status(502).json({
        message,
      });
    }
  }
);

// ---------------------------------------------------------------------------
// Generate assessment questions
// ---------------------------------------------------------------------------

router.post(
  "/assessment/questions",
  async (req: Request, res: ExpressResponse) => {
    const topic =
      typeof req.body?.topic === "string"
        ? req.body.topic.trim()
        : "";

    if (!topic || topic.length > 200) {
      res.status(400).json({
        message:
          "A topic between 1 and 200 characters is required.",
      });
      return;
    }

    const cacheKey = topic.toLowerCase();

    const cachedQuestions = questionCache.get(cacheKey);

    if (cachedQuestions) {
      res.json({
        topic,
        questions: cachedQuestions,
      });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      res.status(503).json({
        message:
          "Question generation is not configured. Add GEMINI_API_KEY to the backend environment.",
      });
      return;
    }

    try {
      const model =
        process.env.GEMINI_MODEL || "gemini-1.5-flash";

      const response = await generateWithRetry(
        model,
        apiKey,
        `Generate exactly 20 multiple-choice questions to test knowledge of ${topic}. Each question must have exactly four options and a correctAnswer integer from 0 to 3. Return ONLY a JSON array with this shape: [{"question":"...","options":["...","...","...","..."],"correctAnswer":0}]. Do not include markdown, code fences, or any explanation.`,
        3
      );

      if (!response) {
        res.status(503).json({
          message:
            "Question generation is temporarily unavailable. Please try again in a moment.",
        });
        return;
      }

      const payload = (await response.json()) as {
        candidates?: Array<{
          content?: {
            parts?: Array<{
              text?: string;
            }>;
          };
        }>;
      };

      const content = payload.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("");

      const questions =
        typeof content === "string"
          ? parseQuestions(content)
          : null;

      if (!questions) {
        res.status(502).json({
          message:
            "The question generation service returned an invalid question set.",
        });
        return;
      }

      questionCache.set(cacheKey, questions);

      res.json({
        topic,
        questions,
      });
    } catch (error) {
      console.error(
        "Question generation error:",
        error
      );

      res.status(502).json({
        message:
          "Unable to generate questions right now. Please try again.",
      });
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/study/modules
// ---------------------------------------------------------------------------

router.get(
  "/modules",
  (_req: Request, res: ExpressResponse) => {
    res.status(501).json({
      message:
        "Not implemented — study modules is an intern task.",
      data: [],
    });
  }
);

export default router;
