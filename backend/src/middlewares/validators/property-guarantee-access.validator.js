import { body, param } from "express-validator";

export const guaranteeAccessRequestIdParamValidator = [
  param("requestId").isInt({ min: 1 }).withMessage("El id de la solicitud no es válido."),
];

export const decideGuaranteeAccessValidator = [
  body("status").isIn(["approved", "rejected", "revoked"]).withMessage("Elegí aprobar, rechazar o revocar el acceso."),
];
