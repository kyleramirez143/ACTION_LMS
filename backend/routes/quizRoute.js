import express from "express";
import { protect, checkRole } from '../middleware/authMiddleware.js';
import * as quizController from '../controllers/quizController.js';

const router = express.Router();

// Quiz settings
router.put('/:assessment_id', protect, checkRole(['Trainer']), quizController.saveQuizConfig);
router.get('/:assessment_id', protect, checkRole(['Trainer','Trainee']), quizController.getQuiz);

// Questions
router.post('/questions', protect, checkRole(['Trainer']), quizController.addQuestion);
router.put('/questions/:question_id', protect, checkRole(['Trainer']), quizController.updateQuestion);
router.delete('/questions/:question_id', protect, checkRole(['Trainer']), quizController.deleteQuestion);

export default router;
