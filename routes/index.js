import { Router } from 'express';
import appRouter from './AppRoutes';
import userRoutes from './UserRoutes';
import authRouter from './AuthRoutes';

const router = Router();

router.use('/', appRouter);
router.use('/', userRoutes);
router.use('/', authRouter);

export default router;
