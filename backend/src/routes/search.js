const express = require('express');
const router = express.Router();
const { search } = require('../controllers/search');
const { checkAuth } = require('../controllers/user');

// Simple in-memory rate limiter por IP
const limiter = (() => {
  const hits = new Map();
  const WINDOW = 60 * 1000; // 1 min
  const MAX = 30; // 30 req/min
  return (req, res, next) => {
    const now = Date.now();
    const ip = req.ip || req.connection.remoteAddress;
    const entry = hits.get(ip) || { count: 0, ts: now };
    if (now - entry.ts > WINDOW) {
      entry.count = 1;
      entry.ts = now;
    } else {
      entry.count++;
    }
    hits.set(ip, entry);
    if (entry.count > MAX) {
      return res.status(429).json({ ok: false, error: 'Too many requests' });
    }
    next();
  };
})();

router.get('/search', checkAuth, limiter, search);

module.exports = router;
