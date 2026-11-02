import { Router } from "express";
import {
  atualizarModelo, criarItem, criarModelo, excluirModelo, listarItens, listarModelos,
} from "../controllers/checklistController.js";
import { authMiddleware, requirePerfil } from "../middlewares/authMiddleware.js";

const router = Router();
router.get("/", authMiddleware, requirePerfil("ADMIN"), listarModelos);
router.post("/", authMiddleware, requirePerfil("ADMIN"), criarModelo);
router.put("/:id", authMiddleware, requirePerfil("ADMIN"), atualizarModelo);
router.delete("/:id", authMiddleware, requirePerfil("ADMIN"), excluirModelo);
router.get("/:id/itens", authMiddleware, requirePerfil("ADMIN"), listarItens);
router.post("/:id/itens", authMiddleware, requirePerfil("ADMIN"), criarItem);
export default router;
