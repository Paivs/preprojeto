import express from 'express';
import * as AuthController from '../controllers/AuthController.js';

export const authRouter = express.Router();

authRouter.post('/registrar', AuthController.registrar);
authRouter.post('/login', AuthController.login);