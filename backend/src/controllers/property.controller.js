import { Op } from "sequelize";
import { asyncHandler } from "../helpers/async-handler.js";
import { ApiError } from "../helpers/api-error.js";
import { PropertyModel } from "../models/property.model.js";
import { PropertyImageModel } from "../models/property-image.model.js";
import { UserModel } from "../models/user.model.js";

const propertyIncludes = [
  { model: PropertyImageModel, as: "images" },
  { model: UserModel, as: "owner", attributes: ["id", "name", "email"] },
];

// Busca una propiedad y valida que pertenezca al usuario autenticado.
// Se reutiliza en update/delete y en el controller de imágenes.
export const findOwnedPropertyOrFail = async (propertyId, userId) => {
  const property = await PropertyModel.findByPk(propertyId);

  if (!property) {
    throw new ApiError(404, "Propiedad no encontrada.");
  }

  if (property.userId !== userId) {
    throw new ApiError(403, "No tenés permisos para modificar esta propiedad.");
  }

  return property;
};

// GET /api/properties (pública, con filtros y paginación por query params)
export const listProperties = asyncHandler(async (req, res) => {
  const { city, minPrice, maxPrice, bedrooms, is_furnished, status, page = 1, limit = 10 } = req.query;

  const where = {};
  if (city) where.city = { [Op.like]: `%${city}%` };
  if (bedrooms !== undefined) where.bedrooms = bedrooms;
  if (is_furnished !== undefined) where.is_furnished = is_furnished === "true" || is_furnished === true;
  if (status) where.status = status;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price[Op.gte] = minPrice;
    if (maxPrice) where.price[Op.lte] = maxPrice;
  }

  const offset = (Number(page) - 1) * Number(limit);

  const { rows, count } = await PropertyModel.findAndCountAll({
    where,
    include: propertyIncludes,
    limit: Number(limit),
    offset,
    order: [["id", "DESC"]],
  });

  res.json({
    properties: rows,
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / Number(limit)),
    },
  });
});

// GET /api/properties/:id (pública)
export const getPropertyById = asyncHandler(async (req, res) => {
  const property = await PropertyModel.findByPk(req.params.id, { include: propertyIncludes });

  if (!property) {
    throw new ApiError(404, "Propiedad no encontrada.");
  }

  res.json({ property });
});

// GET /api/properties/mine/list (protegida, solo owner autenticado)
export const getMyProperties = asyncHandler(async (req, res) => {
  const properties = await PropertyModel.findAll({
    where: { userId: req.user.id },
    include: propertyIncludes,
    order: [["id", "DESC"]],
  });

  res.json({ properties });
});

// POST /api/properties (protegida, solo owner)
export const createProperty = asyncHandler(async (req, res) => {
  const { title, description, price, address, city, bedrooms, is_furnished, status } = req.body;

  const property = await PropertyModel.create({
    title,
    description,
    price,
    address,
    city,
    bedrooms,
    is_furnished,
    status,
    userId: req.user.id,
  });

  res.status(201).json({ message: "Propiedad creada correctamente.", property });
});

// PUT /api/properties/:id (protegida, solo el owner dueño de la propiedad)
export const updateProperty = asyncHandler(async (req, res) => {
  const property = await findOwnedPropertyOrFail(req.params.id, req.user.id);

  const fields = ["title", "description", "price", "address", "city", "bedrooms", "is_furnished", "status"];
  const updates = {};
  fields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  await property.update(updates);

  res.json({ message: "Propiedad actualizada correctamente.", property });
});

// DELETE /api/properties/:id (protegida, solo el owner dueño de la propiedad)
export const deleteProperty = asyncHandler(async (req, res) => {
  const property = await findOwnedPropertyOrFail(req.params.id, req.user.id);

  await property.destroy();

  res.json({ message: "Propiedad eliminada correctamente." });
});
