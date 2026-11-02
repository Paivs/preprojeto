import { Router } from "express";

import {
  atualizar,
  atualizarStatus,
  buscarPorId,
  criar,
  excluir,
  listar,
} from "../controllers/equipamentoController.js";
import {
  desvincular,
  listar as listarComponentes,
  vincular,
} from "../controllers/equipamentoComponenteController.js";
import {
  authMiddleware,
  requirePerfil,
} from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", listar);
router.get("/:id", buscarPorId);
router.post("/", authMiddleware, requirePerfil("ADMIN"), criar);
router.put("/:id", authMiddleware, requirePerfil("ADMIN"), atualizar);
router.patch(
  "/:id/status",
  authMiddleware,
  requirePerfil("ADMIN"),
  atualizarStatus,
);
router.delete("/:id", authMiddleware, requirePerfil("ADMIN"), excluir);

router.get("/:id/componentes", listarComponentes);
router.post("/:id/componentes", authMiddleware, requirePerfil("ADMIN"), vincular);
router.delete("/:id/componentes/:componenteId", authMiddleware, requirePerfil("ADMIN"), desvincular);

export default router;
