import { Router } from "express";
import {
  createAdminInstitution,
  deleteAdminInstitution,
  deleteAdminProperty,
  deleteUser,
  listAdminInstitutions,
  listAdminProperties,
  listUsers,
  updateAdminInstitution,
  updateAdminProperty,
  updateUser,
} from "../controllers/admin.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  adminUserIdValidator,
  createAdminInstitutionValidator,
  institutionIdParamValidator,
  listAdminPropertiesQueryValidator,
  listAdminUsersQueryValidator,
  updateAdminInstitutionValidator,
  updateAdminUserValidator,
} from "../middlewares/validators/admin.validator.js";
import {
  propertyIdParamValidator,
  updatePropertyValidator,
} from "../middlewares/validators/property.validator.js";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/users", listAdminUsersQueryValidator, validate, listUsers);
router.put("/users/:id", adminUserIdValidator, updateAdminUserValidator, validate, updateUser);
router.delete("/users/:id", adminUserIdValidator, validate, deleteUser);

router.get(
  "/properties",
  listAdminPropertiesQueryValidator,
  validate,
  listAdminProperties,
);
router.put(
  "/properties/:id",
  propertyIdParamValidator,
  updatePropertyValidator,
  validate,
  updateAdminProperty,
);
router.delete("/properties/:id", propertyIdParamValidator, validate, deleteAdminProperty);

router.get("/institutions", listAdminInstitutions);
router.post(
  "/institutions",
  createAdminInstitutionValidator,
  validate,
  createAdminInstitution,
);
router.put(
  "/institutions/:id",
  institutionIdParamValidator,
  updateAdminInstitutionValidator,
  validate,
  updateAdminInstitution,
);
router.delete(
  "/institutions/:id",
  institutionIdParamValidator,
  validate,
  deleteAdminInstitution,
);

export default router;
