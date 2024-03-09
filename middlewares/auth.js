/* eslint-disable import/named */
import { getUserCredentials, hashPwd, getUserId } from '../utils/utils';
import dbClient from '../utils/db';

const basicAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const userCredentials = getUserCredentials(authHeader);

  if (!userCredentials) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { email, password } = userCredentials;

  try {
    const user = await dbClient.getUserByEmail(email);
    if (!user || user.password !== hashPwd(password)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = user;
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error');
  }

  return next();
};

const xTokenAuth = async (req, res, next) => {
  const tokenFromHeaders = req.headers['x-token'];

  try {
    const userId = await getUserId(tokenFromHeaders);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await dbClient.getUserById(userId);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.redisKey = `auth_${tokenFromHeaders}`;
    req.user = user;
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error');
  }

  return next();
};

module.exports = {
  basicAuth,
  xTokenAuth,
};
