import pkg from "../models/index.cjs";
const { Lecture } = pkg;
import { v4 as uuidv4 } from "uuid";



export const createLecture = async (req, res) => {
    try {
        const { title, description, module_id, course_id } = req.body;
        const trainerId = req.user?.user_id || "c0000000-0000-0000-0000-000000000002";

        if (!title || !module_id || !course_id) {
            return res.status(400).json({ error: "Title, module_id, and course_id required" });
        }

        const lecture = await Lecture.create({
            lecture_id: uuidv4(),
            title,
            module_id,
            course_id,
            created_by: trainerId,
            content_url: null // initially empty
        });

        res.status(201).json(lecture);
    } catch (err) {
        console.error("Create Lecture Error:", err);
        res.status(500).json({ error: "Failed to create lecture" });
    }
};
export const uploadLectureFile = async (req, res) => {
    try {
        const { lecture_id } = req.body;

        if (!lecture_id || !req.file) {
            return res.status(400).json({ error: "lecture_id and file are required" });
        }

        // Update lecture with file path
        await Lecture.update(
            { content_url: req.file.path },
            { where: { lecture_id } }
        );

        res.status(200).json({
            message: "File uploaded successfully",
            file_url: req.file.path
        });

    } catch (err) {
        console.error("Upload Lecture File Error:", err);
        res.status(500).json({ error: "Failed to upload lecture file" });
    }
};
export const getLecturesByModule = async (req, res) => {
    try {
        const lectures = await Lecture.findAll({
            where: { module_id: req.params.module_id },
            order: [["created_at", "ASC"]],
            attributes: ["lecture_id", "title", "content_url", "module_id", "course_id"],
        });

        res.json(lectures);
    } catch (err) {
        console.error("Get Lectures Error:", err);
        res.status(500).json({ error: "Failed to fetch lectures" });
    }
};
