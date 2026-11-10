import { Router } from "express";
import {
  getMyStudentProfile,
  updateMyStudentProfile,
  getStudentById,
  requestEmailVerification,
  confirmEmailVerification,
  requestPhoneVerification,
  confirmPhoneVerification,
} from "../controllers/student.controller.js";
import {
  updateStudentValidator,
  studentIdParamValidator,
  requestEmailVerificationValidator,
  confirmEmailVerificationValidator,
  requestPhoneVerificationValidator,
  confirmPhoneVerificationValidator,
} from "../middlewares/validators/student.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/me", authenticate, authorize("student"), getMyStudentProfile);
router.put(
  "/me",
  authenticate,
  authorize("student"),
  updateStudentValidator,
  validate,
  updateMyStudentProfile,
);
router.post(
  "/me/email-verification",
  authenticate,
  authorize("student"),
  requestEmailVerificationValidator,
  validate,
  requestEmailVerification,
);
router.post(
  "/me/email-verification/confirm",
  authenticate,
  authorize("student"),
  confirmEmailVerificationValidator,
  validate,
  confirmEmailVerification,
);
router.post(
  "/me/phone-verification",
  authenticate,
  authorize("student"),
  requestPhoneVerificationValidator,
  validate,
  requestPhoneVerification,
);
router.post(
  "/me/phone-verification/confirm",
  authenticate,
  authorize("student"),
  confirmPhoneVerificationValidator,
  validate,
  confirmPhoneVerification,
);
router.get(
  "/:id",
  authenticate,
  studentIdParamValidator,
  validate,
  getStudentById,
);

export default router;
