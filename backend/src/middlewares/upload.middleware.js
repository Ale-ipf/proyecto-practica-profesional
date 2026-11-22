import multer from 'multer';
import { ApiError } from '../helpers/api-error.js';

const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        cb(new ApiError(400, 'Solo se permiten archivos de imagen.'));
        return;
    }
    cb(null, true);
};

export const upload = multer({
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024, files: 10 },
});
export default upload;