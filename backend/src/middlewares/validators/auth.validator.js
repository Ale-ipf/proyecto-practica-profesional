import { body } from "express-validator";

export const registerValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("El nombre es obligatorio.")
    .isLength({ min: 2, max: 100 }).withMessage("El nombre debe tener entre 2 y 100 caracteres."),

  body("email")
    .trim()
    .notEmpty().withMessage("El email es obligatorio.")
    .isEmail().withMessage("El email no es válido.")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("La contraseña es obligatoria.")
    .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres."),

  body("role")
    .notEmpty().withMessage("El rol es obligatorio.")
    .isIn(["student", "owner"]).withMessage("El rol debe ser 'student' u 'owner'."),
];

export const loginValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("El email es obligatorio.")
    .isEmail().withMessage("El email no es válido."),

  body("password").notEmpty().withMessage("La contraseña es obligatoria."),
];
