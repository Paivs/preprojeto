import cors from "cors";
import express from "express";
import helmet from "helmet";

 import { errorHandler } from "./middlewares/errorHandler.js";
 import alunoRoutes from "./routes/alunoRoutes.js";
+import equipamentoRoutes from "./routes/equipamentoRoutes.js";
 import healthRoutes from "./routes/healthRoutes.js";
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
+app.use("/api/equipamentos", equipamentoRoutes);
 app.use("/api/usuarios", usuarioRoutes);
app.use(errorHandler);

export default app;
