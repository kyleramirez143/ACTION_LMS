// /backend/controllers/lectureController.js

import { Op } from "sequelize";
import db from "../models/index.cjs";

// import { v4 as uuidv4 } from "uuid";

// ✅ Destructure models
const {
    Lecture,
    Module,
    Resource,
    Assessment,
    LectureResource,
    sequelize
} = db;

// Create a new lecture
export const createLecture = async (req, res) => {
    try {
        const { title, description, module_id, start_date, end_date } = req.body;
        const trainerId = req.user?.id;

        if (!title || !module_id) {
            return res.status(400).json({ error: "Title, module_id, are required" });
        }

        // Validate dates
        if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
            return res.status(400).json({ error: "Start date cannot be after end date" });
        }

        const lecture = await Lecture.create({
            // lecture_id: uuidv4(),
            title,
            description,
            module_id,
            created_by: trainerId,
            start_date: start_date || null,
            end_date: end_date || null,
            content_url: null,
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
        let links = req.body.links || [];

        if (!lecture_id) {
            return res.status(400).json({ error: "lecture_id is required" });
        }

        // Parse links if sent as JSON string
        if (typeof links === "string") {
            try {
                links = JSON.parse(links);
            } catch {
                links = [links];
            }
        }

        const uploadedResources = [];

        // FILES
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const resource = await Resource.create({
                    file_url: file.filename,
                    display_name: file.originalname,
                    content_type: file.mimetype,
                });

                await LectureResource.create({
                    lecture_id,
                    resource_id: resource.resource_id
                });

                uploadedResources.push(resource);
            }
        }

        // LINKS
        if (Array.isArray(links)) {
            for (const link of links) {
                if (!link) continue;

                const resource = await Resource.create({
                    file_url: link,
                });

                await LectureResource.create({
                    lecture_id,
                    resource_id: resource.resource_id
                });

                uploadedResources.push(resource);
            }
        }

        res.status(200).json({
            message: "Resources uploaded successfully",
            resources: uploadedResources
        });

    } catch (err) {
        console.error("Upload Lecture File Error:", err);
        res.status(500).json({
            error: "Failed to upload lecture resources",
            details: err.message
        });
    }
};

