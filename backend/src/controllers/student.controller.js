import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { Op, UniqueConstraintError } from "sequelize";
import { asyncHandler } from "../helpers/async-handler.js";
import { ApiError } from "../helpers/api-error.js";
import { sequelize } from "../config/database.js";
import { EmailVerificationModel } from "../models/email-verification.model.js";
import { StudentModel } from "../models/student.model.js";
import { UserModel } from "../models/user.model.js";
import {
  checkPhoneVerification,
  sendEmailVerification,
  sendPhoneVerification,
} from "../services/account-verification.service.js";

const PRIVATE_USER_FIELDS = ["password", "pendingEmail", "pendingPhone"];

function verificationCodeHash(code) {
  const secret = process.env.VERIFICATION_CODE_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError(
      503,
      "La verificación de cuenta no está configurada. Contactá al administrador.",
    );
  }

  return createHmac("sha256", secret).update(code).digest("hex");
}

function matchesCode(code, codeHash) {
  const submittedHash = Buffer.from(verificationCodeHash(code), "hex");
  const savedHash = Buffer.from(codeHash, "hex");
  return (
    submittedHash.length === savedHash.length &&
    timingSafeEqual(submittedHash, savedHash)
  );
}

async function getStudentProfile(userId) {
  return StudentModel.findOne({
    where: { userId },
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: { exclude: PRIVATE_USER_FIELDS },
      },
    ],
  });
}

// GET /api/students/me (protegida, solo student)
export const getMyStudentProfile = asyncHandler(async (req, res) => {
  const profile = await getStudentProfile(req.user.id);

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

  const {
    university,
    career,
    biography,
    origin_city,
    firstName,
    lastName,
    username,
  } =
    req.body;
  const user = await UserModel.findByPk(req.user.id);
  const normalizedUsername = username?.trim().toLowerCase();
  const legacyNameParts = (user.name || "").trim().split(/\s+/);
  const existingFirstName = user.firstName || legacyNameParts.shift() || "";
  const existingLastName = user.lastName || legacyNameParts.join(" ");

  if (normalizedUsername) {
    const existingUsername = await UserModel.findOne({
      where: {
        username: normalizedUsername,
        id: { [Op.ne]: req.user.id },
      },
    });
    if (existingUsername) {
      throw new ApiError(409, "Ese nombre de usuario ya está en uso.");
    }
  }

  try {
    await sequelize.transaction(async (transaction) => {
      await profile.update(
        {
          ...(university !== undefined && { university }),
          ...(career !== undefined && { career }),
          ...(biography !== undefined && { biography }),
          ...(origin_city !== undefined && { origin_city }),
        },
        { transaction },
      );

      await user.update(
        {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...((firstName !== undefined || lastName !== undefined) && {
            name: `${firstName ?? existingFirstName} ${lastName ?? existingLastName}`.trim(),
          }),
          ...(normalizedUsername !== undefined && {
            username: normalizedUsername,
          }),
        },
        { transaction },
      );
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new ApiError(409, "Ese nombre de usuario ya está en uso.");
    }
    throw error;
  }

  res.json({
    message: "Perfil actualizado correctamente.",
    student: await getStudentProfile(req.user.id),
  });
});

export const requestEmailVerification = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase();
  const user = await UserModel.findByPk(req.user.id);
  if (email === user.email && user.emailVerified) {
    throw new ApiError(409, "Ese correo ya está verificado.");
  }

  const existingUser = await UserModel.findOne({
    where: { email, id: { [Op.ne]: user.id } },
  });
  if (existingUser) {
    throw new ApiError(409, "Ese correo ya está asociado a otra cuenta.");
  }

  const previousVerification = await EmailVerificationModel.findOne({
    where: { userId: user.id },
  });
  if (
    previousVerification &&
    Date.now() - previousVerification.lastSentAt.getTime() < 60_000
  ) {
    throw new ApiError(
      429,
      "Esperá un minuto antes de solicitar otro código.",
    );
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await sendEmailVerification(email, code);

  await EmailVerificationModel.upsert({
    userId: user.id,
    targetEmail: email,
    codeHash: verificationCodeHash(code),
    expiresAt: new Date(Date.now() + 10 * 60_000),
    lastSentAt: new Date(),
    attempts: 0,
  });
  await user.update({ pendingEmail: email });

  res.json({ message: "Enviamos un código de verificación a tu correo." });
});

export const confirmEmailVerification = asyncHandler(async (req, res) => {
  const verification = await EmailVerificationModel.findOne({
    where: { userId: req.user.id },
  });
  if (!verification || verification.expiresAt.getTime() < Date.now()) {
    if (verification) await verification.destroy();
    throw new ApiError(400, "El código venció. Solicitá uno nuevo.");
  }
  if (verification.attempts >= 5) {
    await verification.destroy();
    await UserModel.update(
      { pendingEmail: null },
      { where: { id: req.user.id } },
    );
    throw new ApiError(
      429,
      "Superaste la cantidad de intentos. Solicitá un código nuevo.",
    );
  }
  if (!matchesCode(req.body.code, verification.codeHash)) {
    await verification.increment("attempts");
    throw new ApiError(400, "El código ingresado no es válido.");
  }

  const user = await UserModel.findByPk(req.user.id);
  const existingUser = await UserModel.findOne({
    where: {
      email: verification.targetEmail,
      id: { [Op.ne]: user.id },
    },
  });
  if (existingUser) {
    throw new ApiError(409, "Ese correo ya está asociado a otra cuenta.");
  }

  try {
    await user.update({
      email: verification.targetEmail,
      emailVerified: true,
      pendingEmail: null,
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new ApiError(409, "Ese correo ya está asociado a otra cuenta.");
    }
    throw error;
  }
  await verification.destroy();

  res.json({
    message: "Correo verificado correctamente.",
    user: {
      id: user.id,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      emailVerified: user.emailVerified,
      phone: user.phone,
      phoneVerified: user.phoneVerified,
      role: user.role,
    },
  });
});

export const requestPhoneVerification = asyncHandler(async (req, res) => {
  const phone = req.body.phone;
  const user = await UserModel.findByPk(req.user.id);
  if (phone === user.phone && user.phoneVerified) {
    throw new ApiError(409, "Ese teléfono ya está verificado.");
  }

  await sendPhoneVerification(phone);
  await user.update({ pendingPhone: phone });

  res.json({ message: "Enviamos un código de verificación por SMS." });
});

export const confirmPhoneVerification = asyncHandler(async (req, res) => {
  const user = await UserModel.findByPk(req.user.id);
  if (!user.pendingPhone) {
    throw new ApiError(
      400,
      "Primero solicitá un código para el teléfono que querés verificar.",
    );
  }
  if (!(await checkPhoneVerification(user.pendingPhone, req.body.code))) {
    throw new ApiError(400, "El código SMS no es válido o venció.");
  }

  await user.update({
    phone: user.pendingPhone,
    phoneVerified: true,
    pendingPhone: null,
  });

  res.json({
    message: "Teléfono verificado correctamente.",
    user: {
      id: user.id,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      emailVerified: user.emailVerified,
      phone: user.phone,
      phoneVerified: user.phoneVerified,
      role: user.role,
    },
  });
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
