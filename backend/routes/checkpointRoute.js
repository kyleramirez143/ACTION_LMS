import { Router } from "express";
import { 
    addCheckpoint, 
    getCheckpoint, 
    updateCheckpoint, 
    getCheckpointsByBatch // ✅ Import the new function
} from "../controllers/checkpointController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/add", protect, addCheckpoint);

// ✅ NEW ROUTE: Fetch list by batch
router.get("/batch/:batchId", protect, getCheckpointsByBatch);

router.get("/:userId", protect, getCheckpoint);
router.put("/:userId", protect, updateCheckpoint);

export default router;