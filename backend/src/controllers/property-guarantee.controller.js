import { asyncHandler } from "../helpers/async-handler.js";
import { ApiError } from "../helpers/api-error.js";
import { PropertyGuaranteeDocumentModel } from "../models/property-guarantee-document.model.js";
import { PropertyGuaranteeAccessRequestModel } from "../models/property-guarantee-access-request.model.js";
import { UserModel } from "../models/user.model.js";
import { PropertyModel } from "../models/property.model.js";
import { findOwnedPropertyOrFail } from "./property.controller.js";
import cloudinary from "../config/cloudinary.js";

const allowedDocumentTypes = new Set(["title_deed", "domain_report", "consent"]);
const ACCESS_WINDOW_MS = 24 * 60 * 60 * 1000;

const hasCloudinaryConfig = () =>
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

const safeName = (name) => name.replace(/[\\/]/g, "_").slice(-180);

const uploadPrivateDocument = (file, propertyId, documentType) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `guarantee-documents/property-${propertyId}`,
        public_id: `${documentType}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
        resource_type: "image",
        type: "authenticated",
        use_filename: false,
      },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    stream.end(file.buffer);
  });

const getOwnedDocument = async (propertyId, documentId, userId) => {
  await findOwnedPropertyOrFail(propertyId, userId);
  const document = await PropertyGuaranteeDocumentModel.findOne({
    where: { id: documentId, propertyId },
  });
  if (!document) throw new ApiError(404, "No encontramos ese documento.");
  return document;
};

const revokeActiveShares = async (propertyId) => {
  await PropertyGuaranteeAccessRequestModel.update(
    { status: "revoked", expiresAt: new Date() },
    { where: { propertyId, status: "approved" } },
  );
};

const getActiveStudentGrant = async (propertyId, studentId) => {
  const request = await PropertyGuaranteeAccessRequestModel.findOne({ where: { propertyId, studentId } });
  if (!request) throw new ApiError(403, "El dueño todavía no compartió la documentación con vos.");
  if (request.status !== "approved" || !request.expiresAt || request.expiresAt <= new Date()) {
    if (request.status === "approved") await request.update({ status: "expired" });
    throw new ApiError(403, "El acceso a la documentación no está vigente.");
  }
  return request;
};

export const requestPropertyGuaranteeAccess = asyncHandler(async (req, res) => {
  const property = await PropertyModel.findByPk(req.params.id);
  if (!property) throw new ApiError(404, "Propiedad no encontrada.");
  if (Number(property.userId) === Number(req.user.id)) {
    throw new ApiError(409, "No podés solicitar documentación de tu propia propiedad.");
  }
  let [request, created] = await PropertyGuaranteeAccessRequestModel.findOrCreate({
    where: { propertyId: req.params.id, studentId: req.user.id },
    defaults: { propertyId: req.params.id, studentId: req.user.id, status: "pending" },
  });
  if (!created && ["rejected", "revoked", "expired"].includes(request.status)) {
    await request.update({ status: "pending", expiresAt: null, lastAccessAt: null });
  } else if (!created && request.status === "approved" && request.expiresAt <= new Date()) {
    await request.update({ status: "expired", expiresAt: null });
    await request.update({ status: "pending" });
  }
  res.status(created ? 201 : 200).json({ message: "Solicitud enviada al dueño.", request });
});

export const getMyPropertyGuaranteeAccess = asyncHandler(async (req, res) => {
  let request = await PropertyGuaranteeAccessRequestModel.findOne({
    where: { propertyId: req.params.id, studentId: req.user.id },
  });
  if (request?.status === "approved" && request.expiresAt <= new Date()) {
    await request.update({ status: "expired" });
  }
  const documents = request?.status === "approved"
    ? await PropertyGuaranteeDocumentModel.findAll({
      where: { propertyId: req.params.id },
      attributes: ["id", "documentType", "originalName", "mimeType", "createdAt"],
      order: [["createdAt", "DESC"]],
    })
    : [];
  res.json({ request, documents });
});

export const listPropertyGuaranteeAccessRequests = asyncHandler(async (req, res) => {
  await findOwnedPropertyOrFail(req.params.id, req.user.id);
  const requests = await PropertyGuaranteeAccessRequestModel.findAll({
    where: { propertyId: req.params.id },
    include: [{ model: UserModel, as: "student", attributes: ["id", "name", "email"] }],
    order: [["createdAt", "DESC"]],
  });
  const now = new Date();
  for (const request of requests) {
    if (request.status === "approved" && request.expiresAt <= now) {
      await request.update({ status: "expired" });
    }
  }
  res.json({ requests });
});

export const decidePropertyGuaranteeAccess = asyncHandler(async (req, res) => {
  await findOwnedPropertyOrFail(req.params.id, req.user.id);
  const request = await PropertyGuaranteeAccessRequestModel.findOne({
    where: { id: req.params.requestId, propertyId: req.params.id },
  });
  if (!request) throw new ApiError(404, "No encontramos esa solicitud.");
  if (req.body.status === "revoked") {
    if (request.status !== "approved") throw new ApiError(409, "Solo podés revocar un acceso vigente.");
    await request.update({ status: "revoked", expiresAt: new Date() });
  } else if (request.status !== "pending") {
    throw new ApiError(409, "Esta solicitud ya fue respondida.");
  } else if (req.body.status === "approved") {
    const documents = await PropertyGuaranteeDocumentModel.findAll({
      where: { propertyId: req.params.id },
      attributes: ["documentType"],
    });
    const availableTypes = new Set(documents.map((document) => document.documentType));
    if (!availableTypes.has("title_deed") || !availableTypes.has("domain_report")) {
      throw new ApiError(409, "Para compartir la garantía, cargá primero la escritura y el informe de dominio.");
    }
    await request.update({ status: "approved", expiresAt: new Date(Date.now() + ACCESS_WINDOW_MS) });
  } else {
    await request.update({ status: "rejected", expiresAt: null });
  }
  const messages = {
    approved: "Acceso habilitado por 24 horas.",
    rejected: "Solicitud rechazada.",
    revoked: "Acceso revocado.",
  };
  res.json({ message: messages[req.body.status], request });
});

export const listPropertyGuaranteeDocuments = asyncHandler(async (req, res) => {
  await findOwnedPropertyOrFail(req.params.id, req.user.id);
  const documents = await PropertyGuaranteeDocumentModel.findAll({
    where: { propertyId: req.params.id },
    attributes: ["id", "documentType", "originalName", "mimeType", "createdAt"],
    order: [["createdAt", "DESC"]],
  });
  res.json({ documents });
});

export const uploadPropertyGuaranteeDocument = asyncHandler(async (req, res) => {
  const { id: propertyId } = req.params;
  const { documentType } = req.body;
  await findOwnedPropertyOrFail(propertyId, req.user.id);

  if (!allowedDocumentTypes.has(documentType)) {
    throw new ApiError(400, "Seleccioná un tipo de documento válido.");
  }
  if (req.body.authorizationConfirmed !== "true") {
    throw new ApiError(400, "Confirmá que tenés autorización para cargar este documento.");
  }
  if (!req.file) throw new ApiError(400, "Seleccioná un documento para subir.");
  const bytes = req.file.buffer;
  const validSignature = req.file.mimetype === "application/pdf"
    ? bytes.subarray(0, 5).toString() === "%PDF-"
    : req.file.mimetype === "image/jpeg"
      ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
      : bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (!validSignature) throw new ApiError(400, "El contenido del archivo no coincide con su formato.");
  if (!hasCloudinaryConfig()) {
    throw new ApiError(500, "El almacenamiento privado de documentos no está configurado.");
  }

  const uploaded = await uploadPrivateDocument(req.file, propertyId, documentType);
  try {
    const previous = await PropertyGuaranteeDocumentModel.findAll({
      where: { propertyId, documentType },
    });
    const document = await PropertyGuaranteeDocumentModel.create({
      propertyId,
      documentType,
      publicId: uploaded.public_id,
      originalName: safeName(req.file.originalname),
      mimeType: req.file.mimetype,
      uploadedBy: req.user.id,
    });

    for (const oldDocument of previous) {
      try {
        const result = await cloudinary.uploader.destroy(oldDocument.publicId, { resource_type: "image", type: "authenticated" });
        if (result.result !== "ok" && result.result !== "not found") {
          throw new Error("Cloudinary no confirmó el borrado del documento anterior.");
        }
        await oldDocument.destroy();
      } catch (cleanupError) {
        console.error("No se pudo reemplazar una versión anterior del documento:", cleanupError);
      }
    }
    await revokeActiveShares(propertyId);
    res.status(201).json({
      message: "Documento guardado de forma privada.",
      document: {
        id: document.id,
        documentType: document.documentType,
        originalName: document.originalName,
        mimeType: document.mimeType,
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
      await cloudinary.uploader.destroy(uploaded.public_id, { resource_type: "image", type: "authenticated" }).catch(() => null);
    throw error;
  }
});

export const getPropertyGuaranteeDocumentDownload = asyncHandler(async (req, res) => {
  let document;
  if (req.user.role === "owner") {
    document = await getOwnedDocument(req.params.id, req.params.documentId, req.user.id);
  } else {
    await getActiveStudentGrant(req.params.id, req.user.id);
    document = await PropertyGuaranteeDocumentModel.findOne({
      where: { id: req.params.documentId, propertyId: req.params.id },
    });
    if (!document) throw new ApiError(404, "No encontramos ese documento.");
    await PropertyGuaranteeAccessRequestModel.update(
      { lastAccessAt: new Date() },
      { where: { propertyId: req.params.id, studentId: req.user.id } },
    );
  }
  const expiresAt = Math.floor(Date.now() / 1000) + 300;
  const url = cloudinary.utils.private_download_url(
    document.publicId,
    document.mimeType === "application/pdf" ? "pdf" : document.mimeType === "image/png" ? "png" : "jpg",
    {
      resource_type: "image",
      type: "authenticated",
      expires_at: expiresAt,
    },
  );
  res.json({ url, expiresAt });
});

export const deletePropertyGuaranteeDocument = asyncHandler(async (req, res) => {
  const document = await getOwnedDocument(req.params.id, req.params.documentId, req.user.id);
  const result = await cloudinary.uploader.destroy(document.publicId, { resource_type: "image", type: "authenticated" });
  if (result.result !== "ok" && result.result !== "not found") {
    throw new ApiError(502, "No pudimos eliminar el archivo del almacenamiento privado.");
  }
  await document.destroy();
  await revokeActiveShares(req.params.id);
  res.json({ message: "Documento eliminado." });
});
