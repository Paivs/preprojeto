import { Router } from "express";

import {
  atualizarAtivo,
  atualizarDados,
  atualizarPerfil,
  listar,
  login,
  me,
} from "../controllers/usuarioController.js";
import { authMiddleware, requirePerfil } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.get("/me", authMiddleware, me);
router.get("/", authMiddleware, requirePerfil("ADMIN"), listar);
router.put("/:id", authMiddleware, requirePerfil("ADMIN"), atualizarDados);
router.put("/:id/perfil", authMiddleware, requirePerfil("ADMIN"), atualizarPerfil);
router.patch("/:id/ativo", authMiddleware, requirePerfil("ADMIN"), atualizarAtivo);

export default router;
