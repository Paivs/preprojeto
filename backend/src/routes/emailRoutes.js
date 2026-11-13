import { Router } from 'express';
import * as EmailController from '../controllers/EmailController.js';

const router = Router();

router.post('/', EmailController.enviar);

export default router;
