// ---------------------------------------------------------------------------
// Assessment Center controllers.
// ---------------------------------------------------------------------------
// Read endpoints for the Assessment Center. Uses the real Assessment and
// AssessmentSubmission models from the shared database.
// ---------------------------------------------------------------------------
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// Helper to get current user ID from session (to be implemented with auth)
// TODO: Replace with proper auth session extraction when authentication is ready
function getCurrentUserId(req: Request): string | null {
  const userId = req.headers["x-user-id"] as string;
  return userId || null;
}

// GET /api/assessments/live
// Returns assessments that are currently LIVE and within their time window
export async function getLiveAssessments(req: Request, res: Response) {
  try {
    const now = new Date();

    const assessments = await prisma.assessment.findMany({
      where: {
        status: "LIVE",
        startTime: { lte: now },
        endTime: { gte: now },
      },
      select: {
        id: true,
        title: true,
        type: true,
        company: true,
        questions: true,
        durationMinutes: true,
        sections: true,
        startTime: true,
        endTime: true,
        status: true,
        proctoringEnabled: true,
        fullScreenRequired: true,
        tabSwitchRestricted: true,
        maxAttempts: true,
      },
      orderBy: { startTime: "asc" },
    });

    res.json({ assessments });
  } catch (error) {
    console.error("Error fetching live assessments:", error);
    res.status(500).json({ message: "Failed to fetch live assessments" });
  }
}

// GET /api/assessments/upcoming
// Returns assessments scheduled to start in the future
export async function getUpcomingAssessments(req: Request, res: Response) {
  try {
    const now = new Date();

    const assessments = await prisma.assessment.findMany({
      where: {
        status: "SCHEDULED",
        startTime: { gt: now },
      },
      select: {
        id: true,
        title: true,
        type: true,
        company: true,
        questions: true,
        durationMinutes: true,
        sections: true,
        startTime: true,
        endTime: true,
        status: true,
        proctoringEnabled: true,
        fullScreenRequired: true,
        tabSwitchRestricted: true,
        maxAttempts: true,
      },
      orderBy: { startTime: "asc" },
    });

    res.json({ assessments });
  } catch (error) {
    console.error("Error fetching upcoming assessments:", error);
    res.status(500).json({ message: "Failed to fetch upcoming assessments" });
  }
}

// GET /api/assessments/completed
// Returns completed assessment submissions for the authenticated student
export async function getCompletedAssessments(req: Request, res: Response) {
  try {
    const userId = getCurrentUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const submissions = await prisma.assessmentSubmission.findMany({
      where: {
        userId,
        completedAt: { not: null },
      },
      select: {
        id: true,
        assessmentId: true,
        score: true,
        percentage: true,
        percentile: true,
        status: true,
        completedAt: true,
        Assessment: {
          select: {
            id: true,
            title: true,
            type: true,
            company: true,
          },
        },
      },
      orderBy: { completedAt: "desc" },
    });

    const completed = submissions.map((sub) => ({
      id: sub.id,
      assessmentId: sub.assessmentId,
      title: sub.Assessment.title,
      type: sub.Assessment.type,
      company: sub.Assessment.company,
      date: sub.completedAt ? sub.completedAt.toISOString() : null,
      score: Math.round(sub.percentage),
      percentage: sub.percentage,
      percentile: sub.percentile,
      status: sub.status,
    }));

    res.json({ completed });
  } catch (error) {
    console.error("Error fetching completed assessments:", error);
    res.status(500).json({ message: "Failed to fetch completed assessments" });
  }
}

// GET /api/assessments/attempts
// Returns all assessment attempts for the authenticated student
// Includes both AssessmentSubmission (Assessment Center) and TestSubmission (Practice Arena)
export async function getAssessmentAttempts(req: Request, res: Response) {
  try {
    const userId = getCurrentUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch AssessmentSubmission records (Assessment Center)
    const assessmentSubmissions = await prisma.assessmentSubmission.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        assessmentId: true,
        score: true,
        percentage: true,
        percentile: true,
        status: true,
        startedAt: true,
        completedAt: true,
        Assessment: {
          select: {
            id: true,
            title: true,
            type: true,
            company: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    // Fetch TestSubmission records (Practice Arena)
    const testSubmissions = await prisma.testSubmission.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        testId: true,
        score: true,
        percentage: true,
        correctCount: true,
        incorrectCount: true,
        createdAt: true,
        test: {
          select: {
            id: true,
            title: true,
            category: true,
            company: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Map AssessmentSubmission attempts
    const assessmentAttempts = assessmentSubmissions.map((sub) => ({
      id: sub.id,
      type: "assessment",
      testId: sub.assessmentId,
      testTitle: sub.Assessment.title,
      testType: sub.Assessment.type,
      company: sub.Assessment.company,
      date: sub.startedAt.toISOString(),
      score: Math.round(sub.percentage),
      correctCount: null,
      incorrectCount: null,
      percentage: sub.percentage,
      createdAt: sub.startedAt.toISOString(),
    }));

    // Map TestSubmission attempts
    const testAttempts = testSubmissions.map((sub) => ({
      id: sub.id,
      type: "practice",
      testId: sub.testId,
      testTitle: sub.test.title,
      testType: sub.test.category,
      company: sub.test.company,
      date: sub.createdAt.toISOString(),
      score: sub.score,
      correctCount: sub.correctCount,
      incorrectCount: sub.incorrectCount,
      percentage: sub.percentage,
      createdAt: sub.createdAt.toISOString(),
    }));

    // Combine and sort by date
    const allAttempts = [...assessmentAttempts, ...testAttempts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json({ attempts: allAttempts });
  } catch (error) {
    console.error("Error fetching assessment attempts:", error);
    res.status(500).json({ message: "Failed to fetch assessment attempts" });
  }
}
