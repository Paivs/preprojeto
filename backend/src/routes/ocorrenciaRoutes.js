import { Router } from "express";
import { listar } from "../controllers/ocorrenciaController.js";
import { authMiddleware, requirePerfil } from "../middlewares/authMiddleware.js";

const router = Router();
router.get("/", authMiddleware, requirePerfil("ADMIN"), listar);
export default router;
