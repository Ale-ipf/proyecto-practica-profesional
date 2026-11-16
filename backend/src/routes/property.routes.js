import { Router } from "express";
import {
  listProperties,
  getPropertyById,
  getMyProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../controllers/property.controller.js";
import {
  addPropertyImages,
  deletePropertyImage,
} from "../controllers/property-image.controller.js";
import {
  addPropertyTenant,
  listPropertyTenants,
  removePropertyTenant,
  setPropertyTenantPayment,
} from "../controllers/property-tenant.controller.js";
import {
  createPropertyForumMessage,
  listPropertyForumMessages,
} from "../controllers/property-forum.controller.js";
import {
  getOwnerProfileSummary,
} from "../controllers/owner.controller.js";
import {
  listPropertyReviews,
  saveMyPropertyReview,
} from "../controllers/property-review.controller.js";
import { propertyReviewValidator } from "../middlewares/validators/property-review.validator.js";
import { createPropertyForumMessageValidator } from "../middlewares/validators/property-forum.validator.js";
import {
  createPropertyValidator,
  updatePropertyValidator,
  propertyIdParamValidator,
  listPropertiesQueryValidator,
} from "../middlewares/validators/property.validator.js";
import {
  addImagesValidator,
  imageIdParamValidator,
} from "../middlewares/validators/property-image.validator.js";
import {
  addPropertyTenantValidator,
  listPropertyTenantsQueryValidator,
  propertyTenantIdParamValidator,
  setPropertyTenantPaymentValidator,
  tenantIdParamValidator,
} from "../middlewares/validators/property-tenant.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

// --- Rutas públicas ---
router.get("/", listPropertiesQueryValidator, validate, listProperties);

// --- Rutas protegidas (solo owner) ---
// Va antes de "/:id" para que "mine/list" no matchee como un id.
router.get("/mine/list", authenticate, authorize("owner"), getMyProperties);

router.get(
  "/:id/owner-profile",
  authenticate,
  authorize("student"),
  propertyIdParamValidator,
  validate,
  getOwnerProfileSummary,
);
router.get(
  "/:id/reviews",
  authenticate,
  authorize("student"),
  propertyIdParamValidator,
  validate,
  listPropertyReviews,
);
router.put(
  "/:id/reviews/me",
  authenticate,
  authorize("student"),
  propertyIdParamValidator,
  propertyReviewValidator,
  validate,
  saveMyPropertyReview,
);

router.get(
  "/:id/forum",
  authenticate,
  authorize("student", "owner"),
  propertyIdParamValidator,
  validate,
  listPropertyForumMessages,
);
router.post(
  "/:id/forum",
  authenticate,
  authorize("student", "owner"),
  propertyIdParamValidator,
  createPropertyForumMessageValidator,
  validate,
  createPropertyForumMessage,
);

router.get(
  "/:id/tenants",
  authenticate,
  authorize("owner"),
  propertyTenantIdParamValidator,
  listPropertyTenantsQueryValidator,
  validate,
  listPropertyTenants,
);
router.post(
  "/:id/tenants",
  authenticate,
  authorize("owner"),
  propertyTenantIdParamValidator,
  addPropertyTenantValidator,
  validate,
  addPropertyTenant,
);
router.delete(
  "/:id/tenants/:tenantId",
  authenticate,
  authorize("owner"),
  tenantIdParamValidator,
  validate,
  removePropertyTenant,
);
router.put(
  "/:id/tenants/:tenantId/payment",
  authenticate,
  authorize("owner"),
  tenantIdParamValidator,
  setPropertyTenantPaymentValidator,
  validate,
  setPropertyTenantPayment,
);

router.get("/:id", propertyIdParamValidator, validate, getPropertyById);

router.post(
  "/",
  authenticate,
  authorize("owner"),
  createPropertyValidator,
  validate,
  createProperty,
);
router.put(
  "/:id",
  authenticate,
  authorize("owner"),
  propertyIdParamValidator,
  updatePropertyValidator,
  validate,
  updateProperty,
);
router.delete(
  "/:id",
  authenticate,
  authorize("owner"),
  propertyIdParamValidator,
  validate,
  deleteProperty,
);

// --- Imágenes de la propiedad (solo owner dueño) ---
router.post(
  "/:propertyId/images",
  authenticate,
  authorize("owner"),
  addImagesValidator,
  validate,
  addPropertyImages,
);
router.delete(
  "/:propertyId/images/:imageId",
  authenticate,
  authorize("owner"),
  imageIdParamValidator,
  validate,
  deletePropertyImage,
);

export default router;
