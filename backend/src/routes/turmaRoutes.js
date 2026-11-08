import { Router } from "express";
import { listar } from "../controllers/turmaController.js";
import { authMiddleware, requirePerfil } from "../middlewares/authMiddleware.js";

const router = Router();
router.get("/", authMiddleware, requirePerfil("PROFESSOR"), listar);
export default router;
