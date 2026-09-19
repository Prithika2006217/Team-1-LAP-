// ---------------------------------------------------------------------------
// Practice Arena routes (read endpoints + exam engine).
// ---------------------------------------------------------------------------
import { Router } from "express";
import { getTests, getLeaderboard, getStreak, getTestById } from "../controllers/practice.controller";

const router = Router();

// Catalog & widgets
router.get("/tests", getTests);
router.get("/leaderboard", getLeaderboard);
router.get("/streak/:userId", getStreak);
router.get("/tests/:id", getTestById);

export default router;
