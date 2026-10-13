import { body, param } from "express-validator";

export const addImagesValidator = [
  param("propertyId").isInt({ min: 1 }).withMessage("El id de la propiedad no es válido."),

  body("urls")
    .isArray({ min: 1 }).withMessage("Debés enviar un array 'urls' con al menos una imagen."),

  body("urls.*").isURL().withMessage("Cada url de imagen debe ser una URL válida."),
];

export const imageIdParamValidator = [
  param("propertyId").isInt({ min: 1 }).withMessage("El id de la propiedad no es válido."),
  param("imageId").isInt({ min: 1 }).withMessage("El id de la imagen no es válido."),
];
