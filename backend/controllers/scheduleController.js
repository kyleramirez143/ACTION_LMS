import { createRequire } from "module";
const require = createRequire(import.meta.url);

const { CalendarEvent, Module, Lecture } = require("../models/index.cjs");
const { Op } = require("sequelize");

/* ============================================================
   GET all schedules by Batch (Admin overview)
============================================================ */
export const getSchedulesByBatch = async (req, res) => {
    const { batch_id } = req.params;

    try {
        const events = await CalendarEvent.findAll({
            where: { batch_id },
            include: [
                { model: Module, attributes: ["module_id", "title"], as: "Module" },
                { model: Lecture, attributes: ["lecture_id", "title"], as: "Lecture" },
            ],
            order: [["start_time", "ASC"]],
        });

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
            lecture_id: e.lecture_id,
            lectureName: e.Lecture?.title || null,
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
        // const { course_id } = req.params;

        // console.log(course_id);
        // 1️⃣ Get all modules for this course
        const modules = await Module.findAll({
            // where: { course_id },
            attributes: ["module_id", "title"],
            raw: true,
        });

        const moduleIds = modules.map(m => m.module_id);
        if (moduleIds.length === 0) return res.json({ events: [] });

        // 2️⃣ Get all calendar events for these modules
        const events = await CalendarEvent.findAll({
            where: { module_id: moduleIds }, // Only filter by module_id
            include: [
                { model: Module, attributes: ["module_id", "title"] },
                { model: Lecture, attributes: ["lecture_id", "title", "module_id"] },
            ],
            order: [["start_time", "ASC"]],
        });

        // 3️⃣ Map for frontend
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
            lecture_id: e.lecture_id,
            lectureName: e.Lecture?.title || null,
            isRecurring: e.is_recurring,
            recurrenceRule: e.recurrence_rule || null,
        }));

        res.json({ events: mappedEvents });

    } catch (err) {
        console.error("getSchedulesByCourse error:", err);
        res.status(500).json({ error: "Failed to fetch schedules", details: err.message });
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

        if (!title || !batch_id || !event_type || !event_date) {
            return res.status(400).json({
                error: "Missing required fields: title, batch_id, event_type, event_date",
            });
        }

        // EVENT TYPE LOGIC
        if (["holiday", "events"].includes(event_type)) {
            module_id = null;
            lecture_id = null;
        }
        if (["module_session", "assessments"].includes(event_type)) {
            if (!module_id) return res.status(400).json({ error: `${event_type} requires module_id` });
            lecture_id = null;
        }
        if (event_type === "lecture") {
            if (!module_id || !lecture_id) return res.status(400).json({ error: "lecture requires module_id and lecture_id" });
        }

        // TIME HANDLING
        if (is_all_day) {
            start_time = new Date(`${event_date}T00:00:00`);
            end_time = new Date(`${event_date}T23:59:59`);
        } else {
            if (!start_time || !end_time) return res.status(400).json({ error: "Start and end time required" });
            start_time = new Date(`${event_date}T${start_time}`);
            end_time = new Date(`${event_date}T${end_time}`);
        }

        // PAYLOAD
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

        // CREATE OR UPDATE
        let savedEvent, message;
        if (event_id) {
            const [updated] = await CalendarEvent.update(payload, { where: { event_id } });
            if (!updated) return res.status(404).json({ error: "Event not found" });
            savedEvent = await CalendarEvent.findByPk(event_id);
            message = "Schedule updated";
        } else {
            savedEvent = await CalendarEvent.create(payload);
            message = "Schedule created";
        }

        res.status(event_id ? 200 : 201).json({ message, event: savedEvent });
    } catch (err) {
        console.log(err);
        // console.error("addOrUpdateCalendarEvent error:", err);
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

/* ============================================================
   GET schedules for a batch (replaces course_id)
   Works even if some fields are null
============================================================ */
export const getSchedulesByBatchModules = async (req, res) => {
    try {
        const { batch_id } = req.params;

        // 1️⃣ Get all modules in this batch
        const modules = await Module.findAll({
            where: { batch_id },
            attributes: ["module_id", "title"],
            raw: true,
        });

        const moduleIds = modules.map(m => m.module_id);
        if (moduleIds.length === 0) return res.json({ events: [] });

        // 2️⃣ Get all calendar events for these modules
        const events = await CalendarEvent.findAll({
            where: { module_id: { [Op.in]: moduleIds } },
            include: [
                { model: Module, attributes: ["module_id", "title"], as: "Module" },
                { model: Lecture, attributes: ["lecture_id", "title", "module_id"], as: "Lecture" },
            ],
            order: [["start_time", "ASC"]],
        });

        // 3️⃣ Map events for frontend
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
            lecture_id: e.lecture_id,
            lectureName: e.Lecture?.title || null,
            isRecurring: e.is_recurring,
            recurrenceRule: e.recurrence_rule || null,
        }));

        res.json({ events: mappedEvents });

    } catch (err) {
        console.error("getSchedulesByBatchModules error:", err);
        res.status(500).json({ error: "Failed to fetch schedules", details: err.message });
    }
};