import { Router } from "express";

import {
  atualizarStatus,
  atualizarTecnico,
  buscarPorId,
  criar,
  criarHistorico,
  emitirOrdemServico,
  listar,
  listarHistorico,
} from "../controllers/chamadoController.js";
import { authMiddleware, requirePerfil } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, requirePerfil("ADMIN", "TECNICO"), listar);
router.post("/", authMiddleware, requirePerfil("ADMIN", "PROFESSOR", "TECNICO"), criar);
router.get("/:id", authMiddleware, requirePerfil("ADMIN", "TECNICO"), buscarPorId);
router.patch("/:id/status", authMiddleware, requirePerfil("ADMIN", "TECNICO"), atualizarStatus);
router.patch("/:id/tecnico", authMiddleware, requirePerfil("ADMIN"), atualizarTecnico);

router.get("/:id/historico", authMiddleware, requirePerfil("ADMIN", "TECNICO"), listarHistorico);
router.post("/:id/historico", authMiddleware, requirePerfil("ADMIN", "TECNICO"), criarHistorico);

router.post("/:id/ordem-servico", authMiddleware, requirePerfil("ADMIN"), emitirOrdemServico);

export default router;
