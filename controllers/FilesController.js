/* eslint-disable import/named */
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { ObjectID } from 'mongodb';
import mime from 'mime-types';
import util from 'util';
import { getUserId } from '../utils/utils';

import dbClient from '../utils/db';

const readFileAsync = util.promisify(fs.readFile);

const ROOT_PARENT_ID = '0';

class FilesController {
  static async postUpload(req, res) {
    const { user } = req;

    const userId = user.id;
    const { name, type, data } = req.body;
    const parentId = req.body.parentId || ROOT_PARENT_ID;
    const isPublic = req.body.isPublic || false;
    const localPath = process.env.FOLDER_PATH || '/tmp/files_manager/';

    const validFileTypes = ['folder', 'file', 'image'];

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !validFileTypes.includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }

    try {
      if (parentId !== ROOT_PARENT_ID) {
        const file = await dbClient.getFileByIdAndUserId(parentId, userId);

        if (!file) {
          return res.status(400).json({ error: 'Parent not found' });
        }
        if (file.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      const newFile = {
        userId: new ObjectID(userId),
        name,
        type,
        isPublic,
        parentId: parentId !== ROOT_PARENT_ID ? new ObjectID(parentId) : parentId,
      };

      if (type !== 'folder') {
        const fileName = uuidv4();
        const filePath = !localPath.endsWith('/') ? `${localPath}/${fileName}` : `${localPath}${fileName}`;
        newFile.localPath = filePath;
        const decodedData = Buffer.from(data, 'base64').toString('utf-8');

        const directory = path.dirname(filePath);
        if (!fs.existsSync(directory)) {
          fs.mkdirSync(directory, { recursive: true });
        }

        fs.writeFile(filePath, decodedData, (err) => {
          if (err) throw err;
        });
      }

      const createdFile = await dbClient.addFile(newFile);
      return res.status(201).json({
        id: createdFile.insertedId,
        userId,
        name,
        type,
        isPublic,
        parentId
      });
    } catch (error) {
      return res.status(500).send('Internal server error');
    }
  }

  static async getShow(req, res) {
    const { user } = req;

    const { id } = req.params;
    const userId = user.id;

    try {
      const file = await dbClient.getFileByIdAndUserId(id, userId);

      if (!file) {
        return res.status(400).json({ error: 'Not found' });
      }

      const { _id, localPath, ...newFile } = { id: file._id, ...file };
      return res.status(200).json(newFile);
    } catch (error) {
      return res.status(500).send('Internal server error');
    }
  }

  static async getIndex(req, res) {
    const { user } = req;

    const userId = user.id;
    const parentId = req.query.parentId || 0;
    const page = parseInt(req.query.page, 10) || 0;

    try {
      const files = await dbClient.getPaginatedFiles(userId, parentId, page);

      const modifiedData = files.map((file) => {
        const {
          _id, localPath, parentId, ...rest
        } = file;
        return {
          id: _id,
          ...rest,
          parentId
        };
      });
      return res.status(200).json(modifiedData);
    } catch (error) {
      return res.status(500).send('Internal server error');
    }
  }

  static async putFilePublish(req, res, isPublic) {
    const { user } = req;
    const userId = user.id;
    const { id } = req.params;

    try {
      const file = await dbClient.updateFileIsPublic(id, userId, isPublic);
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      const { _id, ...rest } = file;
      const modifiedFile = { id: _id, ...rest };

      return res.status(200).json(modifiedFile);
    } catch (error) {
      return res.status(500).send('Internal server error');
    }
  }

  static async putPublish(req, res) {
    return FilesController.putFilePublish(req, res, true);
  }

  static async putUnpublish(req, res) {
    return FilesController.putFilePublish(req, res, false);
  }

  static async getFile(req, res) {
    const fileId = req.params.id;
    const tokenFromHeaders = req.headers['x-token'];

    try {
      const file = await dbClient.getFileById(fileId);
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      const userId = await getUserId(tokenFromHeaders);
      if (!file.isPublic && (!userId || file.userId.toString() !== userId)) {
        return res.status(404).json({ error: 'Not found' });
      }

      if (file.type === 'folder') {
        return res.status(400).json({ error: "A folder doesn't have content" });
      }

      if (!fs.existsSync(fileLocalPath)) {
        return res.status(404).json({ error: 'Not found' });
      }

      const fileMimeType = mime.lookup(file.name);
      if (!fileMimeType) {
        return res.status(404).json({ error: 'Not found' });
      }

      const data = await readFileAsync(fileLocalPath, 'utf8');

      res.setHeader('Content-Type', fileMimeType);
      return res.status(200).send(data);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Internal server error');
    }
  }
}

export default FilesController;
