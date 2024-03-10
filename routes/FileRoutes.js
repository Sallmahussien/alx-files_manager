/* eslint-disable import/named */
import { Router } from 'express';
import FilesController from '../controllers/FilesController';
import { xTokenAuth } from '../middlewares/auth';

const fileRouter = Router();

fileRouter.post('/', xTokenAuth, FilesController.postUpload);
fileRouter.get('/:id', xTokenAuth, FilesController.getShow);
fileRouter.get('/', xTokenAuth, FilesController.getIndex);
fileRouter.put('/:id/publish', xTokenAuth, FilesController.putPublish);
fileRouter.put('/:id/unpublish', xTokenAuth, FilesController.putUnpublish);
fileRouter.get('/:id/data', FilesController.getFile);

export default fileRouter;
