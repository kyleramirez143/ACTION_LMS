import express from "express";
import {
    getSchedulesByBatch,
    getSchedulesByCourse,
    getCalendarEventById,
    addOrUpdateCalendarEvent,
    deleteCalendarEvent
} from "../controllers/scheduleController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// -----------------------------
// FETCHERS
// -----------------------------
router.get("/batch/:batch_id", protect, getSchedulesByBatch);

// Optional module filter via query: /course/:batch_id?module_id=...
router.get("/course/:batch_id", protect, getSchedulesByCourse);

// Get single event by ID
router.get("/:event_id", protect, getCalendarEventById);

// -----------------------------
// CREATE / UPDATE / DELETE
// -----------------------------
router.post("/", protect, addOrUpdateCalendarEvent);
router.put("/:event_id", protect, addOrUpdateCalendarEvent);
router.delete("/:event_id", protect, deleteCalendarEvent);

export default router;