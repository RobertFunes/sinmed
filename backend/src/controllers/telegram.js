const telegram = require('../services/telegram');

function sendTelegramError(res, error) {
  if (error?.code === 'TELEGRAM_NOTIFICATION_FAILED') {
    return res.status(503).json({ ok: false, error: 'TELEGRAM_NOTIFICATION_FAILED' });
  }
  const knownErrors = new Set([
    'TELEGRAM_BOT_TOKEN_INVALID',
    'TELEGRAM_RECIPIENT_REQUIRED',
    'TELEGRAM_BOT_REQUIRED',
    'INVALID_TELEGRAM_PREFERENCES',
    'TELEGRAM_LINK_NOT_FOUND',
    'TELEGRAM_LINK_EXPIRED',
    'TELEGRAM_PRIVATE_CHAT_REQUIRED',
  ]);
  if (knownErrors.has(error?.code)) {
    return res.status(error.status || 400).json({ ok: false, error: error.code });
  }
  console.error('[telegram] Error de configuración');
  return res.status(500).json({ ok: false, error: 'TELEGRAM_SETTINGS_ERROR' });
}

const getTelegramSettings = async (_req, res) => {
  try {
    return res.status(200).json({ ok: true, ...await telegram.getState() });
  } catch (error) {
    return sendTelegramError(res, error);
  }
};

const updateTelegramSettings = async (req, res) => {
  try {
    const state = await telegram.updateSettings({
      token: req.body?.token,
      preferences: req.body?.preferences,
    });
    return res.status(200).json({ ok: true, ...state });
  } catch (error) {
    return sendTelegramError(res, error);
  }
};

const createTelegramLink = async (_req, res) => {
  try {
    return res.status(201).json({ ok: true, ...await telegram.createLink() });
  } catch (error) {
    return sendTelegramError(res, error);
  }
};

const verifyTelegramLink = async (_req, res) => {
  try {
    return res.status(200).json({ ok: true, ...await telegram.verifyLink() });
  } catch (error) {
    return sendTelegramError(res, error);
  }
};

const sendTelegramTest = async (_req, res) => {
  try {
    await telegram.sendTest();
    return res.status(200).json({ ok: true });
  } catch (error) {
    return sendTelegramError(res, error);
  }
};

const deleteTelegramRecipient = async (_req, res) => {
  try {
    return res.status(200).json({ ok: true, ...await telegram.unlinkRecipient() });
  } catch (error) {
    return sendTelegramError(res, error);
  }
};

module.exports = {
  getTelegramSettings,
  updateTelegramSettings,
  createTelegramLink,
  verifyTelegramLink,
  sendTelegramTest,
  deleteTelegramRecipient,
};
