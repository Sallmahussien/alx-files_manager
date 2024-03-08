import AppController from "../controllers/AppController";
import { Router } from "express";

const router = Router()

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

export default router;