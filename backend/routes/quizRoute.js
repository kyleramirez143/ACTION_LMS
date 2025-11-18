// routes/quizRoutes.js
import express from "express";
import { createQuiz, getQuiz } from "../controllers/quizController.js";
const router = express.Router();

router.post("/", createQuiz);        // create from JSON body
router.get("/:id", getQuiz);         // fetch quiz for trainee

export default router;
