import { Router } from "express";
import { getTrainers } from "../controllers/userController.js";

const router = Router();

// GET /api/users/trainers → returns only trainers
router.get("/trainers", getTrainers);

export default router;