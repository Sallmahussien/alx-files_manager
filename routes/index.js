import { Router } from 'express';
import appRouter from './AppRoutes';
import userRoutes from './UserRoutes';

const router = Router();

router.use('/', appRouter);
router.use('/', userRoutes);

export default router;
