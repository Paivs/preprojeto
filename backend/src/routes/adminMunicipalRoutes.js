
import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";
import { checkMunicipalityScope } from "../middlewares/checkMunicipalityScope.js";

import {
    listarRelatosMunicipais,
    obterRelatosMapaMunicipal,
    obterRelatoMunicipal,
    aprovarRelato,
    rejeitarRelato,
    obterDashboardMunicipal,
    listarUsuariosMunicipais
} from "../controllers/adminMunicipalController.js";

import {
    obterConfiguracoesMunicipais,
    atualizarDadosMunicipais,
    alterarSenhaMunicipal
} from "../controllers/adminMunicipalConfiguracoesController.js";

const router = Router();

// Todas as rotas exigem autenticação,
// perfil municipal e município válido.
router.use(
    authMiddleware,
    checkRole("admin_municipal"),
    checkMunicipalityScope
);

// =========================================
// CONFIGURAÇÕES DA CONTA
// =========================================

router.get(
    "/configuracoes",
    obterConfiguracoesMunicipais
);

router.patch(
    "/configuracoes/dados",
    atualizarDadosMunicipais
);

router.patch(
    "/configuracoes/senha",
    alterarSenhaMunicipal
);

// =========================================
// DASHBOARD E RELATOS
// =========================================

router.get("/relatos/dashboard", obterDashboardMunicipal);
router.get("/relatos/mapa", obterRelatosMapaMunicipal);
router.get("/relatos", listarRelatosMunicipais);
router.get("/relatos/:id", obterRelatoMunicipal);
router.patch("/relatos/:id/aprovar", aprovarRelato);
router.patch("/relatos/:id/rejeitar", rejeitarRelato);

// =========================================
// USUÁRIOS
// =========================================

router.get("/usuarios", listarUsuariosMunicipais);

export default router;
