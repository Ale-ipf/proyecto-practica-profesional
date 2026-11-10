import { Op } from "sequelize";
import { asyncHandler } from "../helpers/async-handler.js";
import { ApiError } from "../helpers/api-error.js";
import { hashPassword } from "../helpers/password.helper.js";
import { sequelize } from "../config/database.js";
import { InstitutionModel } from "../models/institution.model.js";
import { PropertyImageModel } from "../models/property-image.model.js";
import { PropertyModel } from "../models/property.model.js";
import { StudentModel } from "../models/student.model.js";
import { UserModel } from "../models/user.model.js";

const userProfileFields = [
  "university",
  "career",
  "biography",
  "origin_city",
];
const propertyFields = [
  "title",
  "description",
  "price",
  "address",
  "latitude",
  "longitude",
  "city",
  "bedrooms",
  "available_spots",
  "is_furnished",
  "status",
];
const institutionFields = [
  "abbreviation",
  "name",
  "type",
  "description",
  "latitude",
  "longitude",
  "busStops",
];

export const listUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const where = req.query.role ? { role: req.query.role } : {};
  const { rows, count } = await UserModel.findAndCountAll({
    where,
    attributes: { exclude: ["password"] },
    include: [{ model: StudentModel, as: "studentProfile" }],
    limit,
    offset: (page - 1) * limit,
    order: [["id", "DESC"]],
  });

  res.json({
    users: rows,
    pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user = await UserModel.findByPk(req.params.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!user) {
      throw new ApiError(404, "Usuario no encontrado.");
    }

    if (
      Number(req.user.id) === Number(user.id) &&
      req.body.role !== undefined &&
      req.body.role !== "admin"
    ) {
      throw new ApiError(409, "No podés quitarte el rol de administrador.");
    }

    if (
      user.role === "admin" &&
      req.body.role !== undefined &&
      req.body.role !== "admin"
    ) {
      const admins = await UserModel.findAll({
        where: { role: "admin" },
        attributes: ["id"],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (admins.length <= 1) {
        throw new ApiError(409, "Debe quedar al menos un administrador activo.");
      }
    }

    const updates = {};
    for (const field of ["name", "email", "role"]) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (req.body.password !== undefined) {
      updates.password = await hashPassword(req.body.password);
    }

    if (updates.email && updates.email !== user.email) {
      const existingUser = await UserModel.findOne({
        where: { email: updates.email, id: { [Op.ne]: user.id } },
        transaction,
      });
      if (existingUser) {
        throw new ApiError(409, "Ya existe un usuario registrado con ese email.");
      }
    }

    await user.update(updates, { transaction });

    const profileFields = Object.fromEntries(
      userProfileFields
        .filter((field) => req.body[field] !== undefined)
        .map((field) => [field, req.body[field]]),
    );
    if (user.role === "student") {
      const [studentProfile] = await StudentModel.findOrCreate({
        where: { userId: user.id },
        defaults: { userId: user.id },
        transaction,
      });
      if (Object.keys(profileFields).length) {
        await studentProfile.update(profileFields, { transaction });
      }
    } else {
      await StudentModel.destroy({ where: { userId: user.id }, transaction });
    }

    await transaction.commit();
    const updatedUser = await UserModel.findByPk(user.id, {
      attributes: { exclude: ["password"] },
      include: [{ model: StudentModel, as: "studentProfile" }],
    });
    res.json({ message: "Usuario actualizado correctamente.", user: updatedUser });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    throw error;
  }
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (Number(req.user.id) === Number(req.params.id)) {
    throw new ApiError(409, "No podés eliminar tu propia cuenta de administrador.");
  }

  const transaction = await sequelize.transaction();
  try {
    const user = await UserModel.findByPk(req.params.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!user) {
      throw new ApiError(404, "Usuario no encontrado.");
    }

    if (user.role === "admin") {
      const admins = await UserModel.findAll({
        where: { role: "admin" },
        attributes: ["id"],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (admins.length <= 1) {
        throw new ApiError(409, "Debe quedar al menos un administrador activo.");
      }
    }

    const properties = await PropertyModel.findAll({
      where: { userId: user.id },
      attributes: ["id"],
      transaction,
    });
    const propertyIds = properties.map((property) => property.id);
    if (propertyIds.length) {
      await PropertyImageModel.destroy({
        where: { propertyId: propertyIds },
        transaction,
      });
      await PropertyModel.destroy({
        where: { id: propertyIds },
        transaction,
      });
    }
    await StudentModel.destroy({ where: { userId: user.id }, transaction });
    await user.destroy({ transaction });
    await transaction.commit();

    res.json({
      message: "Usuario y sus perfiles y publicaciones asociados fueron eliminados.",
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    throw error;
  }
});

export const listAdminProperties = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const { rows, count } = await PropertyModel.findAndCountAll({
    include: [
      { model: PropertyImageModel, as: "images" },
      { model: UserModel, as: "owner", attributes: ["id", "name", "email"] },
    ],
    limit,
    offset: (page - 1) * limit,
    order: [["id", "DESC"]],
  });
  res.json({
    properties: rows,
    pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
  });
});

export const updateAdminProperty = asyncHandler(async (req, res) => {
  const property = await PropertyModel.findByPk(req.params.id);
  if (!property) {
    throw new ApiError(404, "Propiedad no encontrada.");
  }

  const updates = Object.fromEntries(
    propertyFields
      .filter((field) => req.body[field] !== undefined)
      .map((field) => [field, req.body[field]]),
  );
  await property.update(updates);
  res.json({ message: "Propiedad actualizada correctamente.", property });
});

export const deleteAdminProperty = asyncHandler(async (req, res) => {
  const property = await PropertyModel.findByPk(req.params.id);
  if (!property) {
    throw new ApiError(404, "Propiedad no encontrada.");
  }
  await property.destroy();
  res.json({ message: "Propiedad y sus imágenes eliminadas correctamente." });
});

export const listAdminInstitutions = asyncHandler(async (req, res) => {
  const institutions = await InstitutionModel.findAll({ order: [["name", "ASC"]] });
  res.json({ institutions });
});

export const createAdminInstitution = asyncHandler(async (req, res) => {
  const existingInstitution = await InstitutionModel.findByPk(req.body.id);
  if (existingInstitution) {
    throw new ApiError(409, "Ya existe una institución con ese identificador.");
  }
  const institution = await InstitutionModel.create({
    ...Object.fromEntries(
      institutionFields
        .filter((field) => req.body[field] !== undefined)
        .map((field) => [field, req.body[field]]),
    ),
    id: req.body.id,
    busStops: req.body.busStops || [],
  });
  res.status(201).json({ message: "Institución creada correctamente.", institution });
});

export const updateAdminInstitution = asyncHandler(async (req, res) => {
  const institution = await InstitutionModel.findByPk(req.params.id);
  if (!institution) {
    throw new ApiError(404, "Institución no encontrada.");
  }
  const updates = Object.fromEntries(
    institutionFields
      .filter((field) => req.body[field] !== undefined)
      .map((field) => [field, req.body[field]]),
  );
  await institution.update(updates);
  res.json({ message: "Institución actualizada correctamente.", institution });
});

export const deleteAdminInstitution = asyncHandler(async (req, res) => {
  const institution = await InstitutionModel.findByPk(req.params.id);
  if (!institution) {
    throw new ApiError(404, "Institución no encontrada.");
  }
  await institution.destroy();
  res.json({ message: "Institución eliminada correctamente." });
});
