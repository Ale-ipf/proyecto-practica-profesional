import { body, param } from "express-validator";

export const updateStudentValidator = [
  body("university")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 150 }).withMessage("La universidad no puede superar los 150 caracteres."),

  body("career")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 150 }).withMessage("La carrera no puede superar los 150 caracteres."),

  body("origin_city")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage("La ciudad de origen no puede superar los 100 caracteres."),
];

export const studentIdParamValidator = [
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero válido."),
];
