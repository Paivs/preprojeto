
import { Router } from "express";

import {
    listarRelatosPublicos
} from "../controllers/relatosPublicosController.js";

const router = Router();

router.get("/", listarRelatosPublicos);

export default router;
