import express from "express";
const router = express.Router();
import {
    createModule,
    getModules,
    getModuleById,
    updateModule,
    deleteModule
} from "../controllers/moduleController.js";

router.post("/", createModule);
router.get("/", getModules);
router.get("/:id", getModuleById);
router.put("/:id", updateModule);
router.delete("/:id", deleteModule);

export default router;
