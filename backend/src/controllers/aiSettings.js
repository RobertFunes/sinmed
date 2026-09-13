const aiSettings = require('../services/aiSettings');

function sendAiSettingsError(res, error) {
  if (error?.code === 'INVALID_AI_MODE') {
    return res.status(error.status || 400).json({ ok: false, error: error.code });
  }
  console.error('[ai-settings] Error de configuración');
  return res.status(500).json({ ok: false, error: 'AI_SETTINGS_ERROR' });
}

const getAiSettings = (_req, res) => {
  try {
    return res.status(200).json({ ok: true, ...aiSettings.getState() });
  } catch (error) {
    return sendAiSettingsError(res, error);
  }
};

const updateAiSettings = async (req, res) => {
  try {
    const state = await aiSettings.updateSettings(req.body?.mode);
    return res.status(200).json({ ok: true, ...state });
  } catch (error) {
    return sendAiSettingsError(res, error);
  }
};

module.exports = { getAiSettings, updateAiSettings };
