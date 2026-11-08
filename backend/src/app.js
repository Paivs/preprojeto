import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorHandler } from "./middlewares/errorHandler.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import adminRelatorioRoutes from "./routes/adminRelatorioRoutes.js";
import alunoRoutes from "./routes/alunoRoutes.js";
import agendamentoRoutes from "./routes/agendamentoRoutes.js";
import chamadoRoutes from "./routes/chamadoRoutes.js";
import checklistItemRoutes from "./routes/checklistItemRoutes.js";
import checklistModeloRoutes from "./routes/checklistModeloRoutes.js";
import equipamentoRoutes from "./routes/equipamentoRoutes.js";
import componenteRoutes from "./routes/componenteRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import ocorrenciaRoutes from "./routes/ocorrenciaRoutes.js";
import ordemServicoRoutes from "./routes/ordemServicoRoutes.js";
import preCadastroRoutes from "./routes/preCadastroRoutes.js";
import tecnicoDashboardRoutes from "./routes/tecnicoDashboardRoutes.js";
import turmaRoutes from "./routes/turmaRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  }),
);
app.use(express.json());

app.get("/", (request, response) => {
  response.json({
    message: "API do projeto base",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/alunos", alunoRoutes);
app.use("/api/agendamentos", agendamentoRoutes);
app.use("/api/equipamentos", equipamentoRoutes);
app.use("/api/componentes", componenteRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/pre-cadastros", preCadastroRoutes);
app.use("/api/chamados", chamadoRoutes);
app.use("/api/ordens-servico", ordemServicoRoutes);
app.use("/api/checklist-modelos", checklistModeloRoutes);
app.use("/api/checklist-itens", checklistItemRoutes);
app.use("/api/ocorrencias", ocorrenciaRoutes);
app.use("/api/admin/relatorios", adminRelatorioRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/tecnico/dashboard", tecnicoDashboardRoutes);
app.use("/api/turmas", turmaRoutes);
app.use(errorHandler);

export default app;
