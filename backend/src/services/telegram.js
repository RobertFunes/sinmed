const crypto = require('crypto');
const axios = require('axios');
const { writeManagedEnv } = require('./settingsStore');
const LINK_TTL_MS = 10 * 60 * 1000;
const TELEGRAM_API_TIMEOUT_MS = 5000;

const PREFERENCE_KEYS = Object.freeze({
  login: 'TELEGRAM_NOTIFY_LOGIN',
  profile_create: 'TELEGRAM_NOTIFY_PROFILE_CREATE',
  profile_update: 'TELEGRAM_NOTIFY_PROFILE_UPDATE',
  profile_delete: 'TELEGRAM_NOTIFY_PROFILE_DELETE',
  appointment_create: 'TELEGRAM_NOTIFY_APPOINTMENT_CREATE',
  appointment_delete: 'TELEGRAM_NOTIFY_APPOINTMENT_DELETE',
});

const MANAGED_KEYS = new Set([
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID',
  'TELEGRAM_CHAT_USERNAME',
  'TELEGRAM_CHAT_DISPLAY_NAME',
  ...Object.values(PREFERENCE_KEYS),
]);

let pendingLink = null;
let updateOffset = null;
let verifyLinkInFlight = null;
let settingsOperationQueue = Promise.resolve();

function enqueueSettingsOperation(operation) {
  const queuedOperation = settingsOperationQueue.then(operation, operation);
  settingsOperationQueue = queuedOperation.catch(() => {});
  return queuedOperation;
}

class TelegramNotificationError extends Error {
  constructor() {
    super('TELEGRAM_NOTIFICATION_FAILED');
    this.code = 'TELEGRAM_NOTIFICATION_FAILED';
  }
}

