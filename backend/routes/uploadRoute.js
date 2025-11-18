// routes/uploadRoute.js
/**
 * This ties everything:
 * multer store, extract text, call OpenAI, parse response,
 * call createQuiz controller (or directly save).
 */
import express from "express";
import multer from "multer";
import fs from "fs";
import { extractTextFromPdf } from "../utils/pdfParser.js";
import OpenAI from "openai";
import pool from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const upload = multer({ dest: "uploads/" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * POST /api/upload
 * Form-data: file (pdf), title (optional)
 */
router.post("/", upload.single("file"), async (req, res) => {
  const file = req.file;
  const title = req.body.title || "AI Generated Quiz";
  if (!file) return res.status(400).json({ error: "file (pdf) is required" });

  try {
    const text = await extractTextFromPdf(file.path);

    // optional: trim / summarize if very long (you may call OpenAI to summarize first)
    const prompt = `
You are an LMS quiz generator. Based on the content below, create a JSON object named "questions"
with an array "questions" where each question has:
- question (string)
- options (object with keys a,b,c,d)
- correct_answer (one of "a","b","c","d")

Return JSON only.

Content:
${text.slice(0, 16000)}
    `.trim();

    const aiResp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You generate quizzes in JSON for a corporate LMS." },
        { role: "user", content: prompt }
      ],
      max_tokens: 1500
    });

    let aiText = aiResp.choices?.[0]?.message?.content ?? aiResp.choices?.[0]?.text;
    aiText = aiText
    .replace(/^```json\s*/, '') // Remove starting ```json and any whitespace
    .replace(/\s*```$/, '')     // Remove ending ``` and any whitespace
    .trim();
    // try to parse JSON from AI output
    let parsed;
    try {
      parsed = JSON.parse(aiText);
      // If the AI returns { questions: [...] } structure
      const rawQuestions = parsed.questions || parsed;
      const questions = Array.isArray(rawQuestions) ? rawQuestions.filter(q => q && typeof q === 'object' && q.question) : [];
      // save quiz to DB (reuse the SQL insert flow here)
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const qInsert = await client.query(
          "INSERT INTO quizzes (title, source) VALUES ($1, $2) RETURNING id",
          [title, "uploaded-pdf"]
        );
        const quizId = qInsert.rows[0].id;

        for (const q of questions) {
          const insQ = await client.query(
            "INSERT INTO questions (quiz_id, question_text, correct_answer) VALUES ($1, $2, $3) RETURNING id",
            [quizId, q.question, q.correct_answer]
          );
          const questionId = insQ.rows[0].id;

          for (const [letter, textOpt] of Object.entries(q.options)) {
            await client.query(
              "INSERT INTO options (question_id, letter, option_text) VALUES ($1, $2, $3)",
              [questionId, letter, textOpt]
            );
          }
        }

        await client.query("COMMIT");
        res.json({ success: true, quizId });
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    } catch (parseErr) {
      console.error("AI parse error:", parseErr);
      return res.status(500).json({ error: "AI returned invalid JSON", raw: aiText });
    } finally {
      // cleanup uploaded file
      fs.unlink(file.path, () => {});
    }
  } catch (err) {
    console.error("upload error:", err);
    // cleanup uploaded file
    if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    res.status(500).json({ error: err.message });
  }
});

export default router;
