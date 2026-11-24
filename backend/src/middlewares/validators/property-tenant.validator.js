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
  body("paymentMethod").custom((value, { req }) => {
    const isPaid = req.body.paid === true || req.body.paid === "true";
    if (isPaid && !["cash", "transfer"].includes(value)) {
      throw new Error("Elegí efectivo o transferencia para confirmar el pago.");
    }
    if (!isPaid && value != null && value !== "") {
      throw new Error("El método de pago solo se informa al marcar el pago como pagado.");
    }
    return true;
  }),
];
