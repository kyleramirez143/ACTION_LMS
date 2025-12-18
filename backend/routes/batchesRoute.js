import express from "express";
const router = express.Router();
import db from "../models/index.cjs";

// GET /api/batches
router.get("/", async (req, res) => {
    try {
        const batches = await db.Batch.findAll({
            attributes: ['batch_id', 'name', 'description', 'start_date', 'end_date'],
            order: [['start_date', 'ASC']]
        });
        res.json(batches);
    } catch (err) {
        console.error("Fetch batches error:", err);
        res.status(500).json({ error: "Failed to fetch batches" });
    }
});

export default router;
