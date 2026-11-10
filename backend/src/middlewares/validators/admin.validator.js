import { body, param, query } from "express-validator";

const roleValues = ["student", "owner", "admin"];

export const adminUserIdValidator = [
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero válido."),
];

export const listAdminUsersQueryValidator = [
  query("role").optional().isIn(roleValues).withMessage("El rol indicado no es válido."),
  query("page").optional().isInt({ min: 1 }).withMessage("page debe ser un número entero mayor a 0."),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit debe estar entre 1 y 100."),
];

export const listAdminPropertiesQueryValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("page debe ser un número entero mayor a 0."),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit debe estar entre 1 y 100."),
];

export const updateAdminUserValidator = [
  body("name").optional().trim().isLength({ min: 2, max: 100 }).withMessage("El nombre debe tener entre 2 y 100 caracteres."),
  body("email").optional().trim().isEmail().withMessage("El email no es válido.").normalizeEmail(),
  body("password").optional().isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres."),
  body("role").optional().isIn(roleValues).withMessage("El rol debe ser 'student', 'owner' o 'admin'."),
  body("university").optional({ nullable: true }).trim().isLength({ max: 150 }).withMessage("La universidad no puede superar los 150 caracteres."),
  body("career").optional({ nullable: true }).trim().isLength({ max: 150 }).withMessage("La carrera no puede superar los 150 caracteres."),
  body("origin_city").optional({ nullable: true }).trim().isLength({ max: 100 }).withMessage("La ciudad de origen no puede superar los 100 caracteres."),
];

const institutionFields = [
  body("abbreviation").trim().notEmpty().isLength({ max: 30 }).withMessage("La sigla es obligatoria y no puede superar los 30 caracteres."),
  body("name").trim().notEmpty().isLength({ max: 150 }).withMessage("El nombre es obligatorio y no puede superar los 150 caracteres."),
  body("type").trim().notEmpty().isLength({ max: 80 }).withMessage("El tipo es obligatorio y no puede superar los 80 caracteres."),
  body("description").trim().notEmpty().isLength({ max: 255 }).withMessage("La descripción es obligatoria y no puede superar los 255 caracteres."),
  body("latitude").isFloat({ min: -90, max: 90 }).withMessage("La latitud debe estar entre -90 y 90."),
  body("longitude").isFloat({ min: -180, max: 180 }).withMessage("La longitud debe estar entre -180 y 180."),
  body("busStops").optional().isArray().withMessage("busStops debe ser una lista."),
];

export const createAdminInstitutionValidator = [
  body("id").trim().matches(/^[a-z0-9-]{1,50}$/).withMessage("El id solo puede contener letras minúsculas, números y guiones."),
  ...institutionFields,
];

export const updateAdminInstitutionValidator = institutionFields.map((validator) =>
  validator.optional(),
);

export const institutionIdParamValidator = [
  param("id").isString().isLength({ min: 1, max: 50 }).withMessage("El identificador de institución no es válido."),
];
