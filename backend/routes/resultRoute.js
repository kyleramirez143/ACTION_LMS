// routes/resultRoutes.js
import express from "express";
import { submitQuiz, getQuizResults } from "../controllers/resultController.js";
const router = express.Router();

router.post("/:id/submit", submitQuiz);       // POST /api/results/:quizId/submit
router.get("/:id", getQuizResults);           // GET /api/results/:quizId

export default router;
