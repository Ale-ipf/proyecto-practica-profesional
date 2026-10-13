import { UserModel } from "../models/user.model.js";
import { StudentModel } from "../models/student.model.js";
import { hashPassword, comparePassword } from "../helpers/password.helper.js";
import { generateToken } from "../helpers/jwt.helper.js";
import { asyncHandler } from "../helpers/async-handler.js";
import { ApiError } from "../helpers/api-error.js";

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await UserModel.findOne({ where: { email } });
  if (existingUser) {
    throw new ApiError(409, "Ya existe un usuario registrado con ese email.");
  }

  const hashedPassword = await hashPassword(password);

  const user = await UserModel.create({ name, email, password: hashedPassword, role });

  // Si se registra como estudiante, se crea automáticamente su perfil vacío
  // (Student) para mantener la relación 1:1 definida en models/index.js.
  if (role === "student") {
    await StudentModel.create({ userId: user.id });
  }

  const token = generateToken({ id: user.id, role: user.role });

  res.status(201).json({
    message: "Usuario registrado correctamente.",
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(401, "Credenciales inválidas.");
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Credenciales inválidas.");
  }

  const token = generateToken({ id: user.id, role: user.role });

  res.json({
    message: "Inicio de sesión exitoso.",
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

// GET /api/auth/me (protegida)
export const me = asyncHandler(async (req, res) => {
  const user = await UserModel.findByPk(req.user.id, {
    attributes: { exclude: ["password"] },
    include: [{ model: StudentModel, as: "studentProfile" }],
  });

  if (!user) {
    throw new ApiError(404, "Usuario no encontrado.");
  }

  res.json({ user });
});
