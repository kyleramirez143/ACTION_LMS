// controllers/uploadController.js
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import pool from "../db.js";
import { extractTextFromPdf } from "../utils/pdfParser.js";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateQuizFromPdf(req, res) {
    const file = req.file;
    const user = req.user;

    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (!file) return res.status(400).json({ error: "PDF file is required" });

    // Read new form data fields
    const quizType = req.body.quizType || "Multiple Choice";
    const questionQty = parseInt(req.body.questionQty) || 10;

    const title = req.body.title || "AI Generated Quiz";
    console.log(`[UPLOAD] User ${user.id} uploading file: ${file.filename}`);
    console.log(`[UPLOAD] Quiz type: ${quizType}, Questions: ${questionQty}`);

    try {
        // 1️⃣ Extract text
        const text = await extractTextFromPdf(file.path);
        console.log(`[UPLOAD] PDF text extracted (${text.length} chars)`);

        // 2️⃣ AI prompt
        const prompt = `
You are an LMS quiz generator. Based on the content below, create JSON with exactly ${questionQty} questions of type "${quizType}".
Each question must include:
- "question" (string)
- "options" {a,b,c,d} (only if applicable for Multiple Choice)
- "correct_answer" (a,b,c,d or text)
- "explanation" (string)

Return JSON only in this format:
{
  "questions": [
    {
      "question": "...",
      "options": {"a":"...", "b":"...", "c":"...", "d":"..."},
      "correct_answer": "...",
      "explanation": "..."
    }
  ]
}

Content:
${text.slice(0, 16000)}
`.trim();

        const aiResp = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You generate quizzes in JSON for a corporate LMS." },
                { role: "user", content: prompt },
            ],
            max_tokens: 2000,
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

        // 3️⃣ Save quiz to DB
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const quizInsert = await client.query(
                `INSERT INTO assessments 
         (title, pdf_source_url, assessment_type_id, is_published, created_by, created_at) 
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING assessment_id`,
                [title, file.filename, "9e36d4a6-2330-4b8d-bc3d-65551a7cdd55", false, user.id]
            );

            const assessmentId = quizInsert.rows[0].assessment_id;

            for (const q of questions) {
                await client.query(
                    `INSERT INTO assessment_questions 
           (assessment_id, question_text, options, correct_answer, created_at, explanations)
           VALUES ($1, $2, $3, $4, NOW(), $5)`,
                    [
                        assessmentId,
                        q.question,
                        JSON.stringify(q.options || {}),
                        JSON.stringify(q.correct_answer),
                        q.explanation,
                    ]
                );
            }

            await client.query("COMMIT");

            console.log(`[UPLOAD] Assessment ${assessmentId} created with ${questions.length} questions by user ${user.id}`);

            res.json({
                success: true,
                assessmentId,
                pdf_filename: file.filename,
                questions_count: questions.length,
                quizType,
                questions,
                ai_json: parsed,
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
        if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        res.status(500).json({ error: err.message });
    }
}

// Save / Publish Quiz
export async function saveQuiz(req, res) {
    const { assessmentId } = req.params;
    try {
        const result = await pool.query(
            `UPDATE assessments SET is_published = TRUE WHERE assessment_id = $1 RETURNING *`,
            [assessmentId]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: "Assessment not found" });
        res.json({ success: true, message: "Quiz saved!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Discard / Delete Quiz
export async function discardQuiz(req, res) {
    const { assessmentId } = req.params;
    try {
        const assessment = await pool.query(
            "SELECT pdf_source_url FROM assessments WHERE assessment_id=$1",
            [assessmentId]
        );

        if (assessment.rowCount === 0) return res.status(404).json({ error: "Assessment not found" });

        const pdfFile = `uploads/pdf/${assessment.rows[0].pdf_source_url}`;
        if (fs.existsSync(pdfFile)) fs.unlinkSync(pdfFile);

        await pool.query("DELETE FROM assessment_questions WHERE assessment_id=$1", [assessmentId]);
        await pool.query("DELETE FROM assessments WHERE assessment_id=$1", [assessmentId]);

        res.json({ success: true, message: "Quiz discarded!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
