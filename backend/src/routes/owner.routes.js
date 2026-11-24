import { Router } from "express";
import {
  getMyOwnerProfile,
  updateMyOwnerProfile,
} from "../controllers/owner.controller.js";
import { listMyPendingGuaranteeAccessRequests } from "../controllers/property-guarantee.controller.js";
import {
  confirmEmailVerification,
  confirmPhoneVerification,
  requestEmailVerification,
  requestPhoneVerification,
} from "../controllers/student.controller.js";
import {
  confirmEmailVerificationValidator,
  confirmPhoneVerificationValidator,
  requestEmailVerificationValidator,
  requestPhoneVerificationValidator,
} from "../middlewares/validators/student.validator.js";
import { updateOwnerProfileValidator } from "../middlewares/validators/owner.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

router.use(authenticate, authorize("owner"));

router.get("/me/profile", getMyOwnerProfile);
router.get("/me/guarantee-access-requests", listMyPendingGuaranteeAccessRequests);
router.put("/me/profile", updateOwnerProfileValidator, validate, updateMyOwnerProfile);
router.post(
  "/me/email-verification",
  requestEmailVerificationValidator,
  validate,
  requestEmailVerification,
);
router.post(
  "/me/email-verification/confirm",
  confirmEmailVerificationValidator,
  validate,
  confirmEmailVerification,
);
router.post(
  "/me/phone-verification",
  requestPhoneVerificationValidator,
  validate,
  requestPhoneVerification,
);
router.post(
  "/me/phone-verification/confirm",
  confirmPhoneVerificationValidator,
  validate,
  confirmPhoneVerification,
);

export default router;
