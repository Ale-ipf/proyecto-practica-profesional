import multer from "multer";
import { ApiError } from "../helpers/api-error.js";

const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);

const uploadSingleDocument = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      callback(new ApiError(400, "Usá un archivo PDF, JPG o PNG."));
      return;
    }
    callback(null, true);
  },
  limits: { fileSize: 12 * 1024 * 1024, files: 1 },
}).single("document");

export const guaranteeUpload = (req, res, next) => {
  uploadSingleDocument(req, res, (error) => {
    if (error?.code === "LIMIT_FILE_SIZE") {
      next(new ApiError(400, "El archivo supera el límite de 12 MB."));
      return;
    }
    next(error);
  });
};
