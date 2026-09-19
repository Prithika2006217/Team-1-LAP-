// ---------------------------------------------------------------------------
// Exam engine routes — live auto-save & grading.
// Mounted under /api/practice alongside practice.routes.
// ---------------------------------------------------------------------------
import { Router } from "express";
import { autosave, submit } from "../controllers/exam.controller";

const router = Router();

router.post("/autosave", autosave);
router.post("/submit", submit);

export default router;
