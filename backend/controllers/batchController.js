import { Op, fn, col, where } from "sequelize";
import db from "../models/index.cjs";

// CREATE
export const addBatch = async (req, res) => {
    try {
        const {
            name,
            location,
            start_date,
            end_date,
        } = req.body;

        console.log("Received batch data:", req.body);

        // --- Validation ---
        const errors = [];
        if (!name || name.trim() === "") errors.push("Batch name is required");
        if (!location || location.trim() === "") errors.push("Location is required");
        if (!start_date) errors.push("Start date is required");
        if (!end_date) errors.push("End date is required");

        // Validate date formats
        if (start_date && isNaN(new Date(start_date))) errors.push("Start date is invalid");
        if (end_date && isNaN(new Date(end_date))) errors.push("End date is invalid");

        if (errors.length > 0) {
            return res.status(400).json({ error: errors.join(", ") });
        }

        // --- Create batch ---
        const newBatch = await db.Batch.create({
            name: name.trim(),
            location: location.trim(),
            start_date,
            end_date,
        });

        res.status(201).json(newBatch);

    } catch (err) {
        console.error("Add Batch Error:", err);

        // Sequelize-specific errors
        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({ error: "Batch name already exists" });
        }
        if (err.name === "SequelizeValidationError") {
            return res.status(400).json({ error: err.errors.map(e => e.message).join(", ") });
        }

        // Fallback for other errors
        return res.status(500).json({
            error: "Failed to add batch",
            details: err.message || "Unknown error"
        });
    }
};

// GET ONE (For Edit Mode)
export const getBatchById = async (req, res) => {
    try {
        const { id } = req.params;
        // We use batch_id because that is your SQL Primary Key
        const batch = await db.Batch.findOne({ where: { batch_id: id } });

        if (!batch) return res.status(404).json({ error: "Batch not found" });
        res.json(batch);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

// UPDATE
export const updateBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, location, start_date, end_date } = req.body;

        const [updated] = await db.Batch.update(
            { name, location, start_date, end_date },
            { where: { batch_id: id } }
        );

        if (!updated) return res.status(404).json({ error: "Batch not found" });
        res.json({ message: "Batch updated successfully" });
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
};

// DELETE and BULK DELETE
export const deleteBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await db.Batch.destroy({ where: { batch_id: id } });
        if (!deleted) return res.status(404).json({ error: "Batch not found" });
        res.json({ message: "Batch deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
};

export const bulkDeleteBatches = async (req, res) => {
    try {
        const { batchIds } = req.body;

        if (!Array.isArray(batchIds) || batchIds.length === 0) {
            return res.status(400).json({ error: "No batch IDs provided" });
        }

        const deleted = await db.Batch.destroy({
            where: {
                batch_id: {
                    [Op.in]: batchIds,
                },
            },
        });

        return res.json({
            message: `${deleted} batch(es) deleted successfully`,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Bulk delete failed" });
    }
};

export const getAllBatches = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const offset = (page - 1) * limit;
        const search = req.query.search || "";
        const locationFilter = req.query.location || "";

        const whereClause = {};

        if (locationFilter && locationFilter !== "All") {
            whereClause.location = locationFilter;
        }

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { location: { [Op.iLike]: `%${search}%` } },
                where(fn("TO_CHAR", col("start_date"), "YYYY-MM-DD"), { [Op.iLike]: `%${search}%` }),
                where(fn("TO_CHAR", col("end_date"), "YYYY-MM-DD"), { [Op.iLike]: `%${search}%` }),
            ];
        }

        const totalBatches = await db.Batch.count({ where: whereClause });
        const totalPages = Math.ceil(totalBatches / limit);

        const batches = await db.Batch.findAll({
            where: whereClause,
            order: [["start_date", "ASC"]],
            limit,
            offset,
            raw: true,
        });

        return res.json({
            batches,
            totalPages,
            currentPage: page,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch batches" });
    }
};