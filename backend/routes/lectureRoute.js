import express from "express";
import multer from "multer";
import path from "path";
import { protect, checkRole } from "../middleware/authMiddleware.js";

import {
    createLecture,
    uploadLectureFile,
    getLecturesByModule
} from "../controllers/lectureController.js";

const router = express.Router();

const lectureStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/lectures/"); // folder for lecture files
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `lecture-${timestamp}-${name}${ext}`);
    }
});

const uploadLecture = multer({ storage: lectureStorage });

// create lecture
router.post("/", protect, checkRole(["Trainer"]), createLecture);

// upload file to lecture
router.post("/resource",
    protect,
    checkRole(["Trainer"]),
    uploadLecture.array("files", 5),
    uploadLectureFile);

// get lectures by module
router.get("/modules/:module_id", protect, checkRole(["Trainer"]), getLecturesByModule);

export default router;
