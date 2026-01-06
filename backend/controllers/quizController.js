import pkg from '../models/index.cjs';
const { Assessment, AssessmentQuestion, AssessmentResponse } = pkg;

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

export async function saveResponse(req, res) {
    const { assessment_id, question_id, answer } = req.body;
    const user_id = req.user.id;

    try {
        const response = await AssessmentResponse.create({
            assessment_id,
            question_id,
            user_id,
            answer,
            submitted_at: new Date()
        });
        res.json(response);
    } catch (err) {
        console.error('saveResponse error:', err);
        res.status(500).json({ error: err.message });
    }
}

export async function getTraineeResults(req, res) {
    const user_id = req.user.id;

    try {
        const responses = await AssessmentResponse.findAll({
            where: { user_id },
            include: [
                {
                    model: Assessment,
                    as: 'assessment',
                    attributes: ['assessment_id', 'title', 'passing_score']
                },
                {
                    model: AssessmentQuestion,
                    as: 'question',
                    attributes: ['correct_answer']
                }
            ],
            order: [['submitted_at', 'DESC']]
        });

        // Group by assessment
        const grouped = {};

        for (const r of responses) {
            const aid = r.assessment.assessment_id;

            if (!grouped[aid]) {
                grouped[aid] = {
                    assessment_id: aid,
                    title: r.assessment.title,
                    correct: 0,
                    total: 0,
                    submitted_at: r.submitted_at,
                    passing_score: r.assessment.passing_score
                };
            }

            grouped[aid].total += 1;
            if (r.answer === r.question.correct_answer) {
                grouped[aid].correct += 1;
            }
        }

        const results = Object.values(grouped).map(r => {
            const scorePercent = Math.round((r.correct / r.total) * 100);
            const passed = scorePercent >= r.passing_score;

            return {
                assessment_id: r.assessment_id,
                title: r.title,
                score: `${r.correct} / ${r.total}`,
                status: passed ? 'Passed' : 'Failed',
                feedback: passed
                    ? 'Good work! You passed the assessment.'
                    : 'Review the materials and try again.',
                date: r.submitted_at
            };
        });

        res.json(results);
    } catch (err) {
        console.error('getTraineeResults error:', err);
        res.status(500).json({ error: err.message });
    }
}
