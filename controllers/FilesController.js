import dbClient from '../utils/db';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

class FilesController {
  static async postUpload(req, res) {
    const { user } = req;

    const userId = user.id;
    const name = req.body.name;
    const type = req.body.type;
    const parentId = req.body.parentId || 0;
    const isPublic = req.body.isPublic || false;
    const data = req.body.data;
    const localPath = process.env.FOLDER_PATH || '/tmp/files_manager/';

    if (!name) {
      res.status(400).json({ error: "Missing name" });
    }
    if (!type) {
      res.status(400).json({ error: "Missing type" });
    }
    if (!data && type !== 'folder') {
      res.status(400).json({ error: "Missing data" });
    }

    try {
      if (parentId) {
        const file = await dbClient.getFileByParentId(parentId);

        if (!file) {
          res.status(400).json({ error: "Parent not found" });
        }
        if (file.type !== 'folder') {
          res.status(400).json({ error: "Parent is not a folder" });
        }
      }

      const newFile = {
        userId,
        name,
        type,
        isPublic,
        parentId
      }

      if (type !== 'folder') {
        newFile.localPath = localPath;
        const fileName = uuidv4();
        const filePath = !localPath.endsWith('/') ? `${localPath}/${fileName}`: `${localPath}${fileName}`;
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
      console.error(error);
      return res.status(500).send('Internal server error');
    }
  }
}

export default FilesController;
