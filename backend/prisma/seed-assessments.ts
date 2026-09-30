// ---------------------------------------------------------------------------
// Development Seed Script for Assessment Model
// ---------------------------------------------------------------------------
// This script creates temporary development/test assessment records for local
// testing of the dynamic Assessment Center. These records are clearly labeled
// as development data and use deterministic IDs to prevent duplicates.
//
// NOTE: This is for development/testing purposes only. Do not use in production.
// ---------------------------------------------------------------------------

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding development assessment records...");

  const now = new Date();

  // 1. Development Aptitude Assessment (LIVE)
  const liveAssessment = await prisma.assessment.upsert({
    where: { id: "dev-assessment-live" },
    update: {},
    create: {
      id: "dev-assessment-live",
      title: "Development Aptitude Assessment",
      type: "APTITUDE",
      company: "Development Test",
      questions: 20,
      durationMinutes: 30,
      sections: 2,
      status: "LIVE",
      startTime: new Date(now.getTime() - 15 * 60 * 1000), // 15 minutes ago
      endTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
      proctoringEnabled: true,
      fullScreenRequired: true,
      tabSwitchRestricted: true,
      maxAttempts: 1,
      createdAt: now,
      updatedAt: now,
    },
  });
  console.log(`✅ Live assessment: ${liveAssessment.title}`);

  // 2. Java Coding Assessment (UPCOMING)
  const upcomingAssessment = await prisma.assessment.upsert({
    where: { id: "dev-assessment-upcoming" },
    update: {},
    create: {
      id: "dev-assessment-upcoming",
      title: "Java Coding Assessment",
      type: "CODING",
      company: "Development Test",
      questions: 15,
      durationMinutes: 45,
      sections: 3,
      status: "SCHEDULED",
      startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 1 day from now
      endTime: new Date(now.getTime() + 25 * 60 * 60 * 1000), // 1 day + 1 hour from now
      proctoringEnabled: true,
      fullScreenRequired: true,
      tabSwitchRestricted: true,
      maxAttempts: 1,
      createdAt: now,
      updatedAt: now,
    },
  });
  console.log(`✅ Upcoming assessment: ${upcomingAssessment.title}`);

  // 3. DSA Practice Assessment (COMPLETED)
  const completedAssessment = await prisma.assessment.upsert({
    where: { id: "dev-assessment-completed" },
    update: {},
    create: {
      id: "dev-assessment-completed",
      title: "DSA Practice Assessment",
      type: "DSA",
      company: "Development Test",
      questions: 25,
      durationMinutes: 60,
      sections: 3,
      status: "COMPLETED",
      startTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      endTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 3 days ago + 1 hour
      proctoringEnabled: false,
      fullScreenRequired: false,
      tabSwitchRestricted: false,
      maxAttempts: 1,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
  });
  console.log(`✅ Completed assessment: ${completedAssessment.title}`);

  console.log("🎉 Development assessment seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding assessments:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
