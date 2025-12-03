import express from "express";
import { createModule, getModulesByCourse, updateModule, deleteModule } from "../controllers/moduleController.js";

const router = express.Router();

// All routes require authentication (trainer)
router.post("/" , createModule);          // Add module
router.get("/:course_id", getModulesByCourse);
router.put("/:module_id", updateModule); // Update module
router.delete("/:module_id", deleteModule); // Delete module

export default router;
