import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { protect, checkRole } from "../middleware/authMiddleware.js";
import { generateQuizFromPdf } from "../controllers/uploadController.js";

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

export default router;
