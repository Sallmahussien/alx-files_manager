import dbClient from '../utils/db';
import crypto from 'crypto';

class UsersController {
  static async postNew(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    if (!email) {
      return res.status(400).send('Missing email');
    }
    if (!password) {
      return res.status(400).send('Missing password');
    }

    try {
      if (!await dbClient.getUserByEmail(email)) {
        return res.status(400).send('Already exist');
      }

      const hashedPassword = crypto.createHash('sha1');
      hashedPassword.update(password);

      const user = await dbClient.addUser({ email, password: hashedPassword });
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (err) {
      return res.status(500).send('Internal server error');
    }
  }
}

export default UsersController;