// Get all lectures for a module, including resources
export const getLecturesByModule = async (req, res) => {
    const { module_id } = req.params;
    const userRole = req.user?.roles?.[0]; // e.g., "Trainer" or "Trainee"

    try {
        if (!module_id) return res.status(400).json({ error: "module_id is required" });

        const whereClause = { module_id };

        // Trainees only see visible lectures
        if (userRole === "Trainee") {
            whereClause.is_visible = true;
        }

        const lectures = await Lecture.findAll({
            where: whereClause,
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
                    through: { attributes: [] },
                    attributes: ["resource_id", "file_url", "is_visible", "created_at", "display_name"],
                },
                {
                    model: Assessment,
                    as: "assessments",
                    through: { attributes: [] },
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

// Update lecture visibility (is_visible flag)
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
    const { title, description, start_date, end_date } = req.body; // module_id is already in the route/params if needed

    try {
        if (!title) {
            return res.status(400).json({ error: "Lecture title is required" });
        }

        if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
            return res.status(400).json({ error: "Start date cannot be after end date" });
        }

        const lecture = await Lecture.findByPk(lecture_id);
        if (!lecture) {
            return res.status(404).json({ error: "Lecture not found" });
        }

        await lecture.update({
            title,
            description,
            start_date: start_date || null,
            end_date: end_date || null
        });

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
        const resources = await Resource.findAll({
            where: { resource_id: resource_ids },
            attributes: ["resource_id", "file_url"]
        });

        await sequelize.transaction(async (t) => {
            await LectureResource.destroy({
                where: { resources_id: resource_ids },
                transaction: t
            });

            await Resource.destroy({
                where: { resource_id: resource_ids },
                transaction: t
            });
        });

        // delete files AFTER transaction
        const uploadDir = path.resolve("uploads", "lectures");
        resources.forEach(({ file_url }) => {
            if (!file_url.startsWith("http")) {
                const filePath = path.join(uploadDir, file_url);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
        });

        res.json({ message: `${resources.length} resources deleted successfully.` });

    } catch (err) {
        console.error("Delete Resources Error:", err);
        res.status(500).json({ error: "Failed to delete resources", details: err.message });
    }
};

export const deleteLecture = async (req, res) => {
    const { lecture_id } = req.params;

    try {
        const lecture = await Lecture.findByPk(lecture_id, {
            include: [{
                model: Resource,
                as: "resources",
                attributes: ["file_url"]
            }]
        });

        if (!lecture) {
            return res.status(404).json({ error: "Lecture not found" });
        }

        const files = lecture.resources
            .map(r => r.file_url)
            .filter(url => !url.startsWith("http"));

        await sequelize.transaction(async (t) => {
            await Lecture.destroy({
                where: { lecture_id },
                transaction: t
            });
        });

        // delete physical files after DB success
        const uploadDir = path.resolve("uploads", "lectures");
        files.forEach(file => {
            const filePath = path.join(uploadDir, file);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });

        res.json({ message: "Lecture deleted successfully" });

    } catch (err) {
        console.error("Delete Lecture Error:", err);
        res.status(500).json({ error: "Failed to delete lecture", details: err.message });
    }
};

export const getLecturesByTrainer = async (req, res) => {
    const trainerId = req.user.id;
    try {
        const modules = await Module.findAll({
            where: { created_by: trainerId },
            include: [
                {
                    model: Lecture,
                    as: "lectures",
                    attributes: ["lecture_id", "title"]
                }
            ],
            order: [["created_at", "ASC"]],
        });
        res.json(modules);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch modules and lectures" });
    }
};

// PATCH /api/lectures/resource/visibility/:resource_id
export const updateResourceVisibility = async (req, res) => {
    const { resource_id } = req.params;
    const { is_visible } = req.body;

    if (typeof is_visible !== "boolean") {
        return res.status(400).json({ error: "is_visible must be boolean" });
    }

    try {
        const [updated] = await Resource.update(
            { is_visible },
            { where: { resource_id } }
        );

        if (!updated) {
            return res.status(404).json({ error: "Resource not found" });
        }

        res.json({
            message: `Resource ${is_visible ? "made visible" : "hidden"}`,
            is_visible
        });
    } catch (err) {
        console.error("Update Resource Visibility Error:", err);
        res.status(500).json({ error: "Failed to update resource visibility" });
    }
};


// PATCH /api/lectures/resource/rename/:resource_id
export const renameResource = async (req, res) => {
    const { resource_id } = req.params;
    const { display_name } = req.body;

    if (!display_name) {
        return res.status(400).json({ error: "display_name is required" });
    }

    try {
        const resource = await Resource.findByPk(resource_id);
        if (!resource) {
            return res.status(404).json({ error: "Resource not found" });
        }

        await resource.update({ display_name });

        res.json({
            message: "Resource filename updated",
            resource
        });
    } catch (err) {
        console.error("Rename Resource Error:", err);
        res.status(500).json({ error: "Failed to rename resource" });
    }
};


// DELETE /api/lectures/resource/:resource_id
export const deleteResource = async (req, res) => {
    const { resource_id } = req.params;

    try {
        const resource = await Resource.findByPk(resource_id);
        if (!resource) {
            return res.status(404).json({ error: "Resource not found" });
        }

        await sequelize.transaction(async (t) => {
            await LectureResource.destroy({
                where: { resource_id: resource_id },
                transaction: t
            });

            await Resource.destroy({
                where: { resource_id },
                transaction: t
            });
        });

        // delete file if it’s not a link
        if (!resource.file_url.startsWith("http")) {
            const filePath = path.join("uploads/lectures", resource.file_url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        res.json({ message: "Resource removed successfully" });

    } catch (err) {
        console.error("Delete Resource Error:", err);
        res.status(500).json({ error: "Failed to delete resource" });
    }
};

// GET /api/lectures/batch/:batch_id
export const getLecturesByBatch = async (req, res) => {
    try {
        const { batch_id } = req.params;
        const userRole = req.user?.roles?.[0];

        // 1️⃣ Get course IDs
        const courses = await db.Course.findAll({
            where: { batch_id },
            attributes: ["course_id"],
            raw: true
        });

        const courseIds = courses.map(c => c.course_id);
        if (courseIds.length === 0) return res.json([]);

        // 2️⃣ Get module IDs
        const modules = await db.Module.findAll({
            where: { course_id: courseIds },
            attributes: ["module_id"],
            raw: true
        });

        const moduleIds = modules.map(m => m.module_id);
        if (moduleIds.length === 0) return res.json([]);

        // 3️⃣ Get lectures
        const whereClause = { module_id: moduleIds };
        if (userRole === "Trainee") whereClause.is_visible = true;

        const lectures = await db.Lecture.findAll({
            where: whereClause,
            include: [{
                model: db.Module,
                as: "module",
                attributes: ["module_id", "title"]
            }],
            order: [["created_at", "ASC"]],
        });

        res.json(lectures);
    } catch (err) {
        console.error("Get Lectures By Batch Error:", err);
        res.status(500).json({ error: "Failed to fetch lectures" });
    }
};

export const getModulesAndLecturesByBatch = async (req, res) => {
    try {
        const { batch_id } = req.params;
        const userRole = req.user?.roles?.[0];

        if (!batch_id) return res.status(400).json({ error: "batch_id is required" });

        // 1️⃣ Get all courses linked to this batch
        const courses = await db.Course.findAll({
            include: [{
                model: db.Batch,
                as: "batch",
                where: { batch_id },
                attributes: [] // we only need course_id
            }],
            attributes: ["course_id"],
            raw: true
        });

        const courseIds = courses.map(c => c.course_id);
        if (courseIds.length === 0) return res.json({ modules: [], lectures: [] });

        // 2️⃣ Get all modules for these courses
        const modules = await db.Module.findAll({
            where: { course_id: { [Op.in]: courseIds } },
            attributes: ["module_id", "title", "start_date", "end_date"],
            raw: true
        });

        const moduleIds = modules.map(m => m.module_id);

        // 3️⃣ Get all lectures for these modules
        let lectures = [];
        if (moduleIds.length > 0) {
            const lectureWhere = { module_id: { [Op.in]: moduleIds } };
            if (userRole === "Trainee") lectureWhere.is_visible = true;

            lectures = await db.Lecture.findAll({
                where: lectureWhere,
                attributes: ["lecture_id", "title", "module_id", "start_date", "end_date", "is_visible"],
                include: [
                    {
                        model: db.Module,
                        as: "module",
                        attributes: ["module_id", "title"],
                    }
                ],
                order: [["created_at", "ASC"]]
            });
        }

        res.json({ modules, lectures });
    } catch (err) {
        console.error("Get Modules & Lectures By Batch Error:", err);
        res.status(500).json({
            error: "Failed to fetch modules and lectures by batch",
            details: err.message
        });
    }
};