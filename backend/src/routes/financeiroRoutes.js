import { Router } from 'express';
import * as FinanceiroController from '../controllers/FinanceiroController.js';

const router = Router();

router.get('/resumo', FinanceiroController.obterResumo);

export default router;
