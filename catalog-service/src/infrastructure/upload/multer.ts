import multer from "multer";
import path from "node:path";
import fs from "node:fs";

const uploadDir = path.join(
    process.cwd(),
    "uploads",
    "catalog"
);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },

    filename: (_req, file, cb) => {
        const filename =
            `${Date.now()}-${Math.round(
                Math.random() * 1_000_000_000
            )}${path.extname(file.originalname)}`;

        cb(null, filename);
    },
});

export const imageUpload =
    multer({
        storage,
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    });
