// routes/uploadRoute.js
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { extractTextFromPdf } from "../utils/pdfParser.js";
import OpenAI from "openai";
import pool from "../db.js";
import dotenv from "dotenv";
import { protect, checkRole } from "../middleware/authMiddleware.js"; // Ensure user is authenticated
dotenv.config();

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Ensure uploads/pdf directory exists
const pdfDir = "uploads/pdf/";
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

// Multer storage config to rename file with timestamp
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, pdfDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeTitle = (req.body.title || "quiz").replace(/\s+/g, "-").toLowerCase();
    const ext = path.extname(file.originalname);
    cb(null, `${safeTitle}-${timestamp}${ext}`);
  },
});
const upload = multer({ storage });

// POST /api/upload
// Form-data: file (pdf), title (optional)
router.post("/", protect, checkRole(["Trainer"]), upload.single("file"), async (req, res) => {
  console.log("Upload route hit!");
  console.log("Request body:", req.body);
  console.log("Uploaded file:", req.file);
  const file = req.file;
  const user = req.user; // Comes from 'protect' middleware
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  if (!file) return res.status(400).json({ error: "PDF file is required" });

  const title = req.body.title || "AI Generated Quiz";
  console.log(`[UPLOAD] User ${user.id} uploading file: ${file.filename}`);

  try {
    // 1️⃣ Extract text from PDF
    const text = await extractTextFromPdf(file.path);
    console.log(`[UPLOAD] PDF text extracted (${text.length} chars)`);

    // 2️⃣ Call OpenAI to generate quiz JSON
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
        { role: "user", content: prompt },
      ],
      max_tokens: 1500,
    });

    let aiText = aiResp.choices?.[0]?.message?.content ?? aiResp.choices?.[0]?.text;
    aiText = aiText.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch (err) {
      console.error("[UPLOAD] AI returned invalid JSON:", aiText);
      return res.status(500).json({ error: "AI returned invalid JSON", raw: aiText });
    }

    const questions = Array.isArray(parsed.questions ? parsed.questions : parsed)
      ? parsed.questions || parsed
      : [];

    // Save quiz to database
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const quizInsert = await client.query(
        `INSERT INTO assessments 
          (title, pdf_source_url, assessment_type_id, is_published, created_by, created_at) 
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING assessment_id`,
        [title, file.filename, "9e36d4a6-2330-4b8d-bc3d-65551a7cdd55", true, user.id] // Use actual assessment_type_id
      );

      const assessmentId = quizInsert.rows[0].assessment_id;

      for (const q of questions) {
        await client.query(
          `INSERT INTO assessment_questions 
             (assessment_id, question_text, options, correct_answer, created_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [assessmentId, q.question, JSON.stringify(q.options), JSON.stringify(q.correct_answer)]
        );
      }

      await client.query("COMMIT");

      console.log(`[UPLOAD] Assessment ${assessmentId} created with ${questions.length} questions by user ${user.id}`);

      res.json({
        success: true,
        assessmentId,
        pdf_filename: file.filename,
        questions_count: questions.length,
      });
    } catch (dbErr) {
      await client.query("ROLLBACK");
      console.error("[UPLOAD] DB error:", dbErr);
      res.status(500).json({ error: dbErr.message });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[UPLOAD] Error during processing:", err);
    // Cleanup PDF if something failed
    if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    res.status(500).json({ error: err.message });
  }
});

export default router;
