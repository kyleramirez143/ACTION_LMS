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
    updateLecture,
    deleteResources,
    deleteLecture,
    getLecturesByTrainer,
    updateResourceVisibility,
    renameResource,
    deleteResource
} from "../controllers/lectureController.js";

const router = express.Router();

const lectureStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/lectures/");
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `lecture-${timestamp}-${name}${ext}`);
    }
});

const uploadLecture = multer({ storage: lectureStorage });

// ---------- LECTURES ----------
router.post("/", protect, checkRole(["Trainer"]), createLecture);
router.put("/:lecture_id", protect, checkRole(["Trainer"]), updateLecture);
router.delete("/:lecture_id", protect, checkRole(["Trainer"]), deleteLecture);

router.get("/modules/:module_id", protect, checkRole(["Trainer", "Trainee"]), getLecturesByModule);
router.get("/id/:lecture_id", protect, checkRole(["Trainer", "Trainee"]), getLectureById);
router.patch("/visibility/:lecture_id", protect, checkRole(["Trainer"]), updateLectureVisibility);
router.get("/trainer", protect, checkRole(["Trainer", "Trainee"]), getLecturesByTrainer);

// ---------- RESOURCES ----------
router.post(
    "/resource",
    protect,
    checkRole(["Trainer"]),
    uploadLecture.array("files", 5), // Multer always handles files
    uploadLectureFile
);


router.delete(
    "/resource/delete",
    protect,
    checkRole(["Trainer"]),
    deleteResources
);

router.patch(
    "/resource/visibility/:resource_id",
    protect,
    checkRole(["Trainer"]),
    updateResourceVisibility
);

router.patch(
    "/resource/rename/:resource_id",
    protect,
    checkRole(["Trainer"]),
    renameResource
);

router.delete(
    "/resource/:resource_id",
    protect,
    checkRole(["Trainer"]),
    deleteResource
);

export default router;