import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const db = require('../models/index.cjs');

export const getSchedulesByBatch = async (req, res) => {
    try {
        const { batch_id } = req.params;

        const CalendarEvent = db.CalendarEvent;
        if (!CalendarEvent) {
            console.error("Available models:", Object.keys(db));
            return res.status(500).json({ error: "CalendarEvent model not found" });
        }

        const events = await CalendarEvent.findAll({
            where: { batch_id },
            order: [['start_time', 'ASC']],
        });

        const formatted = events.map(event => {
            const start = event.start_time ? event.start_time.toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16);
            const end = event.end_time ? event.end_time.toISOString().slice(0, 16) : start;

            let color = "#3b82f6";
            if (event.event_type === "holiday") color = "#ef4444";
            if (event.event_type === "exam") color = "#f59e0b";
            if (event.event_type === "module_session") color = "#10b981";

            return {
                id: String(event.event_id),
                title: event.title || "No title",
                start,
                end,
                subject: event.event_type || "events",
                color,
                batch_id: event.batch_id,
            };
        });

        res.json(formatted);
    } catch (error) {
        console.error("Schedule Fetch Error:", error);
        res.status(500).json({ error: "Database error" });
    }
};
