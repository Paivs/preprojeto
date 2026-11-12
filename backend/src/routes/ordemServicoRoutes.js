import { Router } from "express";

import { atualizarStatus, buscarPorId, concluir, listarParaTecnicos } from "../controllers/ordemServicoController.js";
import { authMiddleware, requirePerfil } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, requirePerfil("TECNICO"), listarParaTecnicos);
router.get("/:id", authMiddleware, requirePerfil("ADMIN", "TECNICO"), buscarPorId);
router.post("/:id/concluir", authMiddleware, requirePerfil("TECNICO"), concluir);
router.patch("/:id", authMiddleware, requirePerfil("ADMIN"), atualizarStatus);

export default router;
