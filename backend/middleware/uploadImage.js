// middleware/uploadImage.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure directory exists
const dir = "uploads/images/";
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const courseTitle = req.body.title || "course";
        const sanitizedTitle = courseTitle.replace(/\s+/g, "-").toLowerCase(); // replace spaces with -
        const uniqueSuffix = Date.now();
        cb(null, `${sanitizedTitle}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },

});

export const uploadImage = multer({ storage });
