// controllers/moduleController.js
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { Module, Course, User, Lecture } = require("../models/index.cjs");

// =========================
// CREATE MODULE
// =========================
export const createModule = async (req, res) => {
    try {
        const { title, description, course_id, created_by, cover } = req.body;

        if (!title || !course_id || !created_by) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const module = await Module.create({
            title,
            description,
            course_id,
            created_by,
            cover
        });

        res.status(201).json(module);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// =========================
// GET ALL MODULES
// =========================
export const getModules = async (req, res) => {
    try {
        const modules = await Module.findAll({
            include: [
                { model: Course, as: "course" },
                { model: User, as: "creator" },
               // { model: Lecture, as: "lectures" }
            ],
            order: [["created_at", "DESC"]]
        });

        res.json(modules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// =========================
// GET MODULE BY ID
// =========================
export const getModuleById = async (req, res) => {
    try {
        const { id } = req.params;

        const module = await Module.findByPk(id, {
            include: [
                { model: Course, as: "course" },
                { model: User, as: "creator" },
              //  { model: Lecture, as: "lectures" }
            ]
        });

        if (!module) return res.status(404).json({ error: "Module not found" });

        res.json(module);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// =========================
// UPDATE MODULE
// =========================
export const updateModule = async (req, res) => {
    try {
        const { id } = req.params;

        const module = await Module.findByPk(id);
        if (!module) return res.status(404).json({ error: "Module not found" });

        await module.update({
            title: req.body.title,
            description: req.body.description,
            course_id: req.body.course_id,
            created_by: req.body.created_by
        });


        res.json({ message: "Module updated successfully", module });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// =========================
// DELETE MODULE
// =========================
export const deleteModule = async (req, res) => {
    try {
        const { id } = req.params;

        const module = await Module.findByPk(id);
        if (!module) return res.status(404).json({ error: "Module not found" });

        await module.destroy();

        res.json({ message: "Module deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
