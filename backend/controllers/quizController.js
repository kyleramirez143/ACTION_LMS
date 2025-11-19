// backend/controllers/quizController.js (FIXED)

import pool from "../db.js";
// Middleware imports are not needed here, they belong in the routes file.
// import { protect, checkRole } from '../middleware/authMiddleware.js'; 

/**
 * Save a quiz into DB.
 * Expects body: { title: "Title", source: "uploaded-pdf", questions: [...] }
 */
export async function createQuiz(req, res) {
    const client = await pool.connect();
    try {
        const { title = "AI Generated Quiz", source = "ai", questions } = req.body;
        // NOTE: You can check req.user here if you want to store the creator's ID
        
        if (!Array.isArray(questions)) return res.status(400).json({ error: "questions must be an array" });

        await client.query("BEGIN");

        const quizInsert = await client.query(
            "INSERT INTO quizzes (title, source) VALUES ($1, $2) RETURNING id, title, created_at",
            [title, source]
        );
        const quizId = quizInsert.rows[0].id;

        // ... (rest of the question/option insertion logic is fine) ...
        for (const q of questions) {
            const insertQ = await client.query(
                "INSERT INTO questions (quiz_id, question_text, correct_answer) VALUES ($1, $2, $3) RETURNING id",
                [quizId, q.question, q.correct_answer]
            );
            const questionId = insertQ.rows[0].id;

            for (const [letter, text] of Object.entries(q.options)) {
                await client.query(
                    "INSERT INTO options (question_id, letter, option_text) VALUES ($1, $2, $3)",
                    [questionId, letter, text]
                );
            }
        }
        // ... (end of insertion logic) ...

        await client.query("COMMIT");
        res.json({ success: true, quiz: { id: quizId, title: quizInsert.rows[0].title } });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("createQuiz error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
}

/**
 * Fetch quiz with questions/options (for trainee).
 * IMPORTANT: Removed 'q.correct_answer' to prevent cheating.
 */
export async function getQuiz(req, res) {
    const quizId = req.params.id;
    try {
        const quizRes = await pool.query("SELECT id, title, source, created_at FROM quizzes WHERE id = $1", [quizId]);
        if (quizRes.rowCount === 0) return res.status(404).json({ error: "Quiz not found" });

        const questionsRes = await pool.query(
            // **FIXED:** Removed q.correct_answer from the SELECT list
            `SELECT q.id as question_id, q.question_text,
                   json_agg(json_build_object('id', o.id, 'letter', o.letter, 'option_text', o.option_text) ORDER BY o.letter) AS options
               FROM questions q
               LEFT JOIN options o ON o.question_id = q.id
               WHERE q.quiz_id = $1
               GROUP BY q.id
               ORDER BY q.id`,
            [quizId]
        );

        res.json({ quiz: quizRes.rows[0], questions: questionsRes.rows });
    } catch (err) {
        console.error("getQuiz error:", err);
        res.status(500).json({ error: err.message });
    }
}