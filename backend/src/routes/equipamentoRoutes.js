import { Router } from "express";

import {
  atualizar,
  atualizarStatus,
  buscarPorId,
  criar,
  excluir,
  listar,
} from "../controllers/equipamentoController.js";
import { authMiddleware, requirePerfil } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", listar);
router.get("/:id", buscarPorId);
router.post("/", authMiddleware, requirePerfil("ADMIN"), criar);
router.put("/:id", authMiddleware, requirePerfil("ADMIN"), atualizar);
router.patch("/:id/status", authMiddleware, requirePerfil("ADMIN"), atualizarStatus);
router.delete("/:id", authMiddleware, requirePerfil("ADMIN"), excluir);

export default router;