import { Router } from "express";
import { abrirChamado,buscarRespostas,listar,registrar } from "../controllers/inspecaoController.js";
import { authMiddleware,requirePerfil } from "../middlewares/authMiddleware.js";
const r=Router();r.get("/",authMiddleware,requirePerfil("PROFESSOR"),listar);r.post("/",authMiddleware,requirePerfil("PROFESSOR"),registrar);r.post("/:id/chamado",authMiddleware,requirePerfil("PROFESSOR"),abrirChamado);r.get("/:id/respostas",authMiddleware,requirePerfil("PROFESSOR"),buscarRespostas);export default r;
