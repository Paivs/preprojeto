import { Router } from "express";

import { healthCheck } from "../controllers/HealthController.js";

const router = Router();

router.get("/", healthCheck);

export default router;
