import express from "express";
import multer from "multer";
const upload = multer({ dest: "uploads/lectures" });

import {
    createLecture,
    uploadLectureFile,
    getLecturesByModule
} from "../controllers/lectureController.js";

const router = express.Router();

// create lecture
router.post("/", createLecture);

// upload file to lecture
router.post("/resource", upload.single("file"), uploadLectureFile);

// get lectures by module
router.get("/modules/:module_id", getLecturesByModule);

export default router;
