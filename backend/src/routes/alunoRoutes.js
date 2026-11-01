import { Router } from "express";

import { gerarMatricula } from "../controllers/alunoController.js";

const router = Router();

router.post("/gerar-matricula", gerarMatricula);

export default router;
