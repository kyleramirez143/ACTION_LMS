// controllers/uploadController.js
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import pool from "../db.js";
import { extractTextFromPdf } from "../utils/pdfParser.js";
import dotenv from "dotenv";
dotenv.config();

import pkg from '../models/index.cjs';
const { Assessment, LectureAssessment, AssessmentQuestion } = pkg;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateQuizFromPdf(req, res) {
    const file = req.file;
    const user = req.user;

    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (!file) return res.status(400).json({ error: "PDF file is required" });

    const quizType = req.body.quizType || "Multiple Choice";
    const questionQty = parseInt(req.body.questionQty) || 10;
    const title = req.body.title || "AI Generated Quiz";

    try {
        const text = await extractTextFromPdf(file.path);

        const prompt = `
Generate JSON with exactly ${questionQty} "${quizType}" questions:
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
`;

        const aiResp = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You generate quizzes in JSON for a corporate LMS." },
                { role: "user", content: prompt }
            ],
            max_tokens: 2000
        });

        let aiText = aiResp.choices[0].message.content
            .replace(/^```json/, "")
            .replace(/```$/, "")
            .trim();

        const parsed = JSON.parse(aiText);

        console.log(`Quiz created with ${questions.length} questions by user ${user.id}`);

        // NOTHING IS SAVED TO DB HERE!

        res.json({
            success: true,
            pdf_filename: file.filename,
            questions: parsed.questions,
            quizType,
            title
        });

    } catch (err) {
        console.log("Error: ", err);
        res.status(500).json({ error: err.message });
    }
}

export async function saveQuizToLecture(req, res) {
    const { lectureId, title, pdfFilename, questions } = req.body;
    const userId = req.user?.id;

    if (!lectureId || !questions || !Array.isArray(questions))
        return res.status(400).json({ error: "Lecture ID and questions array required" });

    try {
        // Create Assessment
        const assessment = await Assessment.create({
            title,
            pdf_source_url: pdfFilename,
            assessment_type_id: "9e36d4a6-2330-4b8d-bc3d-65551a7cdd55",
            is_published: true,
            created_by: userId
        });

        const assessmentId = assessment.assessment_id;

        for (const q of questions) {
            await AssessmentQuestion.create({
                assessment_id: assessment.assessment_id,
                question_text: q.question,
                options: q.options || {},
                correct_answer: q.correct_answer,
                explanations: q.explanation || ""
            });
        }

        // Link to Lecture
        await LectureAssessment.create({
            lecture_id: lectureId,
            assessment_id: assessment.assessment_id
        });

        console.log(`[UPLOAD] Assessment ${assessmentId} created with ${questions.length} questions by user ${user.id}`);

        res.json({ success: true, message: "Quiz saved successfully!", assessmentId: assessment.assessment_id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}


export async function discardQuiz(req, res) {
    const { pdfFilename } = req.body;

    if (!pdfFilename)
        return res.status(400).json({ error: "pdfFilename is required" });

    const pdfPath = `uploads/pdf/${pdfFilename}`;

    try {
        if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);

        res.json({ success: true, message: "Draft discarded (file deleted only)." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

