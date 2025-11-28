import { Router } from "express";
import { uploadImage } from "../middleware/uploadImage.js";
import { createCourse, getCourses, updateCourse, deleteCourse } from "../controllers/courseController.js";

const router = Router();

// Upload image first → return filename
router.post("/upload-image", uploadImage.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });
    res.json({ filename: req.file.filename });
});

router.post("/", createCourse);
router.get("/", getCourses);
router.put("/:course_id", updateCourse);
router.delete("/:course_id", deleteCourse);

export default router;
