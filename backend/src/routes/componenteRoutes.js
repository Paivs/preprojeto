import { Router } from "express";

import {
  atualizar,
  buscarPorId,
  criar,
  excluir,
  listar,
} from "../controllers/componenteController.js";
import { authMiddleware, requirePerfil } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", listar);
router.get("/:id", buscarPorId);
router.post("/", authMiddleware, requirePerfil("ADMIN"), criar);
router.put("/:id", authMiddleware, requirePerfil("ADMIN"), atualizar);
router.delete("/:id", authMiddleware, requirePerfil("ADMIN"), excluir);

export default router;