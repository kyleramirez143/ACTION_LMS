import pkg from "../models/index.cjs";
const { Lecture, LectureResource, Resource } = pkg;
import { v4 as uuidv4 } from "uuid";

// Create a new lecture
export const createLecture = async (req, res) => {
    try {
        const { title, description, module_id } = req.body;
        const trainerId = req.user?.id;

        if (!title || !module_id ) {
            return res.status(400).json({ error: "Title, module_id, and course_id are required" });
        }

        const lecture = await Lecture.create({
            lecture_id: uuidv4(),
            title,
            description,
            module_id,
            created_by: trainerId,
            content_url: null // initially empty
        });

        res.status(201).json(lecture);
    } catch (err) {
        console.error("Create Lecture Error:", err);
        res.status(500).json({ error: "Failed to create lecture", details: err.message });
    }
};

// Upload a file to a lecture
export const uploadLectureFile = async (req, res) => {
    try {
        const { lecture_id } = req.body;
        if (!lecture_id || !req.file) {
            return res.status(400).json({ error: "lecture_id and file are required" });
        }

        const updated = await Lecture.update(
            { content_url: req.file.path },
            { where: { lecture_id } }
        );

        if (!updated[0]) {
            return res.status(404).json({ error: "Lecture not found" });
        }

        res.status(200).json({
            message: "File uploaded successfully",
            file_url: req.file.path
        });

    } catch (err) {
        console.error("Upload Lecture File Error:", err);
        res.status(500).json({ error: "Failed to upload lecture file", details: err.message });
    }
};

// Get all lectures for a specific module
export const getLecturesByModule = async (req, res) => {
    try {
        const { module_id } = req.params;
        if (!module_id) {
            return res.status(400).json({ error: "module_id is required" });
        }

        // Quick fix: remove include for now
        const lectures = await Lecture.findAll({
            where: { module_id },
            order: [["created_at", "ASC"]],
            attributes: ["lecture_id", "title", "content_url", "module_id", "course_id"]
        });

        res.json(lectures || []);

    } catch (err) {
        console.error("Get Lectures Error:", err);
        res.status(500).json({ error: "Failed to fetch lectures", details: err.message });
    }
};
