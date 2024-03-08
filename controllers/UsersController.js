import crypto from 'crypto';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      if (await dbClient.getUserByEmail(email)) {
        return res.status(400).json({ error: 'Already exist' });
      }

      const hashedPassword = crypto.createHash('sha1');
      hashedPassword.update(password);

      const user = await dbClient.addUser({ email, password: hashedPassword });

      const { insertedId } = user;

      return res.status(201).json({ id: insertedId, email });
    } catch (err) {
      return res.status(500).send('Internal server error');
    }
  }
}

export default UsersController;