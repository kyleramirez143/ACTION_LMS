import express from "express";
import multer from "multer";
import path from "path";
import { protect, checkRole } from "../middleware/authMiddleware.js";

import {
    createLecture,
    uploadLectureFile,
    getLecturesByModule,
    getLectureById,
    updateLectureVisibility,
    updateLecture, // <-- NEW
    deleteResources, // <-- NEW
    deleteLecture // <-- NEW
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

// POST: Create lecture (Used by LectureForm in Add mode)
router.post("/", protect, checkRole(["Trainer"]), createLecture);

// PUT: Update lecture metadata (Used by LectureForm in Edit mode)
router.put("/:lecture_id", protect, checkRole(["Trainer"]), updateLecture); // <-- NEW ROUTE

// DELETE: Delete lecture (Used by LectureForm Delete button)
router.delete("/:lecture_id", protect, checkRole(["Trainer"]), deleteLecture); // <-- NEW ROUTE

// GET: get lectures by module
router.get("/modules/:module_id", protect, checkRole(["Trainer"]), getLecturesByModule);

// GET: Get a single lecture by ID (Used by LectureForm to fetch data)
router.get("/id/:lecture_id", protect, checkRole(["Trainer"]), getLectureById);

// PATCH: lecture visibility (Make Hidden/Visible)
router.patch("/visibility/:lecture_id", protect, checkRole(["Trainer"]), updateLectureVisibility);

// POST: upload file to lecture (Used by LectureForm)
router.post("/resource",
    protect,
    checkRole(["Trainer"]),
    uploadLecture.array("files", 5),
    uploadLectureFile);

// DELETE: Delete specific resources (Used by LectureForm existing file deletion)
router.delete("/resource/delete", 
    protect, 
    checkRole(["Trainer"]), 
    deleteResources); // <-- NEW ROUTE

export default router;
