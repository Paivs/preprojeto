import { Router } from "express";
import { buscarRespostas,listar,registrar } from "../controllers/inspecaoController.js";
import { authMiddleware,requirePerfil } from "../middlewares/authMiddleware.js";
const r=Router();r.get("/",authMiddleware,requirePerfil("PROFESSOR"),listar);r.post("/",authMiddleware,requirePerfil("PROFESSOR"),registrar);r.get("/:id/respostas",authMiddleware,requirePerfil("PROFESSOR"),buscarRespostas);export default r;
