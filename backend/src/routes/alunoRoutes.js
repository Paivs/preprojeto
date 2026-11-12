import { Router } from "express";

import { cadastrarAluno, gerarMatricula, solicitarAcesso } from "../controllers/alunoController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/gerar-matricula", gerarMatricula);
router.post("/cadastro", cadastrarAluno);
router.post("/solicitar-acesso", authMiddleware, solicitarAcesso);

export default router;
