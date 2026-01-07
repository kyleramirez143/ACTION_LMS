import { where } from 'sequelize';
import pkg from '../models/index.cjs';
const { Assessment, AssessmentQuestion, AssessmentResponse, Grade, sequelize } = pkg;

// Fetch quiz + questions
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
                    attributes: ["question_id", "question_text", "explanations", "options", "correct_answer", "points", "section"]
                }
            ]
        });

        if (!assessment) return res.status(404).json({ error: "Quiz not found" });
        if (userRole === "Trainee" && !assessment.is_published) {
            return res.status(403).json({ error: "Quiz not available for trainees." });
        }

        let totalPoints = 0;
        const questions = assessment.questions.map(q => {
            totalPoints += q.points || 0; // sum points, default 0 if null
            return {
                question_id: q.question_id,
                question_text: q.question_text,
                options: q.options || {},
                correct_answer: q.correct_answer || "",
                explanation: q.explanations || "",
                section: q.section || "General",
                points: q.points || 0
            };
        });

        res.json({
            quiz: {
                assessment_id: assessment.assessment_id,
                title: assessment.title,
                description: assessment.description,
                attempts: assessment.attempts,
                time_limit: assessment.time_limit,
                due_date: assessment.due_date,
                screen_monitoring: assessment.screen_monitoring,
                randomize_questions: assessment.randomize_questions,
                show_score: assessment.show_score,
                show_explanations: assessment.show_explanations,
                is_published: assessment.is_published,
                questions,
                totalPoints
            },
            questions
        });
    } catch (err) {
        console.error("getQuiz error:", err);
        res.status(500).json({ error: err.message });
    }
}

// Save quiz config
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
        isPublished,
        dueDate,
    } = req.body;

    try {
        const assessment = await Assessment.findByPk(assessment_id);
        if (!assessment) return res.status(404).json({ error: "Assessment not found" });

        await assessment.update({
            title: title || assessment.title,
            attempts: attempts ?? assessment.attempts,
            time_limit: timeLimit ?? assessment.time_limit,
            passing_score: passingScore ?? assessment.passing_score,
            screen_monitoring: screenMonitoring ?? assessment.screen_monitoring,
            randomize_questions: randomization ?? assessment.randomize_questions,
            show_score: scoreVisibility ?? assessment.show_score,
            show_explanations: includeExplanationIfWrong ?? assessment.show_explanations,
            description: description || assessment.description,
            is_published: isPublished ?? assessment.is_published,
            due_date: dueDate !== undefined ? dueDate : assessment.due_date,
        });

        res.json({ success: true, message: "Quiz configuration saved successfully!" });
    } catch (err) {
        console.error("saveQuizConfig error:", err);
        res.status(500).json({ error: err.message });
    }
}

// Add a new question
export async function addQuestion(req, res) {
    const { assessment_id, question_text, options, correct_answer, explanations, section } = req.body;

    try {
        const question = await AssessmentQuestion.create({
            assessment_id,
            question_text,
            options,
            correct_answer: correct_answer?.toLowerCase() || "",
            explanations,
            section: section || "General"
        });
        res.json(question);
    } catch (err) {
        console.error("addQuestion error:", err);
        res.status(500).json({ error: err.message });
    }
}

// Update a question
export async function updateQuestion(req, res) {
    const { question_id } = req.params;
    const { question_text, options, correct_answer, explanations, section } = req.body;

    try {
        const question = await AssessmentQuestion.findByPk(question_id);
        if (!question) return res.status(404).json({ error: "Question not found" });

        await question.update({
            question_text,
            options,
            correct_answer: correct_answer?.toLowerCase() || "",
            explanations,
            section: section || "General"
        });

        res.json({ success: true, message: "Question updated successfully!" });
    } catch (err) {
        console.error("updateQuestion error:", err);
        res.status(500).json({ error: err.message });
    }
}

// Delete a question
export async function deleteQuestion(req, res) {
    const { question_id } = req.params;

    try {
        const question = await AssessmentQuestion.findByPk(question_id);
        if (!question) return res.status(404).json({ error: "Question not found" });

        await question.destroy();
        res.json({ success: true });
    } catch (err) {
        console.error("deleteQuestion error:", err);
        res.status(500).json({ error: err.message });
    }
}

// Trainee answers per quiz
export async function saveResponse(req, res) {
    const { assessment_id, answers } = req.body; // answers = { [question_id]: answer }
    const user_id = req.user.id;

    try {
        for (const [question_id, answer] of Object.entries(answers)) {
            const question = await AssessmentQuestion.findByPk(question_id, {
                attributes: ['correct_answer', 'points']
            });

            if (!question) continue;

            const score = String(answer || '').trim() === String(question.correct_answer).trim()
                ? question.points
                : 0;

            await AssessmentResponse.upsert({
                assessment_id,
                question_id,
                user_id,
                answer,
                score,
                submitted_at: new Date()
            });
        }

        const totalScore = await AssessmentResponse.sum('score', {
            where: { assessment_id, user_id }
        });

        await Grade.upsert({
            assessment_id,
            user_id,
            score: totalScore
        });

        res.json({ totalScore });
    } catch (err) {
        console.error('saveResponses error:', err);
        res.status(500).json({ error: err.message });
    }
}


export async function getTraineeResults(req, res) {
    const user_id = req.user.id;

    try {
        // 1️⃣ Get all grades for this user
        const grades = await Grade.findAll({
            where: { user_id },
            include: [
                {
                    model: Assessment,
                    as: 'assessment',
                    attributes: ['assessment_id', 'title', 'passing_score']
                }
            ],
            order: [['updated_at', 'DESC']]
        });

        // 2️⃣ For each grade, fetch total points dynamically
        const results = await Promise.all(
            grades.map(async (g) => {
                const totalPoints = await AssessmentQuestion.sum('points', {
                    where: { assessment_id: g.assessment.assessment_id }
                });

                const userPercentage = (g.score / totalPoints) * 100;
                const passed = userPercentage >= g.assessment.passing_score;

                return {
                    assessment_id: g.assessment.assessment_id,
                    title: g.assessment.title,
                    score: `${g.score} / ${totalPoints || 0}`,
                    status: passed ? 'Passed' : 'Failed',
                    feedback: passed
                        ? 'Good work! You passed the assessment.'
                        : 'Review the materials and try again.',
                    date: g.updated_at
                };
            })
        );

        res.json(results);
    } catch (err) {
        console.error('getTraineeResults error:', err);
        res.status(500).json({ error: err.message });
    }
}


