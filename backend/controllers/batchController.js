import { Op, fn, col, where } from "sequelize";
import db from "../models/index.cjs";

const getBatchCode = (name) => {
    if (!name) return "";
    const match = name.match(/\d+/);
    return match ? `B${match[0]}` : name.replace(/\s+/g, "");
};

const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    return `${mm}${dd}${yy}`;
};

// CREATE
export const addBatch = async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
        const { name, location, start_date, end_date } = req.body;

        // --- Validation ---
        const errors = [];
        if (!name?.trim()) errors.push("Batch name is required");
        if (!location?.trim()) errors.push("Location is required");
        if (!start_date) errors.push("Start date is required");
        if (!end_date) errors.push("End date is required");

        if (errors.length) {
            return res.status(400).json({ error: errors.join(", ") });
        }

        // --- Create Batch ---
        const batch = await db.Batch.create(
            {
                name: name.trim(),
                location: location.trim(),
                start_date,
                end_date,
            },
            { transaction }
        );

        // --- Build Curriculum Name ---
        const curriculumName = `${getBatchCode(batch.name)}${batch.location}${formatDate(batch.start_date)}–${formatDate(batch.end_date)}`;

        // --- Create Curriculum ---
        await db.Curriculum.create(
            {
                batch_id: batch.batch_id,
                name: curriculumName,
                start_date: batch.start_date,
                end_date: batch.end_date,
            },
            { transaction }
        );

        await transaction.commit();

        return res.status(201).json({
            message: "Batch and Curriculum created successfully",
            batch,
        });

    } catch (err) {
        await transaction.rollback();
        console.error("Add Batch Error:", err);

        return res.status(500).json({
            error: "Failed to create batch and curriculum",
            details: err.message,
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
    const transaction = await db.sequelize.transaction();

    try {
        const { id } = req.params;
        const { name, location, start_date, end_date } = req.body;

        // 1️⃣ Fetch existing batch
        const batch = await db.Batch.findOne({
            where: { batch_id: id },
            transaction,
        });

        if (!batch) {
            await transaction.rollback();
            return res.status(404).json({ error: "Batch not found" });
        }

        // 2️⃣ Update batch
        await batch.update(
            {
                name,
                location,
                start_date,
                end_date,
            },
            { transaction }
        );

        // 3️⃣ Recompute curriculum name
        const newCurriculumName = `${getBatchCode(batch.name)}${batch.location}${formatDate(batch.start_date)}–${formatDate(batch.end_date)}`;

        // 4️⃣ Update linked curriculum
        await db.Curriculum.update(
            {
                name: newCurriculumName,
                start_date: batch.start_date,
                end_date: batch.end_date,
            },
            {
                where: { batch_id: batch.batch_id },
                transaction,
            }
        );

        await transaction.commit();

        return res.json({ message: "Batch and curriculum updated successfully" });

    } catch (err) {
        await transaction.rollback();
        console.error("Update Batch Error:", err);

        return res.status(500).json({
            error: "Failed to update batch and curriculum",
            details: err.message,
        });
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

export const getAllBatchesForDropdown = async (req, res) => {
    try {
        const batches = await db.Batch.findAll({
            attributes: ["batch_id", "name", "location", "start_date", "end_date"],
            include: [{
                model: db.Curriculum,
                as: 'curriculum', // Ensure this matches your association alias
                attributes: ["curriculum_id"],
                include: [{
                    model: db.Quarter,
                    as: 'quarters',
                    attributes: ["quarter_id"]
                }]
            }]
        });

        const formatted = batches.map(b => {
            // Check if curriculum exists safely
            const curr = b.curriculum || null;
            // Count quarters safely
            const qCount = curr && curr.quarters ? curr.quarters.length : 0;

            return {
                batch_id: b.batch_id,
                name: b.name,
                location: b.location,
                start_date: b.start_date, // MUST BE PASSED TO FRONTEND
                end_date: b.end_date,
                curriculum_id: curr ? curr.curriculum_id : null,
                isFull: qCount >= 4
            };
        });

        res.json(formatted);
    } catch (err) {
        console.error("SQL Error:", err.message);
        res.status(500).json({ error: "Check terminal for SQL error" });
    }
};