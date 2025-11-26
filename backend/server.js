// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import uploadRoute from "./routes/uploadRoute.js";
import quizRoutes from "./routes/quizRoute.js";
import resultRoutes from "./routes/resultRoute.js";
import authRoutes from "./routes/authRoute.js";
import courseRoutes from "./routes/courseRoute.js";
import moduleRoutes from "./routes/moduleRoute.js";
import lectureRoutes from "./routes/lectureRoute.js";
import userRoutes from "./routes/userRoute.js";

const app = express();
// app.use(cors());
app.use(cors({
    // Allow requests only from your frontend port 5173 during development
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // If you plan to send cookies/session info
}));
app.use(express.json());

app.get("/", (req, res) => res.send("LMS Backend ✅"));

app.use("/api/upload", uploadRoute);
app.use("/api/quizzes", quizRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
