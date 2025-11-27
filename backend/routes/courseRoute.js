import { Router } from "express";
import { createCourse, getCourses, updateCourse, deleteCourse } from "../controllers/courseController.js";

const router = Router();

router.post("/", createCourse);
router.get("/", getCourses);
router.put("/:course_id", updateCourse);
router.delete("/:course_id", deleteCourse);

export default router;
