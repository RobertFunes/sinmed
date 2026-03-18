const { getAccessTtlSeconds } = require('./jwt');

function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };
}

function accessCookieOptions() {
  return {
    ...baseCookieOptions(),
    path: '/',
    maxAge: getAccessTtlSeconds() * 1000,
  };
}

function setAccessCookie(res, accessToken) {
  return res.cookie('access_token', accessToken, accessCookieOptions());
}

function clearAuthCookies(res) {
  return res.clearCookie('access_token', { ...baseCookieOptions(), path: '/' });
}

module.exports = {
  setAccessCookie,
  clearAuthCookies,
};
