// backend/controllers/resultController.js (FIXED)

import pool from "../db.js";

/**
 * Submits quiz answers, computes score, and saves the result.
 * It uses req.user.id (trainee ID) from the JWT payload for security.
 */
export async function submitQuiz(req, res) {
    const quizId = req.params.id;
    // SECURITY FIX: traineeId is now read from the authenticated user (JWT)
    const traineeId = req.user.id; 
    const { answers } = req.body; 

    if (!answers || typeof answers !== "object") {
        return res.status(400).json({ error: "Answers object is required" });
    }
    
    // Check if the user has already submitted this quiz (optional but recommended)
    const submittedCheck = await pool.query(
        "SELECT id FROM results WHERE quiz_id = $1 AND trainee_id = $2",
        [quizId, traineeId]
    );
    if (submittedCheck.rowCount > 0) {
        return res.status(409).json({ error: "Quiz already submitted by this user." });
    }

    const client = await pool.connect();
    try {
        // Fetch correct answers for questions in the quiz
        const qRes = await client.query("SELECT id, correct_answer FROM questions WHERE quiz_id = $1", [quizId]);
        if (qRes.rowCount === 0) return res.status(404).json({ error: "Quiz not found or has no questions" });

        let score = 0;
        for (const row of qRes.rows) {
            const qid = row.id;
            const correct = row.correct_answer;
            const given = answers[qid];
            // Case-insensitive comparison is a good practice
            if (given && given.toLowerCase() === correct.toLowerCase()) score++;
        }

        // Save result
        const insertRes = await client.query(
            "INSERT INTO results (trainee_id, quiz_id, answers, score) VALUES ($1, $2, $3, $4) RETURNING id, created_at",
            [traineeId, quizId, answers, score]
        );

        res.json({ success: true, result: { id: insertRes.rows[0].id, score, created_at: insertRes.rows[0].created_at } });
    } catch (err) {
        console.error("submitQuiz error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
}

/**
 * Fetch all results for a quiz (Requires Admin/Manager role).
 * NOTE: The join to 'trainees' suggests you might have a separate Trainees table. 
 * If your 'trainee_id' is the 'user_id' from the Users table, you need to join to 'users'.
 */
export async function getQuizResults(req, res) {
    const quizId = req.params.id;
    try {
        const r = await pool.query(
            // ASSUMING trainee_id is user_id from the Users table
            `SELECT r.id, r.trainee_id, u.email AS trainee_email, r.score, r.answers, r.created_at
               FROM results r
               LEFT JOIN users u ON u.id = r.trainee_id  -- FIXED JOIN: Changed 'trainees' to 'users'
               WHERE r.quiz_id = $1
               ORDER BY r.created_at DESC`,
            [quizId]
        );
        res.json({ results: r.rows });
    } catch (err) {
        console.error("getQuizResults error:", err);
        res.status(500).json({ error: err.message });
    }
}