class TelegramSettingsError extends Error {
  constructor(code, status = 400) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

function asBoolean(value) {
  return value === true || value === 'true' || value === '1';
}

function getStoredSettings() {
  const preferences = {};
  for (const [name, envKey] of Object.entries(PREFERENCE_KEYS)) {
    preferences[name] = asBoolean(process.env[envKey]);
  }

  return {
    token: String(process.env.TELEGRAM_BOT_TOKEN || '').trim(),
    chatId: String(process.env.TELEGRAM_CHAT_ID || '').trim(),
    chatUsername: String(process.env.TELEGRAM_CHAT_USERNAME || '').trim(),
    chatDisplayName: String(process.env.TELEGRAM_CHAT_DISPLAY_NAME || '').trim(),
    preferences,
  };
}

function maskedChatId(chatId) {
  if (!chatId) return null;
  const value = String(chatId);
  if (value.length <= 4) return '••••';
  return `${value.slice(0, 2)}••••${value.slice(-2)}`;
}

async function callTelegram(token, method, payload = {}) {
  if (!token) throw new TelegramNotificationError();
  try {
    const response = await axios.post(`https://api.telegram.org/bot${token}/${method}`, payload, {
      timeout: TELEGRAM_API_TIMEOUT_MS,
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.data?.ok) throw new Error('TELEGRAM_API_ERROR');
    return response.data.result;
  } catch (_) {
    throw new TelegramNotificationError();
  }
}

async function getBotInfo(token = getStoredSettings().token) {
  if (!token) return null;
  try {
    return await callTelegram(token, 'getMe');
  } catch (_) {
    return null;
  }
}

function publicState(botInfo = null) {
  const stored = getStoredSettings();
  return {
    bot: {
      configured: Boolean(stored.token),
      valid: Boolean(botInfo),
      username: botInfo?.username || null,
      name: botInfo?.first_name || null,
    },
    recipient: {
      linked: Boolean(stored.chatId),
      username: stored.chatUsername || null,
      displayName: stored.chatDisplayName || null,
      chatIdMasked: maskedChatId(stored.chatId),
    },
    preferences: stored.preferences,
  };
}

async function getState() {
  const stored = getStoredSettings();
  const botInfo = stored.token ? await getBotInfo(stored.token) : null;
  return publicState(botInfo);
}

function preferencesFromInput(input, current) {
  const next = { ...current };
  if (input == null) return next;
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TelegramSettingsError('INVALID_TELEGRAM_PREFERENCES');
  }
  for (const name of Object.keys(PREFERENCE_KEYS)) {
    if (input[name] !== undefined) {
      if (typeof input[name] !== 'boolean') {
        throw new TelegramSettingsError('INVALID_TELEGRAM_PREFERENCES');
      }
      next[name] = input[name];
    }
  }
  return next;
}

function preferenceUpdates(preferences) {
  return Object.fromEntries(
    Object.entries(PREFERENCE_KEYS).map(([name, envKey]) => [envKey, preferences[name] ? 'true' : 'false']),
  );
}

async function updateSettings({ token, preferences: inputPreferences }) {
  return enqueueSettingsOperation(async () => {
    const current = getStoredSettings();
    let nextToken = current.token;
    let nextPreferences = preferencesFromInput(inputPreferences, current.preferences);
    let nextRecipient = {
      chatId: current.chatId,
      chatUsername: current.chatUsername,
      chatDisplayName: current.chatDisplayName,
    };
    let botInfo = null;

    if (token !== undefined && token !== null && String(token).trim() !== '') {
      nextToken = String(token).trim();
      botInfo = await getBotInfo(nextToken);
      if (!botInfo) throw new TelegramSettingsError('TELEGRAM_BOT_TOKEN_INVALID');
    } else if (nextToken) {
      botInfo = await getBotInfo(nextToken);
    }

    const tokenChanged = nextToken !== current.token;
    if (tokenChanged) {
      nextRecipient = { chatId: '', chatUsername: '', chatDisplayName: '' };
      nextPreferences = Object.fromEntries(Object.keys(PREFERENCE_KEYS).map((name) => [name, false]));
    }

    const wantsNotifications = Object.values(nextPreferences).some(Boolean);
    if (wantsNotifications && (!botInfo || !nextRecipient.chatId)) {
      throw new TelegramSettingsError('TELEGRAM_RECIPIENT_REQUIRED');
    }

    const updates = {
      TELEGRAM_BOT_TOKEN: nextToken,
      TELEGRAM_CHAT_ID: nextRecipient.chatId,
      TELEGRAM_CHAT_USERNAME: nextRecipient.chatUsername,
      TELEGRAM_CHAT_DISPLAY_NAME: nextRecipient.chatDisplayName,
      ...preferenceUpdates(nextPreferences),
    };
    await writeManagedEnv(updates, MANAGED_KEYS);
    if (tokenChanged) {
      pendingLink = null;
      updateOffset = null;
    }
    return publicState(botInfo);
  });
}

function hashLinkToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function createLink() {
  return enqueueSettingsOperation(async () => {
    const stored = getStoredSettings();
    const botInfo = await getBotInfo(stored.token);
    if (!botInfo?.username) throw new TelegramSettingsError('TELEGRAM_BOT_REQUIRED');

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + LINK_TTL_MS;
    pendingLink = { hash: hashLinkToken(token), expiresAt };
    return {
      linkUrl: `https://t.me/${botInfo.username}?start=${token}`,
      expiresAt: new Date(expiresAt).toISOString(),
    };
  });
}

function parseStartToken(text) {
  if (typeof text !== 'string') return null;
  const match = text.trim().match(/^\/start(?:@[A-Za-z0-9_]+)?(?:\s+([^\s]+))?$/i);
  return match?.[1] || null;
}

async function verifyLinkInternal() {
  const link = pendingLink;
  if (!link) throw new TelegramSettingsError('TELEGRAM_LINK_NOT_FOUND', 409);
  if (Date.now() > link.expiresAt) {
    pendingLink = null;
    throw new TelegramSettingsError('TELEGRAM_LINK_EXPIRED', 410);
  }

  const stored = getStoredSettings();
  const updates = await callTelegram(stored.token, 'getUpdates', {
    ...(updateOffset == null ? {} : { offset: updateOffset }),
    timeout: 0,
    allowed_updates: ['message'],
  });
  let highestUpdateId = updateOffset == null ? null : updateOffset - 1;
  let privateChatRequired = false;
  for (const update of Array.isArray(updates) ? updates : []) {
    if (Number.isInteger(update?.update_id)) {
      highestUpdateId = Math.max(highestUpdateId ?? update.update_id, update.update_id);
    }
    const message = update?.message;
    const token = parseStartToken(message?.text);
    if (!token || hashLinkToken(token) !== link.hash) continue;
    if (message?.chat?.type !== 'private') {
      privateChatRequired = true;
      continue;
    }

    if (pendingLink !== link) {
      throw new TelegramSettingsError('TELEGRAM_LINK_NOT_FOUND', 409);
    }

    await writeManagedEnv({
      TELEGRAM_CHAT_ID: String(message.chat.id),
      TELEGRAM_CHAT_USERNAME: message.chat.username || '',
      TELEGRAM_CHAT_DISPLAY_NAME: [message.chat.first_name, message.chat.last_name].filter(Boolean).join(' '),
    }, MANAGED_KEYS);
    if (pendingLink === link) pendingLink = null;
    if (highestUpdateId != null) updateOffset = highestUpdateId + 1;
    return publicState(await getBotInfo(stored.token));
  }
  if (highestUpdateId != null) updateOffset = highestUpdateId + 1;
  if (privateChatRequired) {
    throw new TelegramSettingsError('TELEGRAM_PRIVATE_CHAT_REQUIRED', 400);
  }
  throw new TelegramSettingsError('TELEGRAM_LINK_NOT_FOUND', 409);
}

function verifyLink() {
  if (verifyLinkInFlight) return verifyLinkInFlight;

  const verification = enqueueSettingsOperation(verifyLinkInternal);
  verifyLinkInFlight = verification.finally(() => {
    verifyLinkInFlight = null;
  });
  return verifyLinkInFlight;
}

async function unlinkRecipient() {
  return enqueueSettingsOperation(async () => {
    const preferences = Object.fromEntries(Object.keys(PREFERENCE_KEYS).map((name) => [name, false]));
    await writeManagedEnv({
      TELEGRAM_CHAT_ID: '',
      TELEGRAM_CHAT_USERNAME: '',
      TELEGRAM_CHAT_DISPLAY_NAME: '',
      ...preferenceUpdates(preferences),
    }, MANAGED_KEYS);
    pendingLink = null;
    updateOffset = null;
    return getState();
  });
}

function isNotificationEnabled(event) {
  const stored = getStoredSettings();
  return Boolean(PREFERENCE_KEYS[event] && stored.preferences[event]);
}

function ensureNotificationConfiguration() {
  const stored = getStoredSettings();
  if (!stored.token || !stored.chatId) throw new TelegramNotificationError();
  return stored;
}

async function sendText(text) {
  const stored = ensureNotificationConfiguration();
  await callTelegram(stored.token, 'sendMessage', {
    chat_id: stored.chatId,
    text: String(text),
  });
}

async function notify(event, text) {
  if (!isNotificationEnabled(event)) return;
  await sendText(text);
}

function notifyBestEffort(event, text) {
  return notify(event, text).catch(() => {
    console.error(`[telegram] Falló la notificación de ${event}`);
  });
}

async function sendTest() {
  await sendText(`Prueba de notificaciones SINMED\n${formatMexicoDate()}`);
}

function formatMexicoDate(value = new Date()) {
  return new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Mexico_City',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(value);
}

function profileMessage(action, name, id) {
  return `Perfil: ${action}\nNombre: ${name || 'Sin nombre'}\nID: ${id}\nFecha: ${formatMexicoDate()}`;
}

function appointmentMessage(action, name, id) {
  return `Cita: ${action}\nNombre: ${name || 'Sin nombre'}\nID: ${id}\nFecha: ${formatMexicoDate()}`;
}

function cloneAppointmentsMessage(count, sourceDate, targetDate) {
  return `Citas: alta por clonación\nCantidad: ${count}\nOrigen: ${sourceDate}\nDestino: ${targetDate}\nFecha: ${formatMexicoDate()}`;
}

module.exports = {
  TelegramNotificationError,
  TelegramSettingsError,
  PREFERENCE_KEYS,
  getState,
  updateSettings,
  createLink,
  verifyLink,
  unlinkRecipient,
  sendTest,
  notify,
  notifyBestEffort,
  isNotificationEnabled,
  profileMessage,
  appointmentMessage,
  cloneAppointmentsMessage,
  formatMexicoDate,
};
