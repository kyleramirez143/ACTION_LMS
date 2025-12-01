// controllers/moduleController.js
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { Module, Course, User, Lecture } = require("../models/index.cjs");

export const createModule = async (req, res) => {
    try {
        const module = await Module.create(req.body);
        res.json(module);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getModules = async (req, res) => {
    try {
        const modules = await Module.findAll({
            include: [
                { model: Course, as: "course" },
                { model: User, as: "creator" },
                { model: Lecture, as: "lectures" }
            ]
        });
        res.json(modules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
