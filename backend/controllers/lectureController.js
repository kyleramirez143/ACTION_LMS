// controllers/lectureController.js
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { Lecture, Module, User } = require("../models/index.cjs");

export const createLecture = async (req, res) => {
    try {
        const lecture = await Lecture.create(req.body);
        res.json(lecture);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getLectures = async (req, res) => {
    try {
        const lectures = await Lecture.findAll({
            include: [
                { model: Module, as: "module" },
                { model: User, as: "creator" }
            ]
        });
        res.json(lectures);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
