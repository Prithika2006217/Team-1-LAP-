import { Router } from "express";
import {
  generatePracticeTest,
  getLeaderboard,
  getStreak,
  getTestById,
  getTests,
} from "../controllers/practice.controller";

const router = Router();

// ---------------------------------------------------------------------------
// Practice Arena
// ---------------------------------------------------------------------------

router.get("/tests", getTests);
router.get("/leaderboard", getLeaderboard);
router.get("/streak/:userId", getStreak);

// ---------------------------------------------------------------------------
// AI Practice Test Generation
// ---------------------------------------------------------------------------

router.post("/generate", generatePracticeTest);

// ---------------------------------------------------------------------------
// Individual Test
// ---------------------------------------------------------------------------

router.get("/tests/:id", getTestById);

export default router;