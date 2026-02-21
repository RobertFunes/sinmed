const { verifyRefreshToken, signAccessToken } = require('../helpers/jwt');
const { setAccessCookie, clearAuthCookies } = require('../helpers/authCookies');

function refresh(req, res) {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ ok: false, error: 'No autenticado' });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload || payload.typ !== 'refresh') {
      clearAuthCookies(res);
      return res.status(401).json({ ok: false, error: 'No autenticado' });
    }

    const sub = payload.sub || 'admin';
    const newAccess = signAccessToken(sub);
    setAccessCookie(res, newAccess);
    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err?.message === 'JWT_SECRET_MISSING') {
      return res.status(500).json({ ok: false, error: 'JWT_SECRET_MISSING' });
    }
    clearAuthCookies(res);
    return res.status(401).json({ ok: false, error: 'No autenticado' });
  }
}

module.exports = { refresh };
