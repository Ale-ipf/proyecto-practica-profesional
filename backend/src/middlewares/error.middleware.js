import { ApiError } from "../helpers/api-error.js";
import multer from "multer";

// Se registra después de todas las rutas: captura cualquier URL no definida.
export const notFound = (req, res, next) => {
  next(new ApiError(404, `Ruta no encontrada: ${req.originalUrl}`));
};

// Middleware global de errores. Debe registrarse al final de todo,
// después de las rutas y de "notFound". Express lo reconoce por sus 4 parámetros.
export const errorHandler = (err, req, res, next) => {
  const isMulterError = err instanceof multer.MulterError;
  const statusCode = err instanceof ApiError
    ? err.statusCode
    : isMulterError
      ? err.code === "LIMIT_FILE_SIZE" ? 413 : 400
      : 500;
  const message = isMulterError
    ? err.code === "LIMIT_FILE_SIZE"
      ? "La imagen no puede superar los 5 MB."
      : "No se pudo procesar la imagen seleccionada."
    : err.message || "Error interno del servidor.";

  // Solo logueamos en consola los errores no controlados (los ApiError son esperados).
  if (!(err instanceof ApiError) && !isMulterError) {
    console.error(err);
  }

  res.status(statusCode).json({ message });
};
