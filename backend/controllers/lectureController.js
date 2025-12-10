// /backend/controllers/lectureController.js

import pkg from "../models/index.cjs";
const {
    Lecture,
    Resource,
    Assessment,
    LectureResource,
    LectureAssessment
} = pkg;

// import { v4 as uuidv4 } from "uuid";


// Create a new lecture
export const createLecture = async (req, res) => {
    try {
        const { title, description, module_id } = req.body;
        const trainerId = req.user?.id;

        if (!title || !module_id) {
            return res.status(400).json({ error: "Title, module_id, are required" });
        }

        const lecture = await Lecture.create({
            // lecture_id: uuidv4(),
            title,
            description,
            module_id,
            created_by: trainerId,
            content_url: null // initially empty
        });

        res.status(201).json({
            lecture,
            message: "Lecture created successfully",
        });
    } catch (err) {
        console.error("Create Lecture Error:", err);
        res.status(500).json({ error: "Failed to create lecture", details: err.message });
    }
};

// Upload a file/resource for a lecture
export const uploadLectureFile = async (req, res) => {
    try {
        const { lecture_id } = req.body;
        if (!lecture_id || !req.files?.length) {
            return res.status(400).json({ error: "lecture_id and files are required" });
        }

        const uploadedResources = [];

        for (let file of req.files) {
            const resource = await Resource.create({
                file_url: file.filename
            });

            await LectureResource.create({
                lecture_id,
                resources_id: resource.resource_id
            });

            uploadedResources.push(resource);
        }

        res.status(200).json({
            message: "Resources uploaded successfully",
            resources: uploadedResources
        });
    } catch (err) {
        console.error("Upload Lecture File Error:", err);
        res.status(500).json({ error: "Failed to upload lecture resources", details: err.message });
    }
};

// Get all lectures for a module, including resources
export const getLecturesByModule = async (req, res) => {
    const { module_id } = req.params;

    try {
        if (!module_id) {
            return res.status(400).json({ error: "module_id is required" });
        }

        const lectures = await Lecture.findAll({
            where: { module_id },
            order: [["created_at", "ASC"]],
            include: [
                {
                    model: Resource,
                    as: "resources",
                    through: { attributes: [] }, // hide junction table info
                    attributes: ["resource_id", "file_url", "created_at"],
                },
                {
                    model: Assessment,
                    as: "assessments",
                    through: { attributes: [] }, // hide junction table info
                    attributes: ["assessment_id", "title", "description", "pdf_source_url", "assessment_type_id", "is_published"],
                },
            ],
        });

        res.status(200).json(lectures);
    } catch (err) {
        console.error("Get Lectures Error:", err);
        res.status(500).json({ error: "Failed to fetch lectures", details: err.message });
    }
};

