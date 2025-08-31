//whats.js 

const { Client, LocalAuth } = require('whatsapp-web.js');

let client = null;
let status = 'STOPPED';   // BOOTING | QR_READY | READY | STOPPED | FAILED
let lastQr = null;
let startingUp = false;
let ttlTimer = null;
let bootWatchdog = null; // ⛑️ corta BOOTING zombi si no llega 'qr' ni 'ready'
let startedAt = null;
let hadReady = false;

// Normaliza números de México a formato canónico: 521 + [10 dígitos]
function normalizeMxNumber(input) {
  const onlyDigits = String(input || '').replace(/\D/g, '');
  if (!onlyDigits) return null;
  const national = onlyDigits.slice(-10);
  if (national.length !== 10) return null; // requiere exactamente 10 dígitos nacionales
  const canonical = `521${national}`;
  return canonical.length === 13 ? canonical : null;
}


function setStatus(next) {
  status = next;
}

function clearTimers() {
  if (ttlTimer) { clearTimeout(ttlTimer); ttlTimer = null; }
  if (bootWatchdog) { clearTimeout(bootWatchdog); bootWatchdog = null; } 

}

function armTtlOnce() {
  if (ttlTimer) return; // single hard window
  ttlTimer = setTimeout(() => {
    setStatus('STOPPED');
    shutdown().catch(() => {});
  }, 5 * 60 * 1000); // 5-minute QR window
}
function armBootWatchdog(ms = 90 * 1000) { // 90 s de gracia para BOOTING
  if (bootWatchdog) { clearTimeout(bootWatchdog); bootWatchdog = null; }
  bootWatchdog = setTimeout(() => {
    setStatus('FAILED');     // marcamos fallo por arranque colgado
    shutdown().catch(() => {});
  }, ms);
}

async function shutdown() {
  clearTimers();
  startingUp = false;
  lastQr = null;
  startedAt = null;
  try {
    if (client) {
      client.removeAllListeners?.();
      await client.destroy();
    }
  } catch (_) {
    // ignore
  } finally {
    client = null;
    if (status !== 'FAILED') setStatus('STOPPED');
  }
  return { stopped: true, state: status };
}

async function requestQr() {
  if (status === 'BOOTING' || status === 'QR_READY' || status === 'READY') {
    return getState();
  }
  if (startingUp) {
    return getState();
  }

  startingUp = true;
  setStatus('BOOTING');
  startedAt = new Date().toTimeString().slice(0, 5);
  armTtlOnce();
  armBootWatchdog(); // ⏱️ corta BOOTING si WA no entrega QR a tiempo
  client = new Client({
    authStrategy: new LocalAuth({ clientId: 'default' }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    },
    takeoverOnConflict: true,
    takeoverTimeoutMs: 20000,
  });

  client.on('qr', qr => {
    hadReady = false;
    lastQr = qr;
    if (status !== 'QR_READY') setStatus('QR_READY');
    if (bootWatchdog) { clearTimeout(bootWatchdog); bootWatchdog = null; } 
  });

  client.on('ready', () => {                            // CHANGED: verificación corta
    hadReady = true;
    setStatus('READY');
    if (bootWatchdog) { clearTimeout(bootWatchdog); bootWatchdog = null; }
    shutdown().catch(() => {});
    
});

  client.on('disconnected', () => {
    setStatus('FAILED');
    console.error('WhatsApp authentication failed');
    shutdown().catch(() => {});
  });

  client.on('auth_failure', () => {
    setStatus('FAILED');
    console.error('WhatsApp authentication failed');
    shutdown().catch(() => {});
  });

  try {
    await client.initialize();
  } catch (err) {
    setStatus('FAILED');
    console.error('Error initializing WhatsApp client:', err);
    await shutdown();
    throw err;
  } finally {
    startingUp = false;
  }

  return getState();
}

