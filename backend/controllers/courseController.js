// controllers/courseController.js
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const db = require("../models/index.cjs");
// console.log(db);
const { Op } = require("sequelize");

const { Course, User, CourseInstructor } = db;
// console.log(Course);

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

export const updateCourse = async (req, res) => {
    const { course_id } = req.params;
    await Course.update(req.body, { where: { course_id } });
    res.json({ message: "Updated!" });
};

export const deleteCourse = async (req, res) => {
    const { course_id } = req.params;
    await Course.destroy({ where: { course_id } });
    res.json({ message: "Deleted!" });
};
