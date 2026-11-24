import { param } from "express-validator";

export const guaranteeDocumentIdParamValidator = [
  param("documentId").isInt({ min: 1 }).withMessage("El id del documento no es válido."),
];
