import { createRequire } from "module";
const require = createRequire(import.meta.url);

const { CalendarEvent, Module, Lecture } = require("../models/index.cjs");

/* ============================================================
   GET all schedules by Batch (Admin overview)
============================================================ */
export const getSchedulesByBatch = async (req, res) => {
    const { batch_id } = req.params;

    try {
        const events = await CalendarEvent.findAll({
            where: { batch_id },
            include: [{ model: Module, attributes: ["title"] }],
            order: [["start_time", "ASC"]],
        });

        const mappedEvents = events.map(e => ({
            id: e.event_id,
            title: e.title,
            description: e.description,
            start: e.is_all_day ? e.event_date : e.start_time.toISOString(),
            end: e.is_all_day ? e.event_date : e.end_time.toISOString(),
            isAllDay: e.is_all_day,
            subject: e.event_type,
            moduleName: e.Module?.title || null,
            isRecurring: e.is_recurring,
            recurrenceRule: e.recurrence_rule || null,
        }));

        res.json({ events: mappedEvents });

    } catch (err) {
        console.error("getSchedulesByBatch error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

/* ============================================================
   GET all schedules for a specific course
   Includes Modules and Lectures, but works even if some fields are null
============================================================ */
export const getSchedulesByCourse = async (req, res) => {
    try {
        const { course_id } = req.params;

        // Fetch all CalendarEvents whose module belongs to this course
        const events = await CalendarEvent.findAll({
            include: [
                {
                    model: Module,
                    attributes: ["module_id", "title", "course_id"],
                    required: false, // won't fail if module_id is null
                    where: { course_id },
                },
                {
                    model: Lecture,
                    attributes: ["lecture_id", "title", "module_id"],
                    required: false, // won't fail if lecture_id is null
                },
            ],
            order: [["start_time", "ASC"]],
        });

        // Map to a simpler object for the frontend
        const mappedEvents = events.map(e => ({
            id: e.event_id,
            title: e.title,
            description: e.description,
            start: e.is_all_day ? e.event_date : e.start_time?.toISOString(),
            end: e.is_all_day ? e.event_date : e.end_time?.toISOString(),
            isAllDay: e.is_all_day,
            subject: e.event_type,

            module_id: e.module_id,
            moduleName: e.Module?.title || null,
            course_id: e.Module?.course_id || null,

            lecture_id: e.lecture_id,
            lectureName: e.Lecture?.title || null,

            isRecurring: e.is_recurring,
            recurrenceRule: e.recurrence_rule || null,
        }));

        res.json({ events: mappedEvents });

    } catch (err) {
        console.error("getSchedulesByCourse error:", err);
        res.status(500).json({ error: "Failed to fetch schedules" });
    }
};

/* ============================================================
   GET single calendar event by ID
============================================================ */
export const getCalendarEventById = async (req, res) => {
    try {
        const { event_id } = req.params;
        const event = await CalendarEvent.findByPk(event_id);

        if (!event) return res.status(404).json({ error: "Event not found" });

        res.json(event);

    } catch (err) {
        console.error("getCalendarEventById error:", err);
        res.status(500).json({ error: err.message });
    }
};

/* ============================================================
   ADD or UPDATE calendar event
============================================================ */
export const addOrUpdateCalendarEvent = async (req, res) => {
    try {
        const event_id = req.params.event_id || req.body.event_id;

        let {
            title,
            description,
            batch_id,
            module_id,
            lecture_id,
            event_type,
            event_date,
            start_time,
            end_time,
            is_all_day = false,
            is_recurring = false,
            recurrence_rule = null,
        } = req.body;

        /* ----------------------------
           BASIC VALIDATION
        ---------------------------- */
        if (!title || !batch_id || !event_type || !event_date) {
            return res.status(400).json({
                error: "Missing required fields: title, batch_id, event_type, event_date",
            });
        }

        const allowedTypes = [
            "holiday",
            "module_session",
            "lecture",
            "assessments",
            "events",
        ];
        if (!allowedTypes.includes(event_type)) {
            return res.status(400).json({ error: "Invalid event_type" });
        }

        /* ----------------------------
           EVENT TYPE RULES
        ---------------------------- */
        // Events that DO NOT belong to a module
        if (["holiday", "events"].includes(event_type)) {
            module_id = null;
            lecture_id = null;
        }

        // Module-level events
        if (["module_session", "assessments"].includes(event_type)) {
            if (!module_id) {
                return res
                    .status(400)
                    .json({ error: `${event_type} requires module_id` });
            }
            lecture_id = null;
        }

        // Lecture-level events
        if (event_type === "lecture") {
            if (!module_id || !lecture_id) {
                return res
                    .status(400)
                    .json({ error: "lecture requires both module_id and lecture_id" });
            }
        }

        /* ----------------------------
           TIME HANDLING
        ---------------------------- */
        if (is_all_day) {
            start_time = new Date(`${event_date}T00:00:00`);
            end_time = new Date(`${event_date}T23:59:59`);
        } else {
            if (!start_time || !end_time) {
                return res.status(400).json({
                    error: "Start and end time are required for non-all-day events",
                });
            }
            start_time = new Date(`${event_date}T${start_time}`);
            end_time = new Date(`${event_date}T${end_time}`);
        }

        /* ----------------------------
           CREATE PAYLOAD
        ---------------------------- */
        const payload = {
            title,
            description,
            batch_id,
            module_id,
            lecture_id,
            event_type,
            event_date,
            start_time,
            end_time,
            is_all_day,
            is_recurring,
            recurrence_rule,
        };

        /* ----------------------------
           CREATE OR UPDATE LOGIC
        ---------------------------- */
        let savedEvent;
        let message;

        if (event_id) {
            // UPDATE existing event
            const [updated] = await CalendarEvent.update(payload, {
                where: { event_id },
            });

            if (!updated) {
                return res.status(404).json({ error: "Event not found" });
            }

            savedEvent = await CalendarEvent.findByPk(event_id);
            message = "Schedule updated";
        } else {
            // CREATE new event
            savedEvent = await CalendarEvent.create(payload);
            message = "Schedule created";
        }

        /* ----------------------------
           RESPONSE
        ---------------------------- */
        res.status(event_id ? 200 : 201).json({
            message,
            event: savedEvent,
        });
    } catch (err) {
        console.error("addOrUpdateCalendarEvent error:", err);
        res.status(500).json({ error: err.message });
    }
};


/* ============================================================
   DELETE calendar event
============================================================ */
export const deleteCalendarEvent = async (req, res) => {
    try {
        const { event_id } = req.params;
        const deleted = await CalendarEvent.destroy({ where: { event_id } });
        if (!deleted) return res.status(404).json({ error: "Event not found" });

        res.json({ message: "Schedule deleted" });
    } catch (err) {
        console.error("deleteCalendarEvent error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Modules for a course
export const getModulesByCourse = async (req, res) => {
    try {
        const { course_id } = req.params;
        const modules = await Module.findAll({ where: { course_id } });
        res.json(modules);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch modules" });
    }
};

// Lectures for a course
export const getLecturesByCourse = async (req, res) => {
    try {
        const { course_id } = req.params;
        const lectures = await Lecture.findAll({
            include: [{ model: Module, where: { course_id }, attributes: [] }]
        });
        res.json(lectures);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch lectures" });
    }
};

// Fetch modules for a specific batch
export const getModulesByBatch = async (req, res) => {
    try {
        const { batch_id } = req.params;
        const modules = await Module.findAll({ where: { batch_id } });
        res.json(modules);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch modules" });
    }
};

// Fetch lectures for a specific batch
export const getLecturesByBatch = async (req, res) => {
    try {
        const { batch_id } = req.params;
        const lectures = await Lecture.findAll({ where: { batch_id } });
        res.json(lectures);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch lectures" });
    }
};
