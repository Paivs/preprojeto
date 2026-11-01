import { Router } from "express";

import { cadastrarAluno, gerarMatricula } from "../controllers/alunoController.js";

const router = Router();

router.post("/gerar-matricula", gerarMatricula);
router.post("/cadastro", cadastrarAluno);

export default router;
