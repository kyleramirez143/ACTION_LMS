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

    const title = req.body.title || "AI Generated Quiz";
    console.log(`[UPLOAD] User ${user.id} uploading file: ${file.filename}`);

    try {
        // 1️⃣ Extract text
        const text = await extractTextFromPdf(file.path);
        console.log(`[UPLOAD] PDF text extracted (${text.length} chars)`);

        // 2️⃣ AI prompt
        const prompt = `
You are an LMS quiz generator. Based on the content below, create JSON 20 questions
with "question", "options" {a,b,c,d}, "correct_answer" (a,b,c,d), explanation of the correct answer.
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
            max_tokens: 3000,
        });

        let aiText = aiResp.choices.map(c => c.message?.content ?? c.text).join("\n");
        aiText = aiText.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();

        let parsed;
        try {
            parsed = JSON.parse(aiText);
        } catch (err) {
            console.error("[UPLOAD] JSON parse error:", err.message);
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
            const quizId = "9e36d4a6-2330-4b8d-bc3d-65551a7cdd55";
            const quizInsert = await client.query(
                `INSERT INTO assessments 
         (title, pdf_source_url, assessment_type_id, is_published, created_by, created_at) 
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING assessment_id`,
                [title, file.filename, "", true, user.id]
            );

            const assessmentId = quizInsert.rows[0].assessment_id;

            for (const q of questions) {
                await client.query(
                    `INSERT INTO assessment_questions 
           (assessment_id, question_text, explanations, options, correct_answer, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
                    [
                        assessmentId,
                        q.question,
                        q.explanation,
                        JSON.stringify(q.options),
                        JSON.stringify(q.correct_answer)
                    ] // note: JSON column
                );
            }

            await client.query("COMMIT");

            console.log(`[UPLOAD] Assessment ${assessmentId} created with ${questions.length} questions by user ${user.id}`);

            res.json({
                success: true,
                assessmentId,
                pdf_filename: file.filename,
                questions_count: questions.length,
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
