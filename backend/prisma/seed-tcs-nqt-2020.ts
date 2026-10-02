// ---------------------------------------------------------------------------
// Seed script for TCS NQT 2020 Numerical Ability questions.
// Run with: npm run seed:tcs-nqt-2020
// ---------------------------------------------------------------------------
import { PrismaClient, TestCategory, Difficulty, QuestionType } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

async function main() {
  // Read the JSON file
  const jsonPath = join(__dirname, "tcs_nqt_2020_questions.json");
  const jsonData = JSON.parse(readFileSync(jsonPath, "utf-8"));

  const { questions } = jsonData;

  // Deterministic IDs
  const testId = "tcs-nqt-2020-numerical";
  const sectionId = "tcs-nqt-2020-numerical-section";

  // Create or update the Test
  const test = await prisma.test.upsert({
    where: { id: testId },
    update: {
      title: "TCS NQT 2020 – Numerical Ability",
      category: TestCategory.COMPANY_SPECIFIC,
      difficulty: Difficulty.MEDIUM,
      company: "TCS",
      durationMinutes: 60,
      questionCount: questions.length,
      attempts: 0,
    },
    create: {
      id: testId,
      title: "TCS NQT 2020 – Numerical Ability",
      category: TestCategory.COMPANY_SPECIFIC,
      difficulty: Difficulty.MEDIUM,
      company: "TCS",
      durationMinutes: 60,
      questionCount: questions.length,
      attempts: 0,
    },
  });

  console.log(`Test created/updated: ${test.id}`);

  // Create or update the Section
  const section = await prisma.section.upsert({
    where: { id: sectionId },
    update: {
      title: "Numerical Ability",
      order: 0,
      timeLimitMinutes: 60,
    },
    create: {
      id: sectionId,
      testId: testId,
      title: "Numerical Ability",
      order: 0,
      timeLimitMinutes: 60,
    },
  });

  console.log(`Section created/updated: ${section.id}`);

  // Create or update each Question
  for (const q of questions) {
    const questionId = `${testId}-q${q.number}`;

    // Map correctOption index to actual option value
    const correctAnswer = q.options[q.correctOption];

    await prisma.question.upsert({
      where: { id: questionId },
      update: {
        prompt: q.prompt,
        options: q.options.map((opt: string, idx: number) => ({
          id: String.fromCharCode(97 + idx), // a, b, c, d
          label: String.fromCharCode(65 + idx), // A, B, C, D
          text: opt,
        })),
        correctAnswer: correctAnswer,
        marks: 1,
        negativeMarks: 0.25,
        order: q.number - 1,
      },
      create: {
        id: questionId,
        sectionId: sectionId,
        type: QuestionType.MCQ,
        prompt: q.prompt,
        options: q.options.map((opt: string, idx: number) => ({
          id: String.fromCharCode(97 + idx), // a, b, c, d
          label: String.fromCharCode(65 + idx), // A, B, C, D
          text: opt,
        })),
        correctAnswer: correctAnswer,
        marks: 1,
        negativeMarks: 0.25,
        order: q.number - 1,
      },
    });

    console.log(`Question ${q.number} created/updated: ${questionId}`);
  }

  console.log(`Successfully seeded ${questions.length} questions for TCS NQT 2020 Numerical Ability`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
