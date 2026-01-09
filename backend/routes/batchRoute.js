// routes/batchRoute.js
import express from "express";
import { 
    addBatch, 
    getAllBatches, 
    updateBatch, 
    deleteBatch, 
    getBatchById,
    bulkDeleteBatches,
    getAllBatchesForDropdown
} from "../controllers/batchController.js";

const router = express.Router();

router.get("/dropdown", getAllBatchesForDropdown); // Add this line

// GET all batches (with optional pagination, search, filter)
router.get("/", getAllBatches);

// POST a new batch
router.post("/add", addBatch);

// GET a batch by ID (for edit mode)
router.get("/:id", getBatchById);

// PUT update a batch by ID
router.put("/update/:id", updateBatch);

// DELETE a batch by ID
router.delete("/bulk-delete", bulkDeleteBatches);

router.delete("/delete/:id", deleteBatch);

router.get("/:id", getBatchById);

export default router;
