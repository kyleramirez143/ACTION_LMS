// backend/routes/resultRoute.js (NEW)

import express from "express";
import { protect, checkRole } from '../middleware/authMiddleware.js';
import * as resultController from '../controllers/resultController.js';

const router = express.Router();

// Route for submitting a quiz: Requires any valid user (trainee)
router.post('/:id', protect, resultController.submitQuiz); 

// Route for viewing all quiz results: Requires 'Admin' or 'Trainer' role
router.get('/:id', protect, checkRole(['Admin', 'Trainer']), resultController.getQuizResults); 

export default router;
