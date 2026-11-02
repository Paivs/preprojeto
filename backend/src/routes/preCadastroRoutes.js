import { Router } from "express";

import {
  ativar,
  criar,
  listar,
  revogar,
} from "../controllers/preCadastroStaffController.js";
import { authMiddleware, requirePerfil } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, requirePerfil("ADMIN"), listar);
router.post("/", authMiddleware, requirePerfil("ADMIN"), criar);
router.delete("/:id", authMiddleware, requirePerfil("ADMIN"), revogar);
router.post("/ativar", ativar);

export default router;
