import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    const base64Credentials = authHeader.split(' ')[1];
    const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const email = decodedCredentials.split(':')[0];

    try {
      const user = await dbClient.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = uuidv4();

      const key = `auth_${token}`;
      const dayDuration = 3600 * 24;
      redisClient.set(key, user._id.toString(), dayDuration);

      return res.status(200).json({ token });
    } catch (err) {
      console.log(err);
      return res.status(500).send('Internal server error');
    }
  }

  static async getDisconnect(req, res) {
    const tokenFromHeaders = req.headers['x-token'];
    const key = `auth_${tokenFromHeaders}`;
    const userId = redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      await redisClient.del(key);
      return res.status(204).send('');
    } catch (err) {
      return res.status(500).send('Internal server error');
    }
  }
}

export default AuthController;
