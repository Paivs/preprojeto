import { Router } from 'express';
import * as SetorController from '../controllers/SetorController.js';

const router = Router();

router.get('/', SetorController.listar);
router.get('/:id', SetorController.buscarPorId);
router.post('/', SetorController.criar);
router.put('/:id', SetorController.atualizar);
router.delete('/:id', SetorController.excluir);

export default router;
