import { asyncHandler } from "../helpers/async-handler.js";
import { ApiError } from "../helpers/api-error.js";
import { StudentModel } from "../models/student.model.js";
import { UserModel } from "../models/user.model.js";

// GET /api/students/me (protegida, solo student)
export const getMyStudentProfile = asyncHandler(async (req, res) => {
  const profile = await StudentModel.findOne({
    where: { userId: req.user.id },
    include: [{ model: UserModel, as: "user", attributes: { exclude: ["password"] } }],
  });

  if (!profile) {
    throw new ApiError(404, "No se encontró un perfil de estudiante para este usuario.");
  }

  res.json({ student: profile });
});

// PUT /api/students/me (protegida, solo student)
export const updateMyStudentProfile = asyncHandler(async (req, res) => {
  const profile = await StudentModel.findOne({ where: { userId: req.user.id } });

  if (!profile) {
    throw new ApiError(404, "No se encontró un perfil de estudiante para este usuario.");
  }

  const { university, career, origin_city } = req.body;

  await profile.update({
    ...(university !== undefined && { university }),
    ...(career !== undefined && { career }),
    ...(origin_city !== undefined && { origin_city }),
  });

  res.json({ message: "Perfil actualizado correctamente.", student: profile });
});

// GET /api/students/:id (protegida, cualquier usuario autenticado)
// Útil, por ejemplo, para que un owner vea el perfil de un estudiante interesado.
export const getStudentById = asyncHandler(async (req, res) => {
  const profile = await StudentModel.findByPk(req.params.id, {
    include: [{ model: UserModel, as: "user", attributes: ["id", "name"] }],
  });

  if (!profile) {
    throw new ApiError(404, "Perfil de estudiante no encontrado.");
  }

  res.json({ student: profile });
});
