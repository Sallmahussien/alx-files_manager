import fs from 'fs';
import Bull from 'bull';
import dbClient from './utils/db';
import imageThumbnail from 'image-thumbnail';

const fileImageQueue = new Bull('fileQueue');

fileImageQueue.process(async (job) => {
  console.log('processing')
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
    // for (const width of widths) {
    //   const options = { width };
    //   const filePath = file.localPath;
    //   const thumbnail = await imageThumbnail(filePath, options);

    //   fs.writeFile(filePath.replace('.', `_${width}.`), thumbnail, (err) => {
    //     if (err) throw err;
    //   });
    // }
    const promises = widths.map(async (width) => {
      const options = { width };
      const filePath = file.localPath;
      console.log(filePath);
      const thumbnail = await imageThumbnail(filePath, options);
      const thumbnailPath = filePath.replace('.', `_${width}.`);
      console.log(thumbnailPath)
      await fs.writeFile(thumbnailPath, thumbnail);
    });

    await Promise.all(promises);
  } catch (err) {
    console.error(err);
  }

});