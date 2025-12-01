import { Router } from "express";
import { createModule, getModules } from "../controllers/moduleController.js";

const router = Router();

router.post("/", createModule);
router.get("/", getModules);

export default router;
