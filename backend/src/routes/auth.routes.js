import { Router } from "express";
import { register, login, me, updateMyWhatsAppPhone } from "../controllers/auth.controller.js";
import { registerValidator, loginValidator, whatsappPhoneValidator } from "../validators/auth.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.get("/me", authenticate, me);
router.put("/me", authenticate, whatsappPhoneValidator, validate, updateMyWhatsAppPhone);

export default router;