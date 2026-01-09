import express from "express";
import { getSchedulesByBatch } from "../controllers/scheduleController.js";

const router = express.Router();

router.get("/batch/:batch_id", getSchedulesByBatch);

export default router;