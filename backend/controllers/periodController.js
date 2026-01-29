// controllers/periodController.js
import db from "../models/index.cjs";

// GET all module periods for a batch (for dropdown or display)
export const getPeriodsByBatch = async (req, res) => {
    try {
        const { batchId } = req.params;

        const periods = await db.Quarter.findAll({
            where: { curriculum_id: batchId },
            attributes: ["quarter_id", "name", "start_date", "end_date"],
            order: [["start_date", "ASC"]],
            raw: true,
        });

        res.json(periods);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch module periods" });
    }
};

// CREATE a new module period
export const addPeriod = async (req, res) => {
    // 1. Extract batch (which is the curriculum_id) and all dates
    const { batch, mod1_start, mod1_end, mod2_start, mod2_end, mod3_start, mod3_end, mod4_start, mod4_end } = req.body;

    try {
        // 2. Map frontend names to Database column names (start_date, end_date)
        const modulesToSave = [
            { name: "Quarter 1", start_date: mod1_start, end_date: mod1_end, curriculum_id: batch },
            { name: "Quarter 2", start_date: mod2_start, end_date: mod2_end, curriculum_id: batch },
            { name: "Quarter 3", start_date: mod3_start, end_date: mod3_end, curriculum_id: batch },
            { name: "Quarter 4", start_date: mod4_start, end_date: mod4_end, curriculum_id: batch },
        ].filter(m => m.start_date && m.end_date); // Only save if dates are provided

        // Delete existing modules for this curriculum to prevent duplicates
        await db.Quarter.destroy({ where: { curriculum_id: batch } });

        // Save all 4 modules at once
        const result = await db.Quarter.bulkCreate(modulesToSave);
        res.status(201).json(result);
    } catch (err) {
        console.error("Save Period Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// UPDATE a period
export const updatePeriod = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, start_date, end_date } = req.body;

        const [updated] = await db.Quarter.update(
            { name, start_date, end_date },
            { where: { quarter_id: id } }
        );

        if (!updated) return res.status(404).json({ error: "Period not found" });

        res.json({ message: "Period updated successfully" });
    } catch (err) {
        console.error("Update period error:", err);
        res.status(500).json({ error: "Failed to update module period" });
    }
};

// DELETE a period
export const deletePeriod = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await db.Quarter.destroy({ where: { quarter_id: id } });

        if (!deleted) return res.status(404).json({ error: "Period not found" });

        res.json({ message: "Period deleted successfully" });
    } catch (err) {
        console.error("Delete period error:", err);
        res.status(500).json({ error: "Failed to delete module period" });
    }
};

// Get a single quarter by ID
// Change from exports.getSingleQuarter to:
export const getSingleQuarter = async (req, res) => {
    try {
        const { id } = req.params;
        // Adjust "Quarter" to whatever your Model name is (e.g., Period or Quarter)
        const quarter = await Quarter.findByPk(id); 

        if (!quarter) {
            return res.status(404).json({ error: "Quarter not found" });
        }

        res.json(quarter);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
