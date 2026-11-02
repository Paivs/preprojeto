import { Router } from "express";
import { gerar } from "../controllers/adminDashboardController.js";
import { authMiddleware, requirePerfil } from "../middlewares/authMiddleware.js";

const router = Router();
router.get("/", authMiddleware, requirePerfil("ADMIN"), gerar);
export default router;
