import { createRequire } from "module";
const require = createRequire(import.meta.url);

const { CalendarEvent, Module } = require("../models/index.cjs");

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

        res.json({ events });

    } catch (err) {
        console.error("getSchedulesByBatch error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

/* ============================================================
   GET schedules by Batch with optional Module filter
============================================================ */
export const getSchedulesByCourse = async (req, res) => {
    try {
        const { batch_id } = req.params;
        const { module_id } = req.query; // optional filter

        const whereClause = { batch_id };
        if (module_id) whereClause.module_id = module_id;

        const eventsFromDB = await CalendarEvent.findAll({
            where: whereClause,
            include: [{ model: Module, attributes: ["title"] }],
            order: [["start_time", "ASC"]],
        });

        const events = eventsFromDB.map(e => ({
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

        res.json({ events });

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
            event_type,
            event_date,
            start_time,
            end_time,
            is_all_day,
            is_recurring,
            recurrence_rule,
        } = req.body;

        if (!title || !batch_id || !event_type || !event_date) {
            return res.status(400).json({
                error: "Missing required fields: title, batch_id, event_type, event_date",
            });
        }

        const allowedTypes = ["holiday", "module_session", "lecture", "assessments", "events"];
        if (!allowedTypes.includes(event_type)) return res.status(400).json({ error: "Invalid event_type" });

        if (["holiday", "events"].includes(event_type)) module_id = null;
        if (["lecture", "module_session", "assessments"].includes(event_type) && !module_id) {
            return res.status(400).json({ error: `${event_type} requires a module_id` });
        }

        if (is_all_day) {
            start_time = `${event_date}T00:00:00`;
            end_time = `${event_date}T23:59:59`;
        } else {
            if (!start_time || !end_time) {
                return res.status(400).json({ error: "Start and end time are required for non-all-day events" });
            }
        }

        if (event_id) {
            const [updatedRows] = await CalendarEvent.update({
                title,
                description,
                batch_id,
                module_id,
                event_type,
                event_date,
                start_time,
                end_time,
                is_all_day,
                is_recurring,
                recurrence_rule,
            }, { where: { event_id } });

            if (updatedRows === 0) return res.status(404).json({ error: "Event not found" });

            const updatedEvent = await CalendarEvent.findByPk(event_id);
            return res.json({ message: "Schedule updated", event: updatedEvent });
        }

        const newEvent = await CalendarEvent.create({
            title,
            description,
            batch_id,
            module_id,
            event_type,
            event_date,
            start_time,
            end_time,
            is_all_day,
            is_recurring,
            recurrence_rule,
        });

        res.status(201).json(newEvent);

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