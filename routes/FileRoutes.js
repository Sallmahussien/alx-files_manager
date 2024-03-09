/* eslint-disable import/named */
import { Router } from 'express';
import FilesController from '../controllers/FilesController';
import { xTokenAuth } from '../middlewares/auth';

const fileRouter = Router();

fileRouter.post('/files', xTokenAuth, FilesController.postUpload);

export default fileRouter;
