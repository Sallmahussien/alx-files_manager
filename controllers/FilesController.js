import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { ObjectID } from 'mongodb';

import dbClient from '../utils/db';

class FilesController {
  static async postUpload(req, res) {
    const { user } = req;

    const userId = user.id;
    const { name } = req.body;
    const { type } = req.body;
    const parentId = req.body.parentId || 0;
    const isPublic = req.body.isPublic || false;
    const { data } = req.body;
    const localPath = process.env.FOLDER_PATH || '/tmp/files_manager/';

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }

    try {
      if (parentId) {
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
        parentId,
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
      return res.status(201).json(createdFile);
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
        return res.status(400).json({ error: "Not found" });
      }

      const { _id, ...newFile } = { id: file._id, ...file };
      return res.status(200).json(newFile);
    } catch (error) {
      return res.status(500).send('Internal server error');
    }
  }

  static async getIndex(req, res) {
    const { user } = req;

    const userId = user.id;
    const parentId = req.query.parentId || 0;
    const page = req.query.page || 0;

    try {
      const files = await dbClient.getPaginatedFilesByParentId(parentId, userId, page);

      // const { _id, ...newFiles } = { id: files._id, ...files };
      return res.status(200).json(files);
    } catch (error) {
      return res.status(500).send('Internal server error');
    }
  }
}

export default FilesController;
