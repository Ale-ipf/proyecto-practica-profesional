import { verifyToken } from "../helpers/jwt.helper.js";
import { ApiError } from "../helpers/api-error.js";

/**
 * Verifica que la request tenga un token JWT válido en el header Authorization.
 * Formato esperado: "Authorization: Bearer <token>"
 * Si es válido, agrega req.user = { id, role } y continúa con next().
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "No se proporcionó un token de autenticación."));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    return next(new ApiError(401, "Token inválido o expirado."));
  }
};
