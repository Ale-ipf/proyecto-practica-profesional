import { Router } from "express";
import {
  getMyStudentProfile,
  updateMyStudentProfile,
  getStudentById,
} from "../controllers/student.controller.js";
import { updateStudentValidator, studentIdParamValidator } from "../validators/student.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/me", authenticate, authorize("student"), getMyStudentProfile);
router.put("/me", authenticate, authorize("student"), updateStudentValidator, validate, updateMyStudentProfile);
router.get("/:id", authenticate, studentIdParamValidator, validate, getStudentById);

export default router;
