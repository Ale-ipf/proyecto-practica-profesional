import { Router } from "express";
import authRoutes from "./auth.routes.js";
import studentRoutes from "./student.routes.js";
import propertyRoutes from "./property.routes.js";
import institutionRoutes from "./institution.routes.js";
import adminRoutes from "./admin.routes.js";
import ownerRoutes from "./owner.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/students", studentRoutes);
router.use("/properties", propertyRoutes);
router.use("/institutions", institutionRoutes);
router.use("/admin", adminRoutes);
router.use("/owners", ownerRoutes);

export default router;
