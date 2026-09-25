import multer from "multer";

const storage = multer.diskStorage({
    destination: "D:/ezzewash/uploads/profile-pictures",

    filename: (_req, file, cb) => {
        const extension = file.originalname.split(".").pop()?.toLowerCase();

        cb(
            null,
            `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`
        );
    },
});

export const profilePictureUpload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
            return;
        }

        cb(null, true);
    },
});