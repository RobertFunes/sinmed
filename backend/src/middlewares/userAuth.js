const { verifyAccessToken } = require('../helpers/jwt');

function userAuth(req, res, next) {
  try {
    const token = req.cookies?.access_token;
    if (!token) {
      return res.status(401).json({ ok: false, error: 'No autenticado' });
    }

    const payload = verifyAccessToken(token);
    if (!payload || payload.typ !== 'access') {
      return res.status(401).json({ ok: false, error: 'No autenticado' });
    }

    req.user = { sub: payload.sub };
    return next();
  } catch (err) {
    if (err?.message === 'JWT_SECRET_MISSING') {
      return res.status(500).json({ ok: false, error: 'JWT_SECRET_MISSING' });
    }
    return res.status(401).json({ ok: false, error: 'No autenticado' });
  }
}

module.exports = { userAuth };
