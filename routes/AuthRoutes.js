import { Router } from 'express';
import AuthController from '../controllers/AuthController';

const authRouter = Router();

authRouter.get('/connect', AuthController.connect);
authRouter.get('/disconnect', AuthController.disconnect);

export default authRouter;
