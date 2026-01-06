//../routes/uploadRoute.js
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { protect, checkRole } from "../middleware/authMiddleware.js";
import {
  generateQuizFromPdf,
  // saveQuiz,
  discardQuiz,
  saveQuizToLecture
} from "../controllers/uploadController.js";

const router = express.Router();

// Ensure uploads/pdf exists
const pdfDir = "uploads/pdf/";
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

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

router.post("/", protect, checkRole(["Trainer"]), upload.single("file"), generateQuizFromPdf);

// This now CREATES the assessment + questions + link to lecture
router.post("/save-to-lecture", protect, checkRole(["Trainer"]), saveQuizToLecture);

// Discard now ONLY deletes the uploaded PDF
router.delete("/discard", protect, checkRole(["Trainer"]), discardQuiz);


export default router;
