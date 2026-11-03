import multer from 'multer';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { ApiError } from '../helpers/api-error.js';

export const UPLOADS_DIR = fileURLToPath(new URL('../../public/uploads/', import.meta.url));

const extensionsByMimeType = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
};

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!extensionsByMimeType[file.mimetype]) {
            return cb(new ApiError(400, 'La imagen debe ser JPG, PNG o WebP.'));
        }
        cb(null, true);
    },
});

export const saveUploadedFile = async (file) => {
    const extension = extensionsByMimeType[file.mimetype];
    if (!extension) {
        throw new ApiError(400, 'La imagen debe ser JPG, PNG o WebP.');
    }

    const bytes = file.buffer;
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const isPng = bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const isWebp = bytes.toString('ascii', 0, 4) === 'RIFF'
        && bytes.toString('ascii', 8, 12) === 'WEBP';
    const isValidImage = file.mimetype === 'image/jpeg' ? isJpeg
        : file.mimetype === 'image/png' ? isPng
            : isWebp;

    if (!isValidImage) {
        throw new ApiError(400, 'El archivo seleccionado no es una imagen válida.');
    }

    const filename = `${randomUUID()}${extension}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    await mkdir(UPLOADS_DIR, { recursive: true });
    await writeFile(filePath, file.buffer, { flag: 'wx' });

    return { filename, filePath, url: `/uploads/${filename}` };
};

export const removeUploadedFile = async (filePath) => {
    if (!filePath) return;
    await unlink(filePath);
};

export default upload;