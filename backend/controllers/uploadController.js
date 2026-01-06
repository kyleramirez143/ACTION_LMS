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
        // Extract text from PDF
        const text = await extractTextFromPdf(file.path);

        let prompt = "";

        if (quizType === "Multiple Choice") {
            // Generic multiple choice
            prompt = `
Generate JSON with exactly ${questionQty} multiple-choice questions in this format:
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
        } else if (quizType === "Nihongo") {
            // Nihongo quiz with sections
            prompt = `
You are an AI generating a Nihongo (Japanese) lesson quiz based on the provided PDF content.

Requirements:
1️⃣ Grammar: generate fill-in-the-blank questions with 4 options each.
2️⃣ Vocabulary: generate 6 questions:
   - First 3: English word → translate to Japanese (characters)
   - Last 3: Japanese word → translate to English
3️⃣ Listening: generate 1-3 short-answer questions (no options needed).

Output JSON EXACTLY in this format:
{
  "questions": [
    {
      "section": "Grammar" | "Vocabulary" | "Listening",
      "question": "...",
      "options": {"a":"...", "b":"...", "c":"...", "d":"..."} OR null,
      "correct_answer": "...",
      "explanation": "..."
    }
  ]
}

PDF content:
${text.slice(0, 16000)}
`;
        }

        // Call OpenAI
        const aiResp = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You generate structured JSON quizzes for LMS." },
                { role: "user", content: prompt }
            ],
            max_tokens: 3000
        });

        // Clean AI response and parse JSON
        let aiText = aiResp.choices[0].message.content
            .replace(/^```json/, "")
            .replace(/```$/, "")
            .trim();

        const parsed = JSON.parse(aiText);

        console.log(`Quiz created with ${parsed.questions.length} questions by user ${user.id}`);

        res.json({
            success: true,
            pdf_filename: file.filename,
            questions: parsed.questions,
            quizType,
            title
        });

    } catch (err) {
        console.log("Error generating quiz: ", err);
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
            is_published: false,
            created_by: userId
        });

        // Save questions
        for (const q of questions) {
            await AssessmentQuestion.create({
                assessment_id: assessment.assessment_id,
                question_text: q.question,
                options: q.options || {},
                correct_answer: q.correct_answer,
                explanations: q.explanation || "",
                section: q.section || "General"
            });
        }

        // Link to Lecture
        await LectureAssessment.create({
            lecture_id: lectureId,
            assessment_id: assessment.assessment_id
        });

        console.log(`[UPLOAD] Assessment ${assessment.assessment_id} created with ${questions.length} questions by user ${userId}`);

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
