// ---------------------------------------------------------------------------
// Study routes (BASE placeholder).
// ---------------------------------------------------------------------------
// Interns implement the module catalog here:
//   - paginate (skip/take)
//   - select ONLY light fields (title, category, duration, progress)
//   - cache hot reads in Redis
// ---------------------------------------------------------------------------
import { Router, Request, Response } from "express";

const router = Router();

// GET /api/study/modules  — placeholder
router.get("/modules", (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented — study modules is an intern task.", data: [] });
});

export default router;
