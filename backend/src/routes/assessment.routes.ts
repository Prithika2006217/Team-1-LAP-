// ---------------------------------------------------------------------------
// Assessment Center routes (read endpoints for student view).
// ---------------------------------------------------------------------------
import { Router } from "express";
import { getLiveAssessments, getUpcomingAssessments, getCompletedAssessments, getAssessmentAttempts } from "../controllers/assessment.controller";

const router = Router();

// Assessment Center tabs
router.get("/live", getLiveAssessments);
router.get("/upcoming", getUpcomingAssessments);
router.get("/completed", getCompletedAssessments);
router.get("/attempts", getAssessmentAttempts);

export default router;
