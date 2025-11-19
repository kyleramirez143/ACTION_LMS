// backend/routes/authRoutes.js

import express from "express";
import * as authController from '../controllers/authController.js'
const router = express.Router();

// Defines the POST route for login
// When a POST request hits /login (relative to the base path)
router.post('/login', authController.login);

export default router;