import express from 'express';
const router = express.Router();

// 1. Import your database
import db from '../models/index.cjs'; 
const { Quarter } = db;

// 2. Import your middleware
import { protect } from '../middleware/authMiddleware.js';

// --- ROUTES ---

// POST: Set Module Periods (Bulk)
router.post("/set-periods", protect, async (req, res) => {
    const { 
        batch, // This MUST be the curriculum_id (UUID)
        mod1_start, mod1_end, 
        mod2_start, mod2_end, 
        mod3_start, mod3_end, 
        mod4_start, mod4_end 
    } = req.body;

    // Validation: Ensure batch is a valid ID and not a string like "Batch 40"
    if (!batch || batch.length < 30) {
        return res.status(400).json({ 
            error: "Invalid Batch ID. Please select a batch from the dropdown again." 
        });
    }

    const transaction = await db.sequelize.transaction();

    try {
        // 1. Prepare modules for bulk insert
        const modules = [
            { name: "Module 1", start_date: mod1_start, end_date: mod1_end, curriculum_id: batch },
            { name: "Module 2", start_date: mod2_start, end_date: mod2_end, curriculum_id: batch },
            { name: "Module 3", start_date: mod3_start, end_date: mod3_end, curriculum_id: batch },
            { name: "Module 4", start_date: mod4_start, end_date: mod4_end, curriculum_id: batch },
        ].filter(m => m.start_date && m.end_date); // Only process if dates exist

        // 2. Clean up existing records for this curriculum to prevent duplicates
        await Quarter.destroy({ 
            where: { curriculum_id: batch },
            transaction 
        });

        // 3. Bulk Create
        const result = await Quarter.bulkCreate(modules, { transaction });

        await transaction.commit();
        res.status(201).json(result);

    } catch (err) {
        await transaction.rollback();
        console.error("Critical Save Error:", err);
        
        // Check for specific foreign key errors (PostgreSQL code 23503)
        if (err.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ error: "The selected Batch does not exist in the database." });
        }

        res.status(500).json({ error: "Database error: " + err.message });
    }
});

// GET: Fetch all modules for a specific curriculum/batch
router.get("/batch/:curriculumId", protect, async (req, res) => {
    const { curriculumId } = req.params;
    try {
        const quarters = await Quarter.findAll({
            where: { curriculum_id: curriculumId },
            order: [['start_date', 'ASC']]
        });
        res.json(quarters);
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET: Fetch a single module by ID (For Edit Mode)
router.get("/:id", protect, async (req, res) => {
    try {
        const quarter = await Quarter.findByPk(req.params.id);
        if (!quarter) return res.status(404).json({ message: "Module not found" });
        res.json(quarter);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT: Update a single module
router.put("/update/:id", protect, async (req, res) => {
    try {
        const { name, start_date, end_date } = req.body;
        const [updatedRows] = await Quarter.update(
            { name, start_date, end_date },
            { where: { quarter_id: req.params.id } }
        );

        if (updatedRows === 0) {
            return res.status(404).json({ error: "No module found with that ID" });
        }

        res.json({ message: "Updated successfully" });
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;