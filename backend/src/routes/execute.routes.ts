import { Router } from "express";
import { executeCode } from "../controllers/execute.controller";

const router = Router();

router.post("/", executeCode);

export default router;
