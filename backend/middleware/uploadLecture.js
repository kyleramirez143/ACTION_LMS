import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure directory exists
const dir = "uploads/lectures/";
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const title = req.body.title || "lecture";
        const sanitizedTitle = title.replace(/\s+/g, "-").toLowerCase();
        const uniqueSuffix = Date.now();
        cb(null, `${sanitizedTitle}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Optional: file filter to only allow certain types
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "application/pdf",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "video/mp4",
        "video/mpeg"
    ];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("File type not allowed"), false);
};

export const uploadLecture = multer({ storage, fileFilter });
