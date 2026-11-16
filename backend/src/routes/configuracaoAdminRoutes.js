import { Router } from 'express';
import * as ConfiguracaoController from '../controllers/ConfiguracaoAdminController.js';

const router = Router();

router.get('/', ConfiguracaoController.buscar);
router.put('/', ConfiguracaoController.atualizar);
router.put('/senha', ConfiguracaoController.alterarSenha);

export default router;
