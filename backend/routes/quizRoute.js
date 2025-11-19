// routes/quizRoutes.js
import express from "express";
import { protect, checkRole } from '../middleware/authMiddleware.js';
import * as quizController from '../controllers/quizController.js';

const router = express.Router();

// Route for creating a quiz: Requires 'Trainer' role
router.post('/', protect, checkRole(['Trainer']), quizController.createQuiz);

// Route for getting a quiz (to take it): Requires any valid user
router.get('/:id', protect, quizController.getQuiz);

export default router;
