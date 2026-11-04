import { Router } from "express";
import { gerar } from "../controllers/tecnicoDashboardController.js";
import { authMiddleware, requirePerfil } from "../middlewares/authMiddleware.js";

const router = Router();
router.get("/", authMiddleware, requirePerfil("TECNICO"), gerar);

export default router;
