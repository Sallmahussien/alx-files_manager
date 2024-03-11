import fs from 'fs';
import Bull from 'bull';
import imageThumbnail from 'image-thumbnail';
import { promisify } from 'util';
import path from 'path';
import dbClient from './utils/db';

const fileImageQueue = new Bull('fileQueue');

fileImageQueue.process(async (job) => {
  console.log('processing');
  const { fileId, userId } = job.data;
  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  try {
    const file = await dbClient.getFileByIdAndUserId(fileId, userId);
    if (!file) {
      throw new Error('File not found');
    }

    const widths = [500, 200, 100];
    const readFileAsync = promisify(fs.readFile);
    const writeFileAsync = promisify(fs.writeFile);

    const promises = widths.map(async (width) => {
      const options = { width };
      const filePath = file.localPath;
      const newFilePath = `${path.dirname(filePath)}/${file.name}`;

      const data = await readFileAsync(filePath);
      await writeFileAsync(newFilePath, data);

      console.log(filePath);
      const thumbnail = await imageThumbnail(newFilePath, options);
      const thumbnailPath = newFilePath.replace('.', `_${width}.`);
      console.log(thumbnailPath);
      await writeFileAsync(thumbnailPath, thumbnail);
    });

    await Promise.all(promises);
  } catch (err) {
    console.error(err);
  }
});
