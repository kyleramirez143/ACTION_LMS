import express from "express";
import { protect } from '../middleware/authMiddleware.js'; // You are using 'protect' here
import {
    getPeriodsByBatch,
    addPeriod,
    updatePeriod,
    deletePeriod,
    getSingleQuarter // 1. Add this import
} from "../controllers/periodController.js";

const router = express.Router();

// Get all periods for a batch
router.get("/batch/:batchId", protect, getPeriodsByBatch);

// Create a new period
router.post("/set-periods", protect, addPeriod);

// Update a period
router.put("/update/:id", protect, updatePeriod);

// Delete a period
router.delete("/delete/:id", protect, deletePeriod);

// 2. Change authMiddleware toA protect (to match your import)
router.get("/single/:id", protect, getSingleQuarter);

export default router;