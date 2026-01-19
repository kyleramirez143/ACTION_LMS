// /backend/controllers/moduleController.js

import db from "../models/index.cjs";
const { Module, Course, CourseInstructor, User, Lecture } = db;

export const createModule = async (req, res) => {
    try {
        const { title, description, course_id, start_date, end_date } = req.body;
        const trainerId = req.user?.id;

        if (!title) return res.status(400).json({ error: "Module title is required" });
        if (!course_id) return res.status(400).json({ error: "Course ID is required" });
        if (!trainerId) return res.status(401).json({ error: "Unauthorized trainer" });

        const imageFilename = req.file ? req.file.filename : null;

        const module = await Module.create({
            course_id,
            title,
            description,
            start_date: start_date || null,
            end_date: end_date || null,
            image: imageFilename,
            created_by: trainerId,
            is_visible: false,
            created_at: new Date(),
            updated_at: new Date()
        });

        res.status(201).json({
            message: "Module created successfully",
            module
        });
    } catch (error) {
        console.error("Create Module Error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getModulesByCourse = async (req, res) => {
    try {
        const { course_id } = req.params;

        // Determine user role from req.user
        const userRole = req.user?.roles?.[0]; // or however your JWT roles are structured

        const whereClause = { course_id };

        // If Trainee, only return visible modules
        if (userRole === "Trainee") {
            whereClause.is_visible = true;
        }

        const modules = await Module.findAll({
            where: whereClause,
            include: [
                { model: Lecture, as: "lectures" }
            ],
            order: [["created_at", "ASC"]]
        });

        res.json(modules || []);
    } catch (error) {
        console.error("Get Modules Error:", error);
        res.json([]);
    }
};

export const updateModule = async (req, res) => {
    try {
        const { module_id } = req.params;

        const updates = {
            title: req.body.title,
            description: req.body.description,
            start_date: req.body.start_date || null,
            end_date: req.body.end_date || null,
            updated_at: new Date()
        };

        if (req.file) updates.image = req.file.filename;

        const [updated] = await Module.update(updates, { where: { module_id } });

        if (!updated) return res.status(404).json({ error: "Module not found" });

        res.json({ message: "Module updated successfully" });
    } catch (error) {
        console.error("Update Module Error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getModuleById = async (req, res) => {
    try {
        const { module_id } = req.params;
        const module = await Module.findOne({ where: { module_id } });

        if (!module) return res.status(404).json({ error: "Module not found" });

        res.status(200).json(module);
    } catch (err) {
        console.error("Get Module Error:", err);
        res.status(500).json({ error: "Failed to fetch module", details: err.message });
    }
};

export const deleteModule = async (req, res) => {
    try {
        const { module_id } = req.params;

        const deleted = await Module.destroy({ where: { module_id } });

        if (!deleted) return res.status(404).json({ error: "Module not found" });

        res.json({ message: "Module deleted successfully" });
    } catch (error) {
        console.error("Delete Module Error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const updateModuleVisibility = async (req, res) => {
    try {
        const { module_id } = req.params;
        const { is_visible } = req.body; // Expects true or false

        // Basic validation
        if (typeof is_visible !== 'boolean') {
            return res.status(400).json({ error: "Invalid value for is_visible. Must be true or false." });
        }

        const updates = {
            is_visible: is_visible,
            updated_at: new Date()
        };

        const [updated] = await Module.update(updates, { where: { module_id } });

        if (!updated) {
            return res.status(404).json({ error: "Module not found" });
        }

        res.json({
            message: `Module visibility set to ${is_visible ? 'visible' : 'hidden'} successfully`,
            is_visible: is_visible // Return the new state
        });
    } catch (error) {
        console.error("Update Module Visibility Error:", error);
        res.status(500).json({ error: error.message });
    }
};