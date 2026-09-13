const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'sinmed-ai-settings-'));
const envFile = path.join(tempDirectory, '.env');
fs.writeFileSync(envFile, 'GEMINI_API_KEY=test\nOTHER_SETTING=keep\nGEMINI_MODE=normal\n');

process.env.SINMED_ENV_FILE = envFile;
process.env.GEMINI_MODE = 'normal';

const aiSettings = require('../src/services/aiSettings');

test.after(() => {
  delete process.env.SINMED_ENV_FILE;
  delete process.env.GEMINI_MODE;
  fs.rmSync(tempDirectory, { recursive: true, force: true });
});

test('uses Normal as the safe fallback for an unknown mode', () => {
  process.env.GEMINI_MODE = 'unknown';
  assert.deepEqual(aiSettings.getState(), { mode: 'normal', usageMultiplier: 1 });
  assert.deepEqual(aiSettings.getModelConfig(), {
    mode: 'normal',
    usageMultiplier: 1,
    model: 'gemini-2.5-flash-lite',
  });
});

test('maps each mode to its model and multiplier', () => {
  assert.deepEqual(aiSettings.getModelConfig('normal'), {
    mode: 'normal',
    usageMultiplier: 1,
    model: 'gemini-2.5-flash-lite',
  });
  assert.deepEqual(aiSettings.getModelConfig('augmented'), {
    mode: 'augmented',
    usageMultiplier: 1.25,
    model: 'gemini-3.1-flash-lite',
  });
});

test('persists a valid mode without changing unrelated environment values', async () => {
  const state = await aiSettings.updateSettings('augmented');
  const content = fs.readFileSync(envFile, 'utf8');

  assert.deepEqual(state, { mode: 'augmented', usageMultiplier: 1.25 });
  assert.match(content, /GEMINI_MODE=augmented/);
  assert.match(content, /OTHER_SETTING=keep/);
  assert.equal(process.env.GEMINI_MODE, 'augmented');
});

test('rejects invalid modes', async () => {
  await assert.rejects(
    () => aiSettings.updateSettings('turbo'),
    (error) => error.code === 'INVALID_AI_MODE' && error.status === 400,
  );
});
