import { asyncHandler } from "../helpers/async-handler.js";
import { ApiError } from "../helpers/api-error.js";
import { findOwnedPropertyOrFail } from "./property.controller.js";
import { PropertyImageModel } from "../models/property-image.model.js";
import { removeUploadedFile, saveUploadedFile } from "../middlewares/upload.middleware.js";

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

// POST /api/properties/:propertyId/images/upload (protegida, solo el owner dueño)
export const uploadPropertyImage = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;

  if (!req.file) {
    throw new ApiError(400, "Seleccioná una imagen para subir.");
  }

  await findOwnedPropertyOrFail(propertyId, req.user.id);

  let uploadedFile;
  try {
    uploadedFile = await saveUploadedFile(req.file);
    const image = await PropertyImageModel.create({ url: uploadedFile.url, propertyId });
    res.status(201).json({ message: "Imagen subida correctamente.", image });
  } catch (error) {
    if (uploadedFile) {
      try {
        await removeUploadedFile(uploadedFile.filePath);
      } catch (cleanupError) {
        if (cleanupError.code !== "ENOENT") console.error(cleanupError);
      }
    }
    throw error;
  }
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
