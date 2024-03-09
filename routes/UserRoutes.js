/* eslint-disable import/named */
import { Router } from 'express';
import UsersController from '../controllers/UsersController';
import { xTokenAuth } from '../middlewares/auth';

const userRouter = Router();

userRouter.post('/users', UsersController.postNew);
userRouter.get('/users/me', xTokenAuth, UsersController.getMe);

export default userRouter;
