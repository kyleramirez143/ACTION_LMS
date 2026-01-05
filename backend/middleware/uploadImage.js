// middleware/uploadImage.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Directory for profile images
const dir = "uploads/profile/";
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Use user ID if available, otherwise timestamp
        const userId = req.user?.id || "unknown";
        const uniqueSuffix = Date.now();
        cb(null, `profile-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
};

export const uploadImage = multer({ storage, fileFilter });