import { Router } from "express";

import { atualizarStatus, buscarPorId, listarParaTecnico } from "../controllers/ordemServicoController.js";
import { authMiddleware, requirePerfil } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, requirePerfil("TECNICO"), listarParaTecnico);
router.get("/:id", authMiddleware, requirePerfil("ADMIN", "TECNICO"), buscarPorId);
router.patch("/:id", authMiddleware, requirePerfil("ADMIN"), atualizarStatus);

export default router;
