import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorHandler } from "./middlewares/errorHandler.js";
import { autenticar, autorizarAdmin } from "./middlewares/AuthMiddleware.js";
import healthRoutes from "./routes/healthRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import setorRoutes from "./routes/setorRoutes.js";
import { authRouter } from "./routes/AuthRoutes.js";

const app = express();

// 1. Defesas de borda: Helmet e CORS
app.use(helmet());

const origensPermitidas = (
  process.env.CORS_ORIGENS || process.env.FRONTEND_URL || "http://localhost:3000"
)
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin(origem, callback) {
      if (!origem || origensPermitidas.includes(origem)) {
        return callback(null, true);
      }
      return callback(new Error("Origem não permitida pelo CORS."));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// 2. Rotas
app.get("/", (req, res) => {
  res.json({ message: "API do projeto base" });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRouter); // pública: login e registrar

app.use("/api/setores", autenticar, setorRoutes);

// Protegida: precisa de token E ser admin
app.use("/api/usuarios", autenticar, autorizarAdmin, usuarioRoutes);

// 3. Fallback 404 (rota que não existe)
app.use((req, res) => {
  res.status(404).json({
    sucesso: false,
    erro: `A rota ${req.method} ${req.originalUrl} não existe.`,
  });
});

// 4. Tratador global de erros
app.use(errorHandler);

export default app;
