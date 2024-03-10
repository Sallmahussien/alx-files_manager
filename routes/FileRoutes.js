/* eslint-disable import/named */
import { Router } from 'express';
import FilesController from '../controllers/FilesController';
import { xTokenAuth } from '../middlewares/auth';

const fileRouter = Router();

fileRouter.post('/files', xTokenAuth, FilesController.postUpload);
fileRouter.get('/files/:id', xTokenAuth, FilesController.getShow);
fileRouter.get('/files', xTokenAuth, FilesController.getIndex);
fileRouter.put('/files/:id/publish', xTokenAuth, FilesController.putPublish);
fileRouter.put('/files/:id/unpublish', xTokenAuth, FilesController.putUnpublish);

export default fileRouter;
