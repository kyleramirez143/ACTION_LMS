import { Router } from "express";
import { addCheckpoint, getCheckpoint, updateCheckpoint } from "../controllers/checkpointController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Static route FIRST
router.post("/add", protect, addCheckpoint);

// Parameter routes LAST
router.get("/:userId", protect, getCheckpoint);
router.put("/:userId", protect, updateCheckpoint);

export default router;