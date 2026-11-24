import { PropertyGuaranteeDocumentModel } from "../models/property-guarantee-document.model.js";
import cloudinary from "../config/cloudinary.js";

export const deleteGuaranteeDocumentsForProperties = async (propertyIds, transaction) => {
  if (!propertyIds.length) return;
  const documents = await PropertyGuaranteeDocumentModel.findAll({
    where: { propertyId: propertyIds },
    transaction,
  });
  for (const document of documents) {
    const result = await cloudinary.uploader.destroy(document.publicId, {
      resource_type: "image",
      type: "authenticated",
    });
    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error(`No se pudo borrar el documento privado ${document.id}.`);
    }
  }
  await PropertyGuaranteeDocumentModel.destroy({
    where: { propertyId: propertyIds },
    transaction,
  });
};
