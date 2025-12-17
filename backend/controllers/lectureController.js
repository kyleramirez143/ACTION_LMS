// /backend/controllers/lectureController.js

import pkg from "../models/index.cjs";
import fs from "fs"; // Need filesystem access for file deletion
import path from "path";
const {
    Course,
    Module,
    Lecture,
    Resource,
    Assessment,
    LectureResource,
    LectureAssessment,
    sequelize // Assume you have access to sequelize for transactions/raw queries
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
                    model: Module,
                    as: "module",
                    attributes: ["module_id", "course_id"],
                },
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

// Get a single lecture by ID, including resources and assessments
export const getLectureById = async (req, res) => {
    const { lecture_id } = req.params;

    try {
        if (!lecture_id) {
            return res.status(400).json({ error: "lecture_id is required" });
        }

        const lecture = await Lecture.findByPk(lecture_id, {
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

        if (!lecture) {
            return res.status(404).json({ error: "Lecture not found" });
        }

        res.status(200).json({ lecture }); // Wrap the result in an object for consistency
    } catch (err) {
        console.error("Get Lecture By ID Error:", err);
        res.status(500).json({ error: "Failed to fetch lecture", details: err.message });
    }
};

// Update lecture visibility (is_hidden flag)
export const updateLectureVisibility = async (req, res) => {
    const { lecture_id } = req.params;
    const { is_visible } = req.body;

    // Basic input validation
    if (typeof is_visible !== 'boolean') {
        return res.status(400).json({ error: "is_visible (boolean) is required." });
    }

    try {
        const [updated] = await Lecture.update(
            { is_visible },
            {
                where: { lecture_id },
            }
        );

        if (updated) {
            return res.status(200).json({
                message: `Lecture visibility updated to ${is_visible ? 'hidden' : 'visible'} successfully.`,
                is_visible,
            });
        }

        return res.status(404).json({ error: "Lecture not found or no changes made." });

    } catch (err) {
        console.error("Update Lecture Visibility Error:", err);
        res.status(500).json({ error: "Failed to update lecture visibility", details: err.message });
    }
};

export const updateLecture = async (req, res) => {
    const { lecture_id } = req.params;
    const { title, description } = req.body; // module_id is already in the route/params if needed

    try {
        if (!title) {
            return res.status(400).json({ error: "Lecture title is required" });
        }

        const lecture = await Lecture.findByPk(lecture_id);
        if (!lecture) {
            return res.status(404).json({ error: "Lecture not found" });
        }

        await lecture.update({ title, description });

        res.status(200).json({
            message: "Lecture metadata updated successfully",
            lecture: lecture,
        });
    } catch (err) {
        console.error("Update Lecture Error:", err);
        res.status(500).json({ error: "Failed to update lecture", details: err.message });
    }
};

export const deleteResources = async (req, res) => {
    const { resource_ids } = req.body;

    if (!Array.isArray(resource_ids) || resource_ids.length === 0) {
        return res.status(400).json({ error: "An array of resource_ids is required." });
    }

    try {
        // 1. Find the resource file names to delete from the filesystem
        const resources = await Resource.findAll({
            where: { resource_id: resource_ids },
            attributes: ['resource_id', 'file_url']
        });

        // Use a transaction to ensure atomic deletion
        await sequelize.transaction(async (t) => {
            // 2. Delete entries in the junction table (LectureResource)
            await LectureResource.destroy({
                where: { resources_id: resource_ids },
                transaction: t
            });

            // 3. Delete entries in the Resource table
            await Resource.destroy({
                where: { resource_id: resource_ids },
                transaction: t
            });

            // 4. Delete the physical files
            const uploadDir = path.resolve('uploads', 'lectures'); // Adjust path as needed

            resources.forEach(resource => {
                const filePath = path.join(uploadDir, resource.file_url);

                // Only attempt deletion if file exists (prevents crashing on missing files)
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`Deleted file: ${resource.file_url}`);
                } else {
                    console.warn(`File not found on disk, skipping: ${resource.file_url}`);
                }
            });
        });

        res.status(200).json({ message: `${resources.length} resources deleted successfully.` });

    } catch (err) {
        console.error("Delete Resources Error:", err);
        res.status(500).json({ error: "Failed to delete resources", details: err.message });
    }
};

export const deleteLecture = async (req, res) => {
    const { lecture_id } = req.params;

    try {
        // Fetch all resources associated with the lecture before deletion
        const lecture = await Lecture.findByPk(lecture_id, {
            include: [{
                model: Resource,
                as: 'resources',
                attributes: ['file_url']
            }]
        });

        if (!lecture) {
            return res.status(404).json({ error: "Lecture not found" });
        }

        const resourcesToDelete = lecture.resources.map(res => res.file_url);

        await sequelize.transaction(async (t) => {
            // Sequelize is usually configured to cascade delete junction table entries
            // but explicitly deleting the lecture is the main step
            const deletedCount = await Lecture.destroy({
                where: { lecture_id },
                transaction: t
            });

            if (deletedCount === 0) {
                return res.status(404).json({ error: "Lecture not found or already deleted" });
            }

            // Clean up physical files after successful database deletion
            const uploadDir = path.resolve('uploads', 'lectures');
            resourcesToDelete.forEach(fileUrl => {
                const filePath = path.join(uploadDir, fileUrl);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`Deleted file: ${fileUrl}`);
                }
            });
        });


        res.status(200).json({ message: "Lecture and associated data deleted successfully" });
    } catch (err) {
        console.error("Delete Lecture Error:", err);
        res.status(500).json({ error: "Failed to delete lecture", details: err.message });
    }
};

