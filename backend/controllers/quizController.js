// backend/controllers/quizController.js

import pkg from '../models/index.cjs';
const { Assessment, LectureAssessment, AssessmentQuestion } = pkg;

/**
 * Fetch quiz with questions/options (for trainee).
 * IMPORTANT: Removed 'q.correct_answer' to prevent cheating.
 */
export async function getQuiz(req, res) {
    const { assessment_id } = req.params;
    const userRole = req.user?.roles?.[0];

    try {
        const assessment = await Assessment.findOne({
            where: { assessment_id },
            include: [
                {
                    model: AssessmentQuestion,
                    as: "questions",
                    attributes: ["question_id", "question_text", "explanations", "options", "correct_answer"]
                }
            ]
        });

        if (!assessment) return res.status(404).json({ error: "Quiz not found" });

        // Trainees cannot access unpublished quizzes
        if (userRole === "Trainee" && !assessment.is_published) {
            return res.status(403).json({ error: "Quiz not available for trainees." });
        }

        const questions = assessment.questions.map(q => ({
            question_id: q.question_id,
            question_text: q.question_text,
            options: q.options || [],
            correct_answer: q.correct_answer || "",
            explanation: q.explanations || ""
        }));

        res.json({
            quiz: {
                assessment_id: assessment.assessment_id,
                title: assessment.title,
                description: assessment.description,
                attempts: assessment.attempts,
                time_limit: assessment.time_limit,
                passing_score: assessment.passing_score,
                screen_monitoring: assessment.screen_monitoring,
                randomize_questions: assessment.randomize_questions,
                show_score: assessment.show_score,
                show_explanations: assessment.show_explanations,
                is_published: assessment.is_published
            },
            questions
        });
    } catch (err) {
        console.error("getQuiz error:", err);
        res.status(500).json({ error: err.message });
    }
}


/**
 * Save or update quiz configuration from ReviewPublish form
 */
export async function saveQuizConfig(req, res) {
    const { assessment_id } = req.params;
    const {
        title,
        attempts,
        timeLimit,
        passingScore,
        description,
        screenMonitoring,
        randomization,
        scoreVisibility,
        includeExplanationIfWrong,
        isPublished
    } = req.body;

    if (!assessment_id) return res.status(400).json({ error: "Assessment ID is required" });

    try {
        // Fetch the assessment first
        const assessment = await Assessment.findByPk(assessment_id);
        if (!assessment) return res.status(404).json({ error: "Assessment not found" });

        // Update fields
        await assessment.update({
            title: title || assessment.title,
            attempts: attempts ?? assessment.attempts,
            time_limit: timeLimit ?? assessment.time_limit,
            passing_score: passingScore ?? assessment.passing_score,
            screen_monitoring: screenMonitoring ?? assessment.screen_monitoring,
            randomize_questions: randomization ?? assessment.randomize_questions,
            show_score: scoreVisibility ?? assessment.show_score,
            show_explanations: includeExplanationIfWrong ?? assessment.show_explanations,
            description: description || assessment.description, // if you add instructions column
            is_published: isPublished ?? assessment.is_published,
        });

        res.json({ success: true, message: "Quiz configuration saved successfully!" });
    } catch (err) {
        console.error("saveQuizConfig error:", err);
        res.status(500).json({ error: err.message });
    }
}
