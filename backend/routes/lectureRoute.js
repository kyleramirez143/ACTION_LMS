import { Router } from "express";
import { createLecture } from "../controllers/lectureController.js";

const router = Router();

router.post("/", createLecture);

export default router;
