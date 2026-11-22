import { asyncHandler } from "../helpers/async-handler.js";
import { ApiError } from "../helpers/api-error.js";
import { findOwnedPropertyOrFail } from "./property.controller.js";
import { PropertyImageModel } from "../models/property-image.model.js";
import cloudinary from "../config/cloudinary.js";

const uploadBuffer = (file, propertyId) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "property-images",
        public_id: `property-${propertyId}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
        resource_type: "image",
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    stream.end(file.buffer);
  });

const getPublicIdFromUrl = (url) => {
  if (!url?.includes("res.cloudinary.com")) return null;
  try {
    const pathname = new URL(url).pathname;
    const marker = "/upload/";
    const markerIndex = pathname.indexOf(marker);
    if (markerIndex === -1) return null;
    let publicId = pathname.slice(markerIndex + marker.length);
    publicId = publicId.replace(/^v\d+\//, "");
    publicId = publicId.replace(/\.[^/.]+$/, "");
    return publicId;
  } catch {
    return null;
  }
};

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

  if (!process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET) {
    throw new ApiError(500, "Cloudinary no está configurado.");
  }

  let uploaded = [];
  try {
    uploaded = await Promise.all(
      req.files.map((file) => uploadBuffer(file, propertyId)),
    );
    const images = await PropertyImageModel.bulkCreate(
      uploaded.map((result) => ({
        url: result.secure_url,
        propertyId,
      })),
    );

    res.status(201).json({ message: "Imágenes subidas correctamente.", images });
  } catch (error) {
    await Promise.all(
      uploaded.map((result) =>
        cloudinary.uploader.destroy(result.public_id).catch(() => null),
      ),
    );
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

  const publicId = image.publicId || getPublicIdFromUrl(image.url);
  if (publicId) {
    await cloudinary.uploader.destroy(publicId).catch((error) => {
      console.error("No se pudo eliminar la imagen de Cloudinary:", error);
    });
  }

  await image.destroy();

  res.json({ message: "Imagen eliminada correctamente." });
});
