import { validationResult } from "express-validator";

/**
 * Revisa si express-validator encontró errores en la request.
 * Se coloca siempre DESPUÉS de los validators de cada ruta.
 * Si hay errores, corta la ejecución y devuelve un 400 con el detalle.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Error de validación.",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};
