import { ApiError } from "../helpers/api-error.js";

/**
 * Autoriza el acceso solo a usuarios con alguno de los roles indicados.
 * Debe usarse siempre DESPUÉS de "authenticate" (necesita req.user).
 *
 * Uso: router.post("/", authenticate, authorize("owner"), controller)
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, "No tenés permisos para realizar esta acción."));
    }
    next();
  };
};