function getState() {
  return {
    state: status,
    hasClient: !!client,
    isAuth: hadReady,
    qr: status === 'QR_READY' ? lastQr : null,
    startedAt,
  };
}
async function sendMessage(number, message) {
  // Anti-colisión + preauth simple
  if (startingUp || client) {
    return { ok: false, error: 'BUSY' };
  }
  const snap = getState();
  if (snap && snap.isAuth === false) {
    return { ok: false, error: 'NEEDS_AUTH' };
  }

  startingUp = true;
  setStatus('BOOTING');
  startedAt = new Date().toTimeString().slice(0, 5);
  armBootWatchdog(); // watchdog único

  client = new Client({
    authStrategy: new LocalAuth({ clientId: 'default' }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    },
    takeoverOnConflict: true,
    takeoverTimeoutMs: 20000,
  });
  
  let didSend = false;
  let bootDoneResolve, bootDoneReject;
  const bootDone = new Promise((resolve, reject) => {
    bootDoneResolve = resolve;
    bootDoneReject = reject;

    client.on('qr', qr => {
      hadReady = false;
      lastQr = qr;
      if (status !== 'QR_READY') setStatus('QR_READY');
      if (bootWatchdog) { clearTimeout(bootWatchdog); bootWatchdog = null; }
      reject(new Error('NEEDS_AUTH'));
    });

    client.on('ready', () => {
      hadReady = true;
      setStatus('READY');
      if (bootWatchdog) { clearTimeout(bootWatchdog); bootWatchdog = null; }
      resolve();
    });

    client.on('disconnected', () => {
      setStatus('FAILED');
      reject(new Error('DISCONNECTED'));
    });

    client.on('auth_failure', () => {
      setStatus('FAILED');
      reject(new Error('NEEDS_AUTH'));
    });
  });
  try {
    await client.initialize();
    await bootDone; // READY o fallo

    const to = normalizeMxNumber(number);
    if (!to) {
      return { ok: false, error: 'NUMERO_INVALIDO' };
    }
    console.log(`Número normalizado: ${to}`);
    const numberId = await client.getNumberId(to);
    if (!numberId) {
      return { ok: false, error: 'NUMERO_NO_REGISTRADO' };
    }

    const msg = await client.sendMessage(numberId._serialized, message);
    didSend = true;

    return {
      ok: true,
      id: msg?.id?._serialized || null,
      to: numberId._serialized,
      timestamp: msg?.timestamp || null,
    };
  } catch (err) {
    const code = err?.message || 'SEND_FAILED';
    if (code === 'NEEDS_AUTH') {
      return { ok: false, error: 'NEEDS_AUTH' };
    }
    if (code === 'DISCONNECTED') {
      return { ok: false, error: 'DISCONNECTED' };
    }
    if (code === 'TIMEOUT') {
      return { ok: false, error: 'TIMEOUT' };
    }
    return { ok: false, error: 'SEND_FAILED' };
  } finally {
    startingUp = false;
    if (didSend) {               // 👈 pequeña ventana para que se vacíe el socket
      await new Promise(r => setTimeout(r, 5000));
    }
    await shutdown().catch(() => {});
  }
}
async function sendImage(number, imageB64) {
  // Anti-colisión + preauth simple
  if (startingUp || client) {
    return { ok: false, error: 'BUSY' };
  }
  const snap = getState();
  if (snap && snap.isAuth === false) {
    return { ok: false, error: 'NEEDS_AUTH' };
  }

  // Parseo directo del data URL: "data:image/png;base64,AAAA..."
  const m = String(imageB64 || '').match(/^data:([^;]+);base64,(.+)$/);
  if (!m) {
    return { ok: false, error: 'SEND_FAILED' };
  }
  const mime = m[1];
  const b64  = m[2];

  startingUp = true;
  setStatus('BOOTING');
  startedAt = new Date().toTimeString().slice(0, 5);
  armBootWatchdog(); // watchdog único

  client = new Client({
    authStrategy: new LocalAuth({ clientId: 'default' }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    },
    takeoverOnConflict: true,
    takeoverTimeoutMs: 20000,
  });

  let didSend = false;

  // Espera de arranque estilo QR (eventos mínimos)
  const bootDone = new Promise((resolve, reject) => {
    client.on('qr', qr => {
      hadReady = false;
      lastQr = qr;
      if (status !== 'QR_READY') setStatus('QR_READY');
      if (bootWatchdog) { clearTimeout(bootWatchdog); bootWatchdog = null; }
      reject(new Error('NEEDS_AUTH'));
    });

    client.on('ready', () => {
      hadReady = true;
      setStatus('READY');
      if (bootWatchdog) { clearTimeout(bootWatchdog); bootWatchdog = null; }
      resolve();
    });

    client.on('disconnected', () => {
      setStatus('FAILED');
      reject(new Error('DISCONNECTED'));
    });

    client.on('auth_failure', () => {
      setStatus('FAILED');
      reject(new Error('NEEDS_AUTH'));
    });
  });

  try {
    await client.initialize();
    await bootDone; // READY o fallo

    const to = normalizeMxNumber(number);
    if (!to) {
      return { ok: false, error: 'NUMERO_INVALIDO' };
    }
    console.log(`Número normalizado: ${to}`);
    const numberId = await client.getNumberId(to);
    if (!numberId) {
      return { ok: false, error: 'NUMERO_NO_REGISTRADO' };
    }

    // Crear media desde base64 sin guardar a disco
    const { MessageMedia } = require('whatsapp-web.js');
    const filename = `image.${(mime.split('/')[1] || 'png').toLowerCase()}`;
    const media = new MessageMedia(mime, b64, filename);

    const msg = await client.sendMessage(numberId._serialized, media);
    didSend = true;

    return {
      ok: true,
      id: msg?.id?._serialized || null,
      to: numberId._serialized,
      timestamp: msg?.timestamp || null,
    };
  } catch (err) {
    const code = err?.message || 'SEND_FAILED';
    if (code === 'NEEDS_AUTH') return { ok: false, error: 'NEEDS_AUTH' };
    if (code === 'DISCONNECTED') return { ok: false, error: 'DISCONNECTED' };
    if (code === 'TIMEOUT') return { ok: false, error: 'TIMEOUT' };
    return { ok: false, error: 'SEND_FAILED' };
  } finally {
    startingUp = false;
    if (didSend) {
      await new Promise(r => setTimeout(r, 5000)); // pequeña gracia para vaciar el envío
    }
    await shutdown().catch(() => {});
  }
}

module.exports = {
  requestQr,
  getState,
  sendMessage,
  sendImage,
};
