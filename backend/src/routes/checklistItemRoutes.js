import { Router } from "express";
import { atualizarItem, excluirItem } from "../controllers/checklistController.js";
import { authMiddleware, requirePerfil } from "../middlewares/authMiddleware.js";

const router = Router();
router.put("/:id", authMiddleware, requirePerfil("ADMIN"), atualizarItem);
router.delete("/:id", authMiddleware, requirePerfil("ADMIN"), excluirItem);
export default router;
