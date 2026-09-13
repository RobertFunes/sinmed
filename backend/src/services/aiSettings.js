const { writeManagedEnv } = require('./settingsStore');

const AI_MODE_ENV_KEY = 'GEMINI_MODE';
const AI_MANAGED_KEYS = new Set([AI_MODE_ENV_KEY]);

const AI_MODES = Object.freeze({
  normal: Object.freeze({
    model: 'gemini-2.5-flash-lite',
    usageMultiplier: 1,
  }),
  augmented: Object.freeze({
    model: 'gemini-3.1-flash-lite',
    usageMultiplier: 1.25,
  }),
});

class AiSettingsError extends Error {
  constructor(code, status = 400) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

function isValidMode(mode) {
  return typeof mode === 'string'
    && Object.prototype.hasOwnProperty.call(AI_MODES, mode);
}

function getMode() {
  const configured = String(process.env[AI_MODE_ENV_KEY] || '').trim().toLowerCase();
  return isValidMode(configured) ? configured : 'normal';
}

function getState(mode = getMode()) {
  const safeMode = isValidMode(mode) ? mode : 'normal';
  return {
    mode: safeMode,
    usageMultiplier: AI_MODES[safeMode].usageMultiplier,
  };
}

function getModelConfig(mode = getMode()) {
  const safeMode = isValidMode(mode) ? mode : 'normal';
  return {
    ...getState(safeMode),
    model: AI_MODES[safeMode].model,
  };
}

async function updateSettings(mode) {
  if (!isValidMode(mode)) {
    throw new AiSettingsError('INVALID_AI_MODE');
  }
  await writeManagedEnv({ [AI_MODE_ENV_KEY]: mode }, AI_MANAGED_KEYS);
  return getState(mode);
}

module.exports = {
  AI_MODES,
  AiSettingsError,
  getMode,
  getState,
  getModelConfig,
  updateSettings,
};
