import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = process.env.UPLOAD_DIR || "uploads";

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {

        const uniqueName =
            `${Date.now()}-${file.originalname}`;

        cb(null, uniqueName);
    }

});

const fileFilter = (req, file, cb) => {

    const extension =
        path.extname(file.originalname).toLowerCase();

    const supportedExtensions = [
        ".pdf",
        ".docx",
        ".pptx",
        ".xlsx",
        ".odt",
        ".odp",
        ".ods",
        ".rtf",
        ".txt",
        ".csv",
        ".md",
        ".markdown",
        ".html",
        ".htm",
        ".epub"
    ];

    if (supportedExtensions.includes(extension)) {
        cb(null, true);
    } else {
        cb(new Error("This file type is not supported"));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024
    }
});

export default upload;