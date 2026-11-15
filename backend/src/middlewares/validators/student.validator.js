import { body, param } from "express-validator";

export const updateStudentValidator = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage("El nombre debe tener entre 1 y 100 caracteres."),

  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage("El apellido debe tener entre 1 y 100 caracteres."),

  body("username")
    .optional()
    .trim()
    .toLowerCase()
    .matches(/^[a-z0-9._-]{3,30}$/)
    .withMessage("El nombre de usuario debe tener entre 3 y 30 caracteres (letras, números, punto, guion o guion bajo)."),

  body("university")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 150 }).withMessage("La universidad no puede superar los 150 caracteres."),

  body("career")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 150 }).withMessage("La carrera no puede superar los 150 caracteres."),

  body("biography")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 }).withMessage("La biografía no puede superar los 500 caracteres."),

  body("origin_city")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage("La ciudad de origen no puede superar los 100 caracteres."),
];

export const requestEmailVerificationValidator = [
  body("email")
    .trim()
    .isEmail().withMessage("El email no es válido.")
    .isLength({ max: 100 }).withMessage("El email no puede superar los 100 caracteres.")
    .normalizeEmail(),
];

export const confirmEmailVerificationValidator = [
  body("code")
    .trim()
    .matches(/^\d{6}$/).withMessage("Ingresá el código de 6 dígitos."),
];

export const requestPhoneVerificationValidator = [
  body("phone")
    .trim()
    .matches(/^\+[1-9]\d{7,14}$/)
    .withMessage("Ingresá el teléfono con código de país, por ejemplo +5493704123456."),
];

export const confirmPhoneVerificationValidator = [
  body("code")
    .trim()
    .matches(/^\d{4,10}$/).withMessage("Ingresá el código recibido por SMS."),
];

export const studentIdParamValidator = [
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero válido."),
];
