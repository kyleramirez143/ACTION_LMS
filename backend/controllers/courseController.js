// controllers/courseController.js
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const db = require("../models/index.cjs");
const { Course, User, CourseInstructor, sequelize, Sequelize } = db;
const { Op } = Sequelize;

export const createCourse = async (req, res) => {
    try {
        const { title, description, trainer_email, image } = req.body;
        // const image = req.file ? req.file.filename : null;

        if (!title) return res.status(400).json({ error: "Title is required" });
        if (!trainer_email || !Array.isArray(trainer_email) || trainer_email.length === 0) {
            return res.status(400).json({ error: "Trainer emails are required" });
        }

        // Look up users by email array
        const trainers = await User.findAll({
            where: { email: { [Op.in]: trainer_email } },
        });

        // Check if all emails were found
        if (trainers.length !== trainer_email.length) {
            const foundEmails = trainers.map(t => t.email);
            const missingEmails = trainer_email.filter(e => !foundEmails.includes(e));
            return res.status(400).json({ error: `Trainers not found: ${missingEmails.join(", ")}` });
        }

        // Create the course
        const course = await Course.create({
            title,
            image: image || null,
            description,
            is_published: true,
        });

        const courseId = course.course_id;

        // Prepare CourseInstructor entries
        const courseInstructors = trainers.map(tr => ({
            course_id: courseId,
            managed_by: tr.id,
        }));

        // Insert all at once
        await CourseInstructor.bulkCreate(courseInstructors);

        res.status(201).json({
            message: "Course successfully added.",
            course,
            trainers: courseInstructors,
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
};

export const getCourses = async (req, res) => {
    try {
        const data = await Course.findAll({
            attributes: ["course_id", "title"],
            include: [
                {
                    model: CourseInstructor,
                    as: "course_instructors",
                    include: [
                        {
                            model: User,
                            as: "instructor",
                            attributes: ["first_name", "last_name", "email"]
                        }
                    ]
                }
            ]
        });
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getCourseById = async (req, res) => {
    try {
        const { course_id } = req.params;
        const course = await Course.findOne({
            where: { course_id }
        });

        res.status(200).json(course);
    } catch (err) {
        console.error("Get Course Error: ", err);
        res.status(500).json({ error: "Failed to fetch course", details: err.message});
    }
}

export const updateCourse = async (req, res) => {
    const { course_id } = req.params;
    const {
        title,
        description,
        image,
        is_published,
        instructor_ids,
        trainer_email
    } = req.body;

    const tx = await sequelize.transaction();

    try {
        // 1) Load course
        const course = await Course.findOne({ where: { course_id }, transaction: tx });

        if (!course) {
            await tx.rollback();
            return res.status(404).json({ error: "Course not found" });
        }

        // 2) Update course fields
        const updatePayload = {};

        if (title !== undefined) updatePayload.title = title;
        if (description !== undefined) updatePayload.description = description;
        if (image !== undefined) updatePayload.image = image;

        if (is_published !== undefined) updatePayload.is_published = is_published;

        if (Object.keys(updatePayload).length > 0) {
            await Course.update(updatePayload, {
                where: { course_id },
                transaction: tx
            });
        }

        // 3) Process instructor updates
        let newInstructorIds = null;

        if (Array.isArray(instructor_ids) && instructor_ids.length > 0) {
            newInstructorIds = instructor_ids;
        } else if (Array.isArray(trainer_email) && trainer_email.length > 0) {
            const users = await User.findAll({
                where: { email: { [Op.in]: trainer_email } },
                attributes: ["id", "email"],
                transaction: tx
            });

            const found = users.map(u => u.email);
            const missing = trainer_email.filter(e => !found.includes(e));

            if (missing.length > 0) {
                await tx.rollback();
                return res.status(400).json({
                    error: `Trainers not found: ${missing.join(", ")}`
                });
            }

            newInstructorIds = users.map(u => u.id);
        }

        // 4) Handle instructor add / remove
        if (Array.isArray(newInstructorIds)) {
            const currentRows = await CourseInstructor.findAll({
                where: { course_id },
                attributes: ["managed_by"],
                transaction: tx
            });

            const currentIds = currentRows.map(r => r.managed_by);

            const toAdd = newInstructorIds.filter(id => !currentIds.includes(id));
            const toRemove = currentIds.filter(id => !newInstructorIds.includes(id));

            const finalCount = currentIds.length + toAdd.length - toRemove.length;
            if (finalCount < 1) {
                await tx.rollback();
                return res.status(400).json({
                    error: "A course must have at least one instructor."
                });
            }

            if (toAdd.length > 0) {
                await CourseInstructor.bulkCreate(
                    toAdd.map(id => ({
                        course_id,
                        managed_by: id
                    })),
                    { transaction: tx }
                );
            }

            if (toRemove.length > 0) {
                await CourseInstructor.destroy({
                    where: {
                        course_id,
                        managed_by: { [Op.in]: toRemove }
                    },
                    transaction: tx
                });
            }
        }

        // 5) Commit
        await tx.commit();

        const updated = await Course.findOne({
            where: { course_id },
            include: [
                {
                    model: CourseInstructor,
                    as: "course_instructors",
                    include: [
                        {
                            model: User,
                            as: "instructor",
                            attributes: ["id", "first_name", "last_name", "email"]
                        }
                    ]
                }
            ]
        });

        return res.json({ message: "Updated", course: updated });

    } catch (err) {
        if (tx) await tx.rollback();
        console.error("updateCourse error:", err);
        return res.status(500).json({ error: err.message });
    }
};

export const deleteCourse = async (req, res) => {
    const { course_id } = req.params;
    await Course.destroy({ where: { course_id } });
    res.json({ message: "Deleted!" });
};


// Trainer functions
export const getTrainerCourses = async (req, res) => {
    try {
        const trainerId = req.user.id;

        const data = await Course.findAll({
            where: { is_published: true},
            include: [
                {
                    model: CourseInstructor,
                    as: "course_instructors",
                    where: { managed_by: trainerId },
                    include: [
                        {
                            model: User,
                            as: "instructor",
                            attributes: ["first_name", "last_name", "email"]
                        },
                    ]
                }
            ]
        });

        res.json(data);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
};
