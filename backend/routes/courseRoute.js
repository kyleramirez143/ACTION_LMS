import { Router } from "express";
import { uploadImage } from "../middleware/uploadImage.js";
import { protect, checkRole } from "../middleware/authMiddleware.js";
import {
    createCourse,
    getCourses,
    updateCourse,
    deleteCourse,
    getTrainerCourses,
    getCourseById
} from "../controllers/courseController.js";

const router = Router();

// Upload image first → return filename
router.post("/upload-image", protect, checkRole(["Admin"]), uploadImage.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });
    res.json({ filename: req.file.filename });
});

// Admin full list
router.get("/", protect, checkRole(["Admin", "Trainee"]), getCourses);
router.get("/id/:course_id", protect, checkRole(["Admin", "Trainer"]), getCourseById)
router.post("/", protect, checkRole(["Admin"]), createCourse);
router.put("/:course_id", protect, checkRole(["Admin"]), updateCourse);
router.delete("/:course_id", protect, checkRole(["Admin"]), deleteCourse);

// Trainer's limited list
router.get("/trainer", protect, checkRole(["Trainer"]), getTrainerCourses);

export default router;
