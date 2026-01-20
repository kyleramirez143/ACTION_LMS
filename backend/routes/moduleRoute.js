import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect, checkRole } from "../middleware/authMiddleware.js";
import {
    createModule,
    getModulesByCourse,
    updateModule,
    deleteModule,
    getModuleById,
    updateModuleVisibility,
    getModulesByBatch
} from "../controllers/moduleController.js";

const router = express.Router();

// Ensure module uploads folder exists
const moduleDir = "uploads/images/";
if (!fs.existsSync(moduleDir)) fs.mkdirSync(moduleDir, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, moduleDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const safeName = file.originalname.replace(/\s+/g, "-").toLowerCase();
        cb(null, "module-" + Date.now() + "-" + safeName);
    }
});

const upload = multer({ storage });

// ROUTES (Trainer Only)
router.post("/", protect, checkRole(["Trainer"]), upload.single("image"), createModule);
router.get("/:course_id", protect, checkRole(["Trainer", "Trainee"]), getModulesByCourse);
router.put("/:module_id", protect, checkRole(["Trainer"]), upload.single("image"), updateModule);
router.get("/id/:module_id", protect, checkRole(["Trainer", "Trainee"]), getModuleById);
router.delete("/:module_id", protect, checkRole(["Trainer"]), deleteModule);
router.put("/:module_id/visibility", protect, checkRole(["Trainer"]), updateModuleVisibility);
router.get("/batch/:batch_id", getModulesByBatch);

export default router;