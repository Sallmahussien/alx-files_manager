import { Router } from 'express';
import UsersController from '../controllers/UsersController';

const userRouter = Router();

userRouter.post('/users', UsersController.postNew);
userRouter.get('/users/me', UsersController.getMe);

export default userRouter;
