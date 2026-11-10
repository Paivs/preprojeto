import { Router } from 'express';
import * as EquipamentoController from '../controllers/EquipamentoController.js';

const router = Router();

router.get('/', EquipamentoController.listar);
router.get('/:id', EquipamentoController.buscarPorId);
router.post('/', EquipamentoController.criar);
router.put('/:id', EquipamentoController.atualizar);
router.delete('/:id', EquipamentoController.excluir);

export default router;
