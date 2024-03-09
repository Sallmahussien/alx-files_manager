/* eslint-disable import/named */
import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import { basicAuth, xTokenAuth } from '../middlewares/auth';

const authRouter = Router();

authRouter.get('/connect', basicAuth, AuthController.getConnect);
authRouter.get('/disconnect', xTokenAuth, AuthController.getDisconnect);

export default authRouter;
