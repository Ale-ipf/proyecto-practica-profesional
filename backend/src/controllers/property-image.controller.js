import { asyncHandler } from "../helpers/async-handler.js";
import { ApiError } from "../helpers/api-error.js";
import { findOwnedPropertyOrFail } from "./property.controller.js";
import { PropertyImageModel } from "../models/property-image.model.js";

// POST /api/properties/:propertyId/images (protegida, solo el owner dueño)
// Body esperado: { "urls": ["https://...", "https://..."] }
export const addPropertyImages = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const { urls } = req.body;

  await findOwnedPropertyOrFail(propertyId, req.user.id);

  const images = await PropertyImageModel.bulkCreate(
    urls.map((url) => ({ url, propertyId })),
  );

  res.status(201).json({ message: "Imágenes agregadas correctamente.", images });
});

export const uploadPropertyImages = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  await findOwnedPropertyOrFail(propertyId, req.user.id);

  if (!req.files?.length) {
    throw new ApiError(400, "Debés seleccionar al menos una imagen.");
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const urls = req.files.map((file) => `${baseUrl}/uploads/${file.filename}`);
  const images = await PropertyImageModel.bulkCreate(
    urls.map((url) => ({ url, propertyId })),
  );

  res.status(201).json({ message: "Imágenes subidas correctamente.", images });
});

// DELETE /api/properties/:propertyId/images/:imageId (protegida, solo el owner dueño)
export const deletePropertyImage = asyncHandler(async (req, res) => {
  const { propertyId, imageId } = req.params;

  await findOwnedPropertyOrFail(propertyId, req.user.id);

  const image = await PropertyImageModel.findOne({ where: { id: imageId, propertyId } });

  if (!image) {
    throw new ApiError(404, "Imagen no encontrada.");
  }

  await image.destroy();

  res.json({ message: "Imagen eliminada correctamente." });
});
