import { Router } from "express";

import {
  atualizarAtivo,
  atualizarPerfil,
  listar,
  login,
} from "../controllers/usuarioController.js";
import { authMiddleware, requirePerfil } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.get("/", authMiddleware, requirePerfil("ADMIN"), listar);
router.put("/:id/perfil", authMiddleware, requirePerfil("ADMIN"), atualizarPerfil);
router.patch("/:id/ativo", authMiddleware, requirePerfil("ADMIN"), atualizarAtivo);

export default router;
