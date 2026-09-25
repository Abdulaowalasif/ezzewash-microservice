import { fileTypeFromFile } from "file-type";

const allowedImageTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

export async function validateImageFile(
    filePath: string
): Promise<boolean> {
    const fileType = await fileTypeFromFile(filePath);

    if (!fileType) {
        return false;
    }

    return allowedImageTypes.has(fileType.mime);
}