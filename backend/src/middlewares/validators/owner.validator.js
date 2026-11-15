import { body } from "express-validator";

export const updateOwnerProfileValidator = [
  body("firstName")
    .trim()
    .notEmpty().withMessage("El nombre es obligatorio.")
    .isLength({ max: 100 }).withMessage("El nombre no puede superar los 100 caracteres."),
  body("lastName")
    .trim()
    .notEmpty().withMessage("El apellido es obligatorio.")
    .isLength({ max: 100 }).withMessage("El apellido no puede superar los 100 caracteres."),
  body("dni")
    .optional({ nullable: true })
    .trim()
    .custom((value) => {
      if (value === "") return true;
      if (!/^\d{7,8}$/.test(value)) {
        throw new Error("El DNI debe tener 7 u 8 dígitos.");
      }
      return true;
    }),
];
