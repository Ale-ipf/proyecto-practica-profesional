import { body } from "express-validator";

export const propertyReviewValidator = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("La valoración debe ser un número entero entre 1 y 5."),
  body("comment")
    .trim()
    .notEmpty().withMessage("Escribí un comentario para publicar tu valoración.")
    .isLength({ max: 1000 }).withMessage("El comentario no puede superar los 1000 caracteres."),
];
