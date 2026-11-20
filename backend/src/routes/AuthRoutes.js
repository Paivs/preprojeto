import express from "express";
import * as AuthController from "../controllers/AuthController.js";
import { autenticar } from "../middlewares/AuthMiddleware.js";

export const authRouter = express.Router();

authRouter.post("/registrar", AuthController.registrar);
authRouter.post("/login", AuthController.login);
authRouter.get("/sessao", autenticar, AuthController.sessaoAtual);
authRouter.post(
  "/pagamentos/:id/confirmar",
  autenticar,
  AuthController.confirmarPagamento,
);
