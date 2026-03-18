const jwt = require('jsonwebtoken');

const ACCESS_DEFAULT_TTL_SECONDS = 90 * 24 * 60 * 60;
const ALGORITHM = 'HS256';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET_MISSING');
  }
  return secret;
}

function getAccessTtlSeconds() {
  return ACCESS_DEFAULT_TTL_SECONDS;
}

function signAccessToken(sub) {
  return jwt.sign(
    { typ: 'access', sub: sub || 'admin' },
    getSecret(),
    {
      algorithm: ALGORITHM,
      expiresIn: getAccessTtlSeconds(),
    },
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, getSecret(), { algorithms: [ALGORITHM] });
}

module.exports = {
  getAccessTtlSeconds,
  signAccessToken,
  verifyAccessToken,
};
