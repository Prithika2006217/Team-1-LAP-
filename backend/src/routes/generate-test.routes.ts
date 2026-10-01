import { Router } from "express";
import { generateTest } from "../controllers/practice.controller";

const router = Router();

router.post("/generate-test", generateTest);

export default router;
