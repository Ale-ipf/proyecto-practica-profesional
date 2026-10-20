import { Router } from "express";
import { listInstitutions } from "../controllers/institution.controller.js";

const router = Router();

router.get("/", listInstitutions);

export default router;
