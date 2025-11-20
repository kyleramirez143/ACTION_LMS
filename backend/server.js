// import express from "express";
// import multer from "multer";
// import fs from "fs";
// import pdf from "pdf-parse";
// import dotenv from "dotenv";
// import OpenAI from "openai";
// import cors from "cors";
// // import { createRequire } from "module";

// // const express = require("express");
// // const multer = require("multer");
// // const fs = require("fs");
// // const dotenv = require("dotenv");
// // const OpenAI = require("openai");
// // const cors = require("cors");
// // const pdfParse = require("pdf-parse");


// // const require = createRequire(import.meta.url);
// // const pdfParse = require("pdf-parse");

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// const upload = multer({ dest: "uploads/" });
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// app.get("/", (req, res) => res.send("LMS Backend Running ✅"));

// const generateQuizPrompt = (text) => `
// You are an LMS quiz generator. Based on the content below, create 20 multiple-choice questions.
// Each question must have 4 options (a, b, c ,d) and specify the correct letter togther with the answer.
// Return JSON only.

// Content:
// ${text.slice(0, 8000)}
// `;

// app.post("/api/upload", upload.single("file"), async (req, res) => {
//   try {
//     const dataBuffer = fs.readFileSync(req.file.path);
//     const pdfData = await pdf(dataBuffer);
//     const textContent = pdfData.text.trim();

//     const prompt = generateQuizPrompt(textContent);
//     const aiResponse = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         { role: "system", content: "You generate LMS quiz questions." },
//         { role: "user", content: prompt },
//       ],
//     });

//     // const quizJSON = aiResponse.choices[0].message.content;
//     // const quiz = JSON.parse(quizJSON);
//     let quizJSON = aiResponse.choices[0].message.content;

//     // Remove Markdown code fences if present
//     quizJSON = quizJSON.replace(/```(json)?/g, "").trim();
//     console.log("AI raw response:", quizJSON);

//     console.log("Quiz JSON after cleanup:", quizJSON);
//     const quiz = JSON.parse(quizJSON);

//     fs.unlinkSync(req.file.path);

//     res.json({ message: "Quiz generated successfully", quiz });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));

// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import uploadRoute from "./routes/uploadRoute.js";
import quizRoutes from "./routes/quizRoute.js";
import resultRoutes from "./routes/resultRoute.js";
import authRoutes from "./routes/authRoute.js";

const app = express();
// app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("LMS Backend ✅"));

app.use(cors({
    // Allow requests only from your frontend port 5173 during development
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // If you plan to send cookies/session info
}));

app.use("/api/upload", uploadRoute);
app.use("/api/quizzes", quizRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
