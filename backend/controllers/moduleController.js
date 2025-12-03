import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { Module, CourseInstructor, User, Lecture } = require("../models/index.cjs");

export const createModule = async (req, res) => {
    try {
        const { title, description, is_active, has_deadline, course_id } = req.body;
        const trainerId = req.user?.user_id || "c0000000-0000-0000-0000-000000000002";

        if (!title) return res.status(400).json({ error: "Module title is required" });
        if (!course_id) return res.status(400).json({ error: "Course ID is required" });

        // Optionally: verify course exists here if needed
        // const courseExists = await Course.findByPk(course_id);
        // if (!courseExists) return res.status(404).json({ error: "Course not found" });

        const module = await Module.create({
            course_id,
            title,
            description,
            is_active: is_active ?? true,
            has_deadline: has_deadline ?? false,
            created_by: trainerId
        });

        res.status(201).json({ message: "Module created successfully", module, course_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const getModules = async (req, res) => {
    try {
        const trainerId = req.user?.user_id || "c0000000-0000-0000-0000-000000000002";

        // Find all modules for courses this trainer manages
        const courseInstructor = await CourseInstructor.findAll({ where: { managed_by: trainerId } });
        const courseIds = courseInstructor.map(ci => ci.course_id);

        const modules = await Module.findAll({
            where: { course_id: courseIds },
            include: [{ model: User, as: "creator", attributes: ["first_name", "last_name", "email"] }]
        });

        res.json(modules);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const getModulesByCourse = async (req, res) => {
    try {
        const modules = await Module.findAll({
            where: { course_id: req.params.course_id },
            include: [
                { model: Lecture, as: "lectures" }
            ],
            order: [["created_at", "ASC"]]
        });

        return res.json(modules);
    } catch (error) {
        console.error("Get Modules Error:", error);
        res.status(500).json({ error: "Failed to fetch modules" });
    }
};


export const updateModule = async (req, res) => {
    try {
        const { module_id } = req.params;
        const updated = await Module.update(req.body, { where: { module_id } });

        if (!updated[0]) return res.status(404).json({ error: "Module not found" });

        res.json({ message: "Module updated successfully" });
    } catch (error) {
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
        res.status(500).json({ error: error.message });
    }
};
