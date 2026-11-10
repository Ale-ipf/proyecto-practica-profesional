import { verifyToken } from "../helpers/jwt.helper.js";
import { ApiError } from "../helpers/api-error.js";
import { UserModel } from "../models/user.model.js";

/**
 * Verifica que la request tenga un token JWT válido en el header Authorization.
 * Formato esperado: "Authorization: Bearer <token>"
 * Si es válido, agrega req.user = { id, role } y continúa con next().
 */
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "No se proporcionó un token de autenticación."));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    const user = await UserModel.findByPk(decoded.id, {
      attributes: ["id", "role"],
    });

    if (!user) {
      return next(new ApiError(401, "La cuenta asociada al token ya no existe."));
    }

    req.user = { id: user.id, role: user.role };
    return next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Token inválido o expirado."));
    }
    return next(error);
  }
};
