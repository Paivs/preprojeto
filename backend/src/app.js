
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorHandler } from "./middlewares/errorHandler.js";

import adminMunicipalRoutes from "./routes/adminMunicipalRoutes.js";
import adminGeralRoutes from "./routes/adminGeralRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import relatosPublicosRoutes from "./routes/relatosPublicosRoutes.js";

const app = express();

app.use(helmet());

app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "http://127.0.0.1:3000"
        ]
    })
);

app.use(express.json());

app.get("/", (request, response) => {
    response.json({
        message: "API do AlertABC funcionando!"
    });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin-geral", adminGeralRoutes);
app.use("/api/admin-municipal", adminMunicipalRoutes);
app.use("/api/usuario", usuarioRoutes);
app.use("/api/relatos", relatosPublicosRoutes);


app.use(errorHandler);

export default app;
