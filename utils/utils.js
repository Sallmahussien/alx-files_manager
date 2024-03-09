import sha1 from 'sha1';
import redisClient from './redis';

const hashPwd = (password) => sha1(password);

const getUserCredentials = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return null;
  }

  const base64Credentials = authHeader.split(' ')[1];
  const decodedToken = Buffer.from(base64Credentials, 'base64').toString('ascii');
  if (!decodedToken) {
    return null;
  }

  const [email, password] = decodedToken.split(':');
  if (!email || !password) {
    return null;
  }

  return { email, password };
};

const getUserId = async (tokenFromHeaders) => {
  if (!tokenFromHeaders) {
    return null;
  }

  const redisKey = `auth_${tokenFromHeaders}`;
  const userId = await redisClient.get(redisKey);
  return userId;
};

module.exports = {
  hashPwd,
  getUserCredentials,
  getUserId,
};
