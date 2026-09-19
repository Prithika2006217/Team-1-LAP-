// ---------------------------------------------------------------------------
// Seed script — demo data so the Practice Arena renders end-to-end.
// Run with: npm run prisma:seed  (after `npm run prisma:migrate`).
// ---------------------------------------------------------------------------
import { PrismaClient, TestCategory, Difficulty, QuestionType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // --- Users (for leaderboard + a demo candidate) ---------------------------
  const demo = await prisma.user.upsert({
    where: { email: "arjun@college.edu" },
    update: {},
    create: {
      email: "arjun@college.edu",
      name: "Arjun Kumar",
      passwordHash: "seed-not-a-real-hash",
      role: "STUDENT",
      points: 1840,
      currentStreak: 5,
    },
  });

  const leaders = [
    { email: "rahul@college.edu", name: "Rahul Sharma", points: 2450 },
    { email: "priya@college.edu", name: "Priya Singh", points: 2180 },
    { email: "neha@college.edu", name: "Neha Reddy", points: 1560 },
    { email: "karthik@college.edu", name: "Karthik R", points: 1420 },
  ];
  for (const l of leaders) {
    await prisma.user.upsert({
      where: { email: l.email },
      update: { points: l.points },
      create: { ...l, passwordHash: "seed-not-a-real-hash", role: "STUDENT" },
    });
  }

  // --- A fully-formed test with two sections --------------------------------
  const existing = await prisma.test.findFirst({ where: { title: "Aptitude Mock Test 15" } });
  if (!existing) {
    await prisma.test.create({
      data: {
        title: "Aptitude Mock Test 15",
        category: TestCategory.APTITUDE,
        difficulty: Difficulty.MEDIUM,
        company: "TCS",
        durationMinutes: 60,
        questionCount: 3,
        attempts: 1240,
        sections: {
          create: [
            {
              title: "Quantitative Aptitude",
              order: 0,
              timeLimitMinutes: 20,
              questions: {
                create: [
                  {
                    order: 0,
                    type: QuestionType.MCQ,
                    prompt:
                      "A train travels 360 km at a certain speed. If the speed had been 10 km/h more, it would have taken 1 hour less. What is the original speed?",
                    options: [
                      { id: "a", label: "A", text: "55 km/h" },
                      { id: "b", label: "B", text: "60 km/h" },
                      { id: "c", label: "C", text: "65 km/h" },
                      { id: "d", label: "D", text: "70 km/h" },
                    ],
                    correctAnswer: "b",
                    marks: 1,
                    negativeMarks: 0.25,
                  },
                  {
                    order: 1,
                    type: QuestionType.TRUE_FALSE,
                    prompt: "The average of the first 10 natural numbers is 5.5.",
                    options: [
                      { id: "t", label: "True", text: "True" },
                      { id: "f", label: "False", text: "False" },
                    ],
                    correctAnswer: "t",
                    marks: 1,
                    negativeMarks: 0.25,
                  },
                ],
              },
            },
            {
              title: "Programming",
              order: 1,
              timeLimitMinutes: 25,
              questions: {
                create: [
                  {
                    order: 0,
                    type: QuestionType.CODING,
                    prompt: "Write a function to check if a given string is a palindrome.",
                    options: undefined,
                    correctAnswer: null,
                    marks: 2,
                    negativeMarks: 0.5,
                  },
                ],
              },
            },
          ],
        },
      },
    });
  }

  // A couple more catalog entries for the grid.
  const more = [
    { title: "Python Basics Mock", category: TestCategory.CODING, difficulty: Difficulty.MEDIUM, company: null, durationMinutes: 45, questionCount: 30, attempts: 2500 },
    { title: "Amazon SDE Mock", category: TestCategory.COMPANY_SPECIFIC, difficulty: Difficulty.HARD, company: "Amazon", durationMinutes: 90, questionCount: 65, attempts: 3600 },
    { title: "Data Structures - Arrays", category: TestCategory.DSA, difficulty: Difficulty.MEDIUM, company: null, durationMinutes: 45, questionCount: 30, attempts: 1800 },
  ];
  for (const t of more) {
    const found = await prisma.test.findFirst({ where: { title: t.title } });
    if (!found) await prisma.test.create({ data: t });
  }

  console.log(`Seeded. Demo user id: ${demo.id}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
