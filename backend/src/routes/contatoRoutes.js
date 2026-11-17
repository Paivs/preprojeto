import { Router } from 'express';
import * as ContatoController from '../controllers/ContatoController.js';
import { autenticar, autorizarAdmin } from '../middlewares/AuthMiddleware.js';

const router = Router();

router.get('/', autenticar, autorizarAdmin, ContatoController.listar);
router.post('/', ContatoController.criar);
router.patch('/:id/situacao', autenticar, autorizarAdmin, ContatoController.atualizarSituacao);

export default router;
