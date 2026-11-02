import { Router } from "express";

import { atualizarStatus, buscarPorId } from "../controllers/ordemServicoController.js";
import { authMiddleware, requirePerfil } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/:id", authMiddleware, requirePerfil("ADMIN", "TECNICO"), buscarPorId);
router.patch("/:id", authMiddleware, requirePerfil("ADMIN"), atualizarStatus);

export default router;
