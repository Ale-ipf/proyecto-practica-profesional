import { body } from "express-validator";

export const createPropertyForumMessageValidator = [
  body("category")
    .isIn(["notice", "announcement", "issue", "general"])
    .withMessage("Elegí una categoría válida para la publicación."),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Escribí un mensaje antes de publicarlo.")
    .isLength({ max: 2000 })
    .withMessage("El mensaje no puede superar los 2000 caracteres."),
];
