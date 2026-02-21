const { getAccessTtlSeconds, getRefreshTtlSeconds } = require('./jwt');

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

function refreshCookieOptions() {
  return {
    ...baseCookieOptions(),
    path: '/auth/refresh',
    maxAge: getRefreshTtlSeconds() * 1000,
  };
}

function setAuthCookies(res, accessToken, refreshToken) {
  return res
    .cookie('access_token', accessToken, accessCookieOptions())
    .cookie('refresh_token', refreshToken, refreshCookieOptions());
}

function setAccessCookie(res, accessToken) {
  return res.cookie('access_token', accessToken, accessCookieOptions());
}

function clearAuthCookies(res) {
  return res
    .clearCookie('access_token', { ...baseCookieOptions(), path: '/' })
    .clearCookie('refresh_token', { ...baseCookieOptions(), path: '/auth/refresh' });
}

module.exports = {
  setAuthCookies,
  setAccessCookie,
  clearAuthCookies,
};
