import { Router } from 'express';
import * as ContatoController from '../controllers/ContatoController.js';

const router = Router();

router.post('/', ContatoController.criar);

export default router;
