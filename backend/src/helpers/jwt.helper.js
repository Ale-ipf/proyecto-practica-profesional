import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

// Genera un token firmado con el id y el rol del usuario.
// payload esperado: { id, role }
export const generateToken = (payload) => {
  if (!JWT_SECRET) {
    throw new Error("Falta configurar JWT_SECRET en las variables de entorno.");
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verifica y decodifica un token. Lanza error si es inválido o expiró.
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
