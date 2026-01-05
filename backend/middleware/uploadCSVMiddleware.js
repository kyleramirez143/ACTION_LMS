import multer from "multer";
import fs from "fs";
import path from "path";

// ✅ Ensure the uploads folder exists
const uploadDir = path.join(process.cwd(), "uploads/csv");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname);
    }
});

// ✅ File filter: allow only CSV files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
        cb(null, true);
    } else {
        cb(new Error("Only CSV files are allowed"), false);
    }
};

// ✅ Export middleware
export const uploadCSVMiddleware = multer({ storage, fileFilter });


export default uploadCSVMiddleware; 