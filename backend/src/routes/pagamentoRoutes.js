import { Router } from 'express';
import * as PagamentoController from '../controllers/PagamentoController.js';

const router = Router();

router.get('/', PagamentoController.listar);
router.get('/:id', PagamentoController.buscarPorId);
router.post('/', PagamentoController.criar);
router.put('/:id', PagamentoController.atualizar);
router.delete('/:id', PagamentoController.excluir);

export default router;
