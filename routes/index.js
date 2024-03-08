import { Router } from 'express';
import appRouter from './AppRoutes';

const router = Router();

router.use('/', appRouter);

export default router;
