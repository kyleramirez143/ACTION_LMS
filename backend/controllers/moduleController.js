// /backend/controllers/moduleController.js

import db from "../models/index.cjs";
const { Module, Course, CourseInstructor, User, Lecture } = db;

export const createModule = async (req, res) => {
    try {
        const { title, description, course_id } = req.body;
        const trainerId = req.user?.id;

        if (!title) return res.status(400).json({ error: "Module title is required" });
        if (!course_id) return res.status(400).json({ error: "Course ID is required" });
        if (!trainerId) return res.status(401).json({ error: "Unauthorized trainer" });

        const imageFilename = req.file ? req.file.filename : null;

        const module = await Module.create({
            course_id,
            title,
            description,
            image: imageFilename,
            created_by: trainerId,
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

        const modules = await Module.findAll({
            where: { course_id },
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

