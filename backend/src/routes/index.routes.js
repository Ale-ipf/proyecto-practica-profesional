import { Router } from "express";
import authRoutes from "./auth.routes.js";
import studentRoutes from "./student.routes.js";
import propertyRoutes from "./property.routes.js";
import institutionRoutes from "./institution.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/students", studentRoutes);
router.use("/properties", propertyRoutes);
router.use("/institutions", institutionRoutes);

export default router;
