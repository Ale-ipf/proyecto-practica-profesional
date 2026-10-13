import { ApiError } from "../helpers/api-error.js";

// Se registra después de todas las rutas: captura cualquier URL no definida.
export const notFound = (req, res, next) => {
  next(new ApiError(404, `Ruta no encontrada: ${req.originalUrl}`));
};

// Middleware global de errores. Debe registrarse al final de todo,
// después de las rutas y de "notFound". Express lo reconoce por sus 4 parámetros.
export const errorHandler = (err, req, res, next) => {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err.message || "Error interno del servidor.";

  // Solo logueamos en consola los errores no controlados (los ApiError son esperados).
  if (!(err instanceof ApiError)) {
    console.error(err);
  }

  res.status(statusCode).json({ message });
};
