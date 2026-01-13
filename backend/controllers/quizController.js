import { where } from 'sequelize';
import pkg from '../models/index.cjs';
const {
    Course,
    Module,
    Lecture,
    Assessment,
    AssessmentQuestion,
    AssessmentResponse,
    AssessmentAttempt,
    Grade,
    sequelize
} = pkg;

// Fetch quiz + questions
export async function getQuiz(req, res) {
    const { assessment_id } = req.params;
    const userRole = req.user?.roles?.[0];
    const user_id = req.user.id;

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

        const currentAttemptCount = await AssessmentAttempt.count({
            where: { assessment_id, user_id }
        });

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
                attempts_allowed: assessment.attempts,
                attempts_taken: currentAttemptCount,
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
        due_date,
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
            due_date: due_date === null || due_date === ""
                ? null
                : due_date,
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
    const { assessment_id, answers } = req.body;
    const user_id = req.user.id;

    const transaction = await sequelize.transaction();

    try {
        // 1. Get attempt count
        const previousAttempts = await AssessmentAttempt.count({
            where: { assessment_id, user_id },
            transaction
        });

        const attempt_number = previousAttempts + 1;

        // 2. Calculate max score from questions
        const questions = await AssessmentQuestion.findAll({
            where: { assessment_id },
            transaction
        });

        const max_score = questions.reduce(
            (sum, q) => sum + Number(q.points || 0),
            0
        );

        // 3. Create new attempt (ALWAYS new row)
        const newAttempt = await AssessmentAttempt.create({
            assessment_id,
            user_id,
            attempt_number,
            max_score,
            status: "completed"
        }, { transaction });

        let totalScore = 0;
        const responsesToSave = [];

        // 4. Score answers
        for (const q of questions) {
            const answer = answers[q.question_id];

            const isCorrect =
                String(answer || "").trim().toLowerCase() ===
                String(q.correct_answer).trim().toLowerCase();

            const pointsEarned = isCorrect ? Number(q.points || 0) : 0;

            totalScore += pointsEarned;

            responsesToSave.push({
                attempt_id: newAttempt.attempt_id,
                question_id: q.question_id,
                user_id,
                assessment_id,
                answer,
                score: pointsEarned
            });
        }

        // 5. Save responses
        await AssessmentResponse.bulkCreate(responsesToSave, { transaction });

        // 6. Compute final score (percentage or same)
        const final_score = max_score > 0
            ? ((totalScore / max_score) * 100).toFixed(2)
            : 0;

        // 7. Update attempt record
        await newAttempt.update({
            total_score: totalScore,
            final_score,
            status: "completed"
        }, { transaction });

        // 8. Update Grade table (keep highest score)
        const existingGrade = await Grade.findOne({
            where: { assessment_id, user_id },
            transaction
        });

        if (!existingGrade || totalScore > existingGrade.score) {
            await Grade.upsert({
                assessment_id,
                user_id,
                score: totalScore
            }, { transaction });
        }

        await transaction.commit();

        res.json({
            success: true,
            attempt_id: newAttempt.attempt_id,
            attempt_number,
            totalScore,
            max_score,
            final_score
        });

    } catch (err) {
        await transaction.rollback();
        console.error("Save response error:", err);
        console.log("Error: ", err);
        res.status(500).json({ error: err.message });
    }
}


export async function getTraineeResults(req, res) {
    const user_id = req.user.id;
    try {
        const attempts = await AssessmentAttempt.findAll({
            where: { user_id },
            include: [
                {
                    model: Assessment,
                    as: 'assessment',
                    attributes: ['title', 'passing_score'],
                    include: [
                        {
                            model: Lecture,
                            as: 'lectures',
                            through: { attributes: [] }, // ignore lecture_assessments table
                            attributes: ['lecture_id', 'title'],
                            include: [
                                {
                                    model: Module,
                                    as: 'module',
                                    attributes: ['module_id', 'title'],
                                    include: [
                                        {
                                            model: Course,
                                            as: 'course',
                                            attributes: ['course_id', 'title']
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        const results = await Promise.all(attempts.map(async (att) => {
            const totalPoints = await AssessmentQuestion.sum('points', {
                where: { assessment_id: att.assessment_id }
            });

            const userPercentage = (att.total_score / totalPoints) * 100;
            const passed = userPercentage >= att.assessment.passing_score;

            // Get the first course name (if multiple lectures exist, take the first course)
            const courseName = att.assessment.lectures?.[0]?.module?.course?.title || 'N/A';
            const moduleName = att.assessment.lectures?.[0]?.module?.title || 'N/A';
            return {
                attempt_id: att.attempt_id, // CRITICAL: Used for the Review link
                assessment_id: att.assessment_id,
                title: att.assessment.title,
                course: courseName,
                module: moduleName,
                score: `${att.total_score} / ${totalPoints || 0}`,
                status: passed ? 'Passed' : 'Failed',
                feedback: passed ? 'Great job!' : 'Needs improvement.',
                date: att.created_at
            };
        }));

        res.json(results);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
}

export async function getQuizReview(req, res) {
    const { assessment_id } = req.params;
    const { attempt_id } = req.query;
    const user_id = req.user.id;

    try {
        const responses = await AssessmentResponse.findAll({
            where: { assessment_id, user_id, attempt_id },
            include: [
                {
                    model: AssessmentQuestion,
                    as: 'question',
                    attributes: [
                        'question_text',
                        'options',
                        'correct_answer',
                        'explanations',
                        'points'
                    ]
                }
            ],
            order: [['created_at', 'ASC']]
        });

        const formatted = responses.map(r => ({
            question: r.question.question_text,
            options: r.question.options || [],
            correctAnswer: r.question.correct_answer,
            explanation: r.question.explanations,
            userAnswer: r.answer,
            isCorrect: r.score > 0,
            points: r.question.points
        }));

        res.json(formatted);

    } catch (err) {
        console.error("getQuizReview error:", err);
        res.status(500).json({ error: err.message });
    }
}
