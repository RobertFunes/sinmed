// routes/whats.js 
const express = require('express');
const router = express.Router();
const { requestQr, getState,sendMessage ,sendImage} = require('../whats');
const { checkAuth } = require('../controllers/user');


router.get('/status',checkAuth, (req, res) => {
  const snap = getState();
  return res.json({
    ok: true,
    state: snap.state,      // 'STOPPED' | 'BOOTING' | 'QR_READY' | 'READY' | 'FAILED'
    hasClient: snap.hasClient,
    isAuth: snap.isAuth,
    qr: snap.qr,            // string del QR solo si state === 'QR_READY'
    startedAt: snap.startedAt
  });
});

router.get('/qr',checkAuth, async (req, res) => {
  const wantsStream = (req.get('Accept') || '').includes('text/event-stream');

  if (!wantsStream) {
    try {
      const snap = await requestQr(); // kick or reuse
      return res.json({
        ok: true,
        state: snap.state,
        qr: snap.qr,
        startedAt: snap.startedAt,
        isAuth: snap.isAuth,
      });
    } catch (err) {
      return res.status(500).json({
        ok: false,
        error: err?.message || 'requestQr failed',
        state: getState().state,
      });
    }
  }

  // SSE mode: only open if QR exists
  const snap = getState();
  if (!(snap && snap.hasClient && snap.state === 'QR_READY' && snap.qr)) {
    return res.status(409).json({
      ok: false,
      notReady: true,
      state: snap?.state || 'UNKNOWN',
      hasClient: !!snap?.hasClient,
    });
  }

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-store',
    Connection: 'keep-alive',
  });
  res.flushHeaders();

  const tickMs = 1000;
  const hbMs = 15000;
  let lastQr = snap.qr;
  let hbTimer = null;

  const send = (payload) => res.write(`data: ${JSON.stringify(payload)}\n\n`);

  // initial payload
  send({
    v: 1,
    state: snap.state,
    qr: snap.qr,
    startedAt: snap.startedAt,
    isAuth: snap.isAuth,
  });

  const heartbeat = () => {
    res.write(':hb\n\n');
    hbTimer = setTimeout(heartbeat, hbMs);
  };

  const interval = setInterval(() => {
    const cur = getState();

    if (cur.qr && cur.qr !== lastQr && cur.state === 'QR_READY') {
      lastQr = cur.qr;
      send({
        v: 1,
        state: cur.state,
        qr: cur.qr,
        startedAt: cur.startedAt,
        isAuth: cur.isAuth,
      });
    }

    if (!cur.hasClient || cur.state !== 'QR_READY') {
      clearInterval(interval);
      clearTimeout(hbTimer);
      res.end();
    }
  }, tickMs);

  heartbeat();

  req.on('close', () => {
    clearInterval(interval);
    clearTimeout(hbTimer);
  });
});

router.post('/send',checkAuth, async (req, res) => {
  let { number, message } = req.body || {};

  if (!number) {
    return res.status(400).json({ ok: false, error: 'Falta parámetro: number' });
  }

  try {
    const result = await sendMessage(number, message);

    if (result?.ok) {
      return res.status(200).json(result);
    }

    // Mapea errores funcionales a códigos HTTP no-2xx
    const code = result?.error || 'SEND_FAILED';
    const statusMap = {
      BUSY: 409,                      // conflicto: ya hay sesión en curso
      NEEDS_AUTH: 401,                // no autenticado
      NUMERO_NO_REGISTRADO: 422,      // entidad no procesable (número no válido en WA)
      NUMERO_INVALIDO: 422,           // validación: no tiene 10 dígitos nacionales
      DISCONNECTED: 503,              // servicio no disponible (desconectado)
      TIMEOUT: 504,                   // timeout de backend
      SEND_FAILED: 502                // fallo de envío
    };
    const status = statusMap[code] ?? 500;
    return res.status(status).json({ ok: false, error: code });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err?.message || 'sendMessage failed',
      state: getState().state
    });
  }
});
router.post('/send-image', checkAuth,async (req, res) => {
  let { number, imageB64 } = req.body || {};

  if (!number) {
    return res.status(400).json({ ok: false, error: 'Falta parámetro: number' });
  }

  try {
    const result = await sendImage(number, imageB64);

    if (result?.ok) {
      return res.status(200).json(result);
    }

    const code = result?.error || 'SEND_FAILED';
    const statusMap = {
      BUSY: 409,
      NEEDS_AUTH: 401,
      NUMERO_NO_REGISTRADO: 422,
      NUMERO_INVALIDO: 422,
      DISCONNECTED: 503,
      TIMEOUT: 504,
      SEND_FAILED: 502
    };
    const status = statusMap[code] ?? 500;
    return res.status(status).json({ ok: false, error: code });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err?.message || 'sendImage failed',
      state: getState().state
    });
  }
});

module.exports = router;
