// controllers/resultController.js
/**
 * This takes { traineeId, answers: { "<question_id>": "a", ... } }, computes score, saves result row.
 */
import pool from "../db.js";

export async function submitQuiz(req, res) {
  const quizId = req.params.id;
  const { traineeId, answers } = req.body; // answers: { "<question_id>": "a", ... }

  if (!traineeId || !answers || typeof answers !== "object") {
    return res.status(400).json({ error: "traineeId and answers are required" });
  }

  const client = await pool.connect();
  try {
    // fetch correct answers for questions in the quiz
    const qRes = await client.query("SELECT id, correct_answer FROM questions WHERE quiz_id = $1", [quizId]);
    if (qRes.rowCount === 0) return res.status(404).json({ error: "Quiz not found or has no questions" });

    let score = 0;
    for (const row of qRes.rows) {
      const qid = row.id;
      const correct = row.correct_answer;
      const given = answers[qid];
      if (given && given.toLowerCase() === correct.toLowerCase()) score++;
    }

    // save result
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
 * Fetch all results for a quiz
 */
export async function getQuizResults(req, res) {
  const quizId = req.params.id;
  try {
    const r = await pool.query(
      `SELECT r.id, r.trainee_id, t.name AS trainee_name, r.score, r.answers, r.created_at
       FROM results r
       LEFT JOIN trainees t ON t.id = r.trainee_id
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
