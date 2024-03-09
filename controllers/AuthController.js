import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    try {
      const { user } = req;
      const userId = user._id.toString();

      const token = uuidv4();
      const redisKey = `auth_${token}`;
      const dayDuration = 3600 * 24;

      await redisClient.set(redisKey, userId, dayDuration);

      return res.status(200).json({ token });
    } catch (err) {
      console.error(err);
      return res.status(500).send('Internal server error');
    }
  }

  static async getDisconnect(req, res) {
    try {
      const key = req.redisKey;
      await redisClient.del(key);
      return res.status(204).send('');
    } catch (err) {
      console.error(err);
      return res.status(500).send('Internal server error');
    }
  }
}

export default AuthController;
