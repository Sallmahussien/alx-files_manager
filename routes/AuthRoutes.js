import { Router } from 'express';
import AuthController from '../controllers/AuthController';

const authRouter = Router();

authRouter.get('/connect', AuthController.getConnect);
authRouter.get('/disconnect', AuthController.getDisconnect);

export default authRouter;
