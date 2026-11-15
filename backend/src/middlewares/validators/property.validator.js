import { body, param, query } from "express-validator";

export const createPropertyValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("El título es obligatorio.")
    .isLength({ max: 150 }).withMessage("El título no puede superar los 150 caracteres."),

  body("description").trim().notEmpty().withMessage("La descripción es obligatoria."),

  body("price")
    .notEmpty().withMessage("El precio es obligatorio.")
    .isFloat({ gt: 0 }).withMessage("El precio debe ser un número mayor a 0."),

  body("address")
    .trim()
    .notEmpty().withMessage("La dirección es obligatoria.")
    .isLength({ max: 200 }).withMessage("La dirección no puede superar los 200 caracteres."),

  body("latitude")
    .notEmpty().withMessage("Seleccioná la ubicación del alquiler en el mapa.")
    .isFloat({ min: -90, max: 90 }).withMessage("La latitud debe estar entre -90 y 90."),

  body("longitude")
    .notEmpty().withMessage("Seleccioná la ubicación del alquiler en el mapa.")
    .isFloat({ min: -180, max: 180 }).withMessage("La longitud debe estar entre -180 y 180."),

  body("city")
    .trim()
    .notEmpty().withMessage("La ciudad es obligatoria.")
    .isLength({ max: 100 }).withMessage("La ciudad no puede superar los 100 caracteres."),

  body("bedrooms")
    .optional()
    .isInt({ min: 0 }).withMessage("La cantidad de dormitorios debe ser un número entero positivo."),

  body("available_spots")
    .optional()
    .isInt({ min: 0 }).withMessage("Los cupos disponibles deben ser un número entero igual o mayor a 0."),

  body("is_furnished")
    .optional()
    .isBoolean().withMessage("is_furnished debe ser true o false."),

  body("status")
    .optional()
    .isIn(["available", "rented"]).withMessage("El estado debe ser 'available' o 'rented'."),
];

export const updatePropertyValidator = [
  body("title").optional().trim().isLength({ min: 1, max: 150 }).withMessage("El título debe tener entre 1 y 150 caracteres."),
  body("description").optional().trim().notEmpty().withMessage("La descripción no puede estar vacía."),
  body("price").optional().isFloat({ gt: 0 }).withMessage("El precio debe ser un número mayor a 0."),
  body("address").optional().trim().isLength({ min: 1, max: 200 }).withMessage("La dirección debe tener entre 1 y 200 caracteres."),
  body("latitude").optional().isFloat({ min: -90, max: 90 }).withMessage("La latitud debe estar entre -90 y 90."),
  body("longitude").optional().isFloat({ min: -180, max: 180 }).withMessage("La longitud debe estar entre -180 y 180."),
  body().custom((_, { req }) => {
    const hasLatitude = req.body.latitude !== undefined;
    const hasLongitude = req.body.longitude !== undefined;
    if (hasLatitude !== hasLongitude) {
      throw new Error("La latitud y la longitud deben enviarse juntas.");
    }
    return true;
  }),
  body("city").optional().trim().isLength({ min: 1, max: 100 }).withMessage("La ciudad debe tener entre 1 y 100 caracteres."),
  body("bedrooms").optional().isInt({ min: 0 }).withMessage("La cantidad de dormitorios debe ser un número entero positivo."),
  body("available_spots").optional().isInt({ min: 0 }).withMessage("Los cupos disponibles deben ser un número entero igual o mayor a 0."),
  body("is_furnished").optional().isBoolean().withMessage("is_furnished debe ser true o false."),
  body("status").optional().isIn(["available", "rented"]).withMessage("El estado debe ser 'available' o 'rented'."),
];

export const propertyIdParamValidator = [
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero válido."),
];

export const listPropertiesQueryValidator = [
  query("city").optional().trim(),
  query("minPrice").optional().isFloat({ min: 0 }).withMessage("minPrice debe ser un número positivo."),
  query("maxPrice").optional().isFloat({ min: 0 }).withMessage("maxPrice debe ser un número positivo."),
  query("bedrooms").optional().isInt({ min: 0 }).withMessage("bedrooms debe ser un número entero positivo."),
  query("is_furnished").optional().isBoolean().withMessage("is_furnished debe ser true o false."),
  query("status").optional().isIn(["available", "rented"]).withMessage("status debe ser 'available' o 'rented'."),
  query("page").optional().isInt({ min: 1 }).withMessage("page debe ser un número entero mayor a 0."),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit debe estar entre 1 y 100."),
];
