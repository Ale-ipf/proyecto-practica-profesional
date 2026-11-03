import { Router } from "express";
import {
  listProperties,
  getPropertyById,
  getMyProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../controllers/property.controller.js";
import { addPropertyImages, deletePropertyImage, uploadPropertyImage } from "../controllers/property-image.controller.js";
import {
  createPropertyValidator,
  updatePropertyValidator,
  propertyIdParamValidator,
  listPropertiesQueryValidator,
} from "../validators/property.validator.js";
import { addImagesValidator, imageIdParamValidator, imageUploadValidator } from "../validators/property-image.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// --- Rutas públicas ---
router.get("/", listPropertiesQueryValidator, validate, listProperties);

// --- Rutas protegidas (solo owner) ---
// Va antes de "/:id" para que "mine/list" no matchee como un id.
router.get("/mine/list", authenticate, authorize("owner"), getMyProperties);

router.get("/:id", propertyIdParamValidator, validate, getPropertyById);

router.post("/", authenticate, authorize("owner"), upload.single("image"), createPropertyValidator, validate, createProperty);
router.put("/:id", authenticate, authorize("owner"), propertyIdParamValidator, updatePropertyValidator, validate, updateProperty);
router.delete("/:id", authenticate, authorize("owner"), propertyIdParamValidator, validate, deleteProperty);

// --- Imágenes de la propiedad (solo owner dueño) ---
router.post("/:propertyId/images", authenticate, authorize("owner"), addImagesValidator, validate, addPropertyImages);
router.post("/:propertyId/images/upload", authenticate, authorize("owner"), imageUploadValidator, validate, upload.single("image"), uploadPropertyImage);
router.delete("/:propertyId/images/:imageId", authenticate, authorize("owner"), imageIdParamValidator, validate, deletePropertyImage);

export default router;
