const { clearAuthCookies } = require('../helpers/authCookies');

function refresh(req, res) {
  clearAuthCookies(res);
  return res.status(410).json({ ok: false, error: 'SESSION_REFRESH_DISABLED' });
}

module.exports = { refresh };
