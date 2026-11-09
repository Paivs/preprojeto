import { Router } from "express";
import { criar, listar } from "../controllers/turmaController.js";
import { authMiddleware, requirePerfil } from "../middlewares/authMiddleware.js";

const router = Router();
router.get("/", authMiddleware, requirePerfil("ADMIN", "PROFESSOR"), listar);
router.post("/", authMiddleware, requirePerfil("ADMIN"), criar);
export default router;
