const jwt = require('jsonwebtoken');

const ACCESS_DEFAULT_TTL_SECONDS = 3600;
const REFRESH_DEFAULT_TTL_SECONDS = 2592000;
const ALGORITHM = 'HS256';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET_MISSING');
  }
  return secret;
}

function parseTtl(name, fallback) {
  const raw = process.env[name];
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.floor(n);
}

function getAccessTtlSeconds() {
  return parseTtl('ACCESS_TOKEN_TTL_SECONDS', ACCESS_DEFAULT_TTL_SECONDS);
}

function getRefreshTtlSeconds() {
  return parseTtl('REFRESH_TOKEN_TTL_SECONDS', REFRESH_DEFAULT_TTL_SECONDS);
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

function signRefreshToken(sub) {
  return jwt.sign(
    { typ: 'refresh', sub: sub || 'admin' },
    getSecret(),
    {
      algorithm: ALGORITHM,
      expiresIn: getRefreshTtlSeconds(),
    },
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, getSecret(), { algorithms: [ALGORITHM] });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, getSecret(), { algorithms: [ALGORITHM] });
}

module.exports = {
  getAccessTtlSeconds,
  getRefreshTtlSeconds,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
