import { body, param, query } from "express-validator";

export const propertyTenantIdParamValidator = [
  param("id").isInt({ min: 1 }).withMessage("El id de la propiedad no es válido."),
];

export const tenantIdParamValidator = [
  ...propertyTenantIdParamValidator,
  param("tenantId").isInt({ min: 1 }).withMessage("El id de la persona no es válido."),
];

export const listPropertyTenantsQueryValidator = [
  query("period")
    .optional()
    .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
    .withMessage("El período debe tener el formato AAAA-MM."),
];

export const addPropertyTenantValidator = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Ingresá un email válido."),
];

export const setPropertyTenantPaymentValidator = [
  body("period")
    .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
    .withMessage("El período debe tener el formato AAAA-MM."),
  body("paid")
    .isBoolean()
    .withMessage("El estado del pago debe ser pagado o pendiente."),
];
