import { Router } from 'express';
import UsersController from '../controllers/UsersController';

const userRouter = Router();

userRouter.post('/users', UsersController.postNew);

export default userRouter;
