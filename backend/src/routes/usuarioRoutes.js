
import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";

import {
    obterMeuPerfil,
    atualizarMeuPerfil,
    alterarMinhaSenha,
    listarMeusRelatos
} from "../controllers/usuarioController.js";
const router = Router();

// Todas as rotas exigem autenticação e perfil de cidadão.
router.use(authMiddleware, checkRole("cidadao"));

// Consultar o próprio perfil.
router.get("/perfil", obterMeuPerfil);

// Atualizar nome e e-mail.
router.put("/perfil", atualizarMeuPerfil);

// Alterar senha.
router.patch("/senha", alterarMinhaSenha);

router.get("/relatos", listarMeusRelatos);
export default router;
