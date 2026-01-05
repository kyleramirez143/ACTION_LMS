import express from "express";
import { protect, checkRole } from '../middleware/authMiddleware.js';
import * as quizController from '../controllers/quizController.js';
import * as proctorController from '../controllers/proctorController.js';
import multer from "multer";

const router = express.Router();

// Quiz settings
router.put('/:assessment_id', protect, checkRole(['Trainer']), quizController.saveQuizConfig);
router.get('/:assessment_id', protect, checkRole(['Trainer', 'Trainee']), quizController.getQuiz);

// Questions
router.post('/questions', protect, checkRole(['Trainer']), quizController.addQuestion);
router.put('/questions/:question_id', protect, checkRole(['Trainer']), quizController.updateQuestion);
router.delete('/questions/:question_id', protect, checkRole(['Trainer']), quizController.deleteQuestion);

// Quiz Recording 
// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/recordings/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });
// Start a session (called right before entering QuizPage)
router.post('/:assessment_id/proctor/start', protect, checkRole(['Trainee']), proctorController.startSession);

// Upload the final video (called when quiz is submitted or tab closed)
router.post('/proctor/upload/:session_id', protect, checkRole(['Trainee']), upload.single('recording'), proctorController.uploadRecording);

router.get('/:assessment_id/sessions', protect, checkRole(['Trainer']), proctorController.getAssessmentSessions);

// Save trainee answers
router.post('/responses', protect, checkRole(['Trainee']), quizController.saveResponse);

// Trainee assessment results
router.get(
    '/trainee/results',
    protect,
    checkRole(['Trainee']),
    quizController.getTraineeResults
);

export default router;
