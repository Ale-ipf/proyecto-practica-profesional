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

export const whatsappPhoneValidator = [
  body("whatsappPhone")
    .exists().withMessage("El número de WhatsApp es obligatorio.")
    .bail()
    .isString().withMessage("El número de WhatsApp debe ser texto.")
    .bail()
    .trim()
    .custom((value) => {
      if (value === "") return true;
      if (!/^\+?[0-9\s().-]{8,22}$/.test(value)) {
        throw new Error("Ingresá un número válido con código de país, por ejemplo +54 9 3704 123456.");
      }

      const digits = value.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 15) {
        throw new Error("El número debe tener entre 10 y 15 dígitos, incluido el código de país.");
      }

      return true;
    }),
];
