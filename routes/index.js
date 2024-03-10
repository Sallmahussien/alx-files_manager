import { Router } from 'express';
import appRouter from './AppRoutes';
import userRoutes from './UserRoutes';
import authRouter from './AuthRoutes';
import fileRouter from './FileRoutes';

const router = Router();

router.use('/', appRouter);
router.use('/', userRoutes);
router.use('/', authRouter);
router.use('/files', fileRouter);

export default router;
