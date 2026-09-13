const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const axios = require('axios');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sinmed-ia-route-'));
const usageFile = path.join(tempDir, 'ia-usage.json');
const currentMonth = new Date().toISOString().slice(0, 7);
const routePath = require.resolve('../src/routes/ia');
const limiterPath = require.resolve('../src/utils/iaLimiter');
const aiSettingsPath = require.resolve('../src/services/aiSettings');
const originalPost = axios.post;
const originalMode = process.env.GEMINI_MODE;
const originalUsageFile = process.env.SINMED_IA_USAGE_FILE;

let postImplementation = async () => ({
  data: {
    candidates: [{ content: { parts: [{ text: 'respuesta de prueba' }] } }],
  },
});

axios.post = (...args) => postImplementation(...args);

function loadHandler(used, mode) {
  process.env.SINMED_IA_USAGE_FILE = usageFile;
  process.env.GEMINI_MODE = mode;
  fs.writeFileSync(usageFile, JSON.stringify({
    month: currentMonth,
    gemini: { used, limit: 400 },
  }));

  delete require.cache[routePath];
  delete require.cache[limiterPath];
  delete require.cache[aiSettingsPath];

  const router = require(routePath);
  const route = router.stack.find((layer) => layer.route?.path === '/gemini');
  return route.route.stack.at(-1).handle;
}

function responseRecorder() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };
}

test.after(() => {
  axios.post = originalPost;
  if (originalMode === undefined) delete process.env.GEMINI_MODE;
  else process.env.GEMINI_MODE = originalMode;
  if (originalUsageFile === undefined) delete process.env.SINMED_IA_USAGE_FILE;
  else process.env.SINMED_IA_USAGE_FILE = originalUsageFile;
  fs.rmSync(tempDir, { recursive: true, force: true });
});

test.afterEach(() => {
  postImplementation = async () => ({
    data: {
      candidates: [{ content: { parts: [{ text: 'respuesta de prueba' }] } }],
    },
  });
});

test('resuelve los modelos en backend y aplica el multiplicador de cada modo', async () => {
  const calls = [];
  postImplementation = async (url) => {
    calls.push(url);
    return {
      data: {
        candidates: [{ content: { parts: [{ text: 'respuesta de prueba' }] } }],
      },
    };
  };

  let handler = loadHandler(0, 'normal');
  let res = responseRecorder();
  await handler({ body: { prompt: 'normal', model: 'gemini-3.1-flash-lite' } }, res);

  assert.equal(res.statusCode, 200);
  assert.match(calls[0], /models\/gemini-2\.5-flash-lite:generateContent/);
  assert.equal(res.payload.mode, 'normal');
  assert.equal(res.payload.usageMultiplier, 1);
  assert.equal(res.payload.gemini.used, 1);

  handler = loadHandler(1, 'augmented');
  res = responseRecorder();
  await handler({ body: { prompt: 'augmented', model: 'gemini-2.5-flash-lite' } }, res);

  assert.equal(res.statusCode, 200);
  assert.match(calls[1], /models\/gemini-3\.1-flash-lite:generateContent/);
  assert.equal(res.payload.mode, 'augmented');
  assert.equal(res.payload.usageMultiplier, 1.25);
  assert.equal(res.payload.gemini.used, 2.25);
});

test('rechaza una solicitud que excede la cuota sin llamar a Google', async () => {
  let googleCalls = 0;
  postImplementation = async () => {
    googleCalls += 1;
    return { data: {} };
  };

  const handler = loadHandler(399, 'augmented');
  const res = responseRecorder();
  await handler({ body: { prompt: 'límite' } }, res);

  assert.equal(res.statusCode, 429);
  assert.equal(googleCalls, 0);
  assert.equal(res.payload.mode, 'augmented');
  assert.equal(res.payload.usageMultiplier, 1.25);
  assert.equal(res.payload.gemini.used, 399);
});

test('no consume cuota cuando Google responde con error', async () => {
  postImplementation = async () => {
    throw new Error('GOOGLE_ERROR');
  };

  const handler = loadHandler(0, 'normal');
  const res = responseRecorder();
  await handler({ body: { prompt: 'error' } }, res);

  assert.equal(res.statusCode, 500);
  assert.equal(res.payload.error, 'No se pudo generar la respuesta con IA 🤖');
  const persisted = JSON.parse(fs.readFileSync(usageFile, 'utf8'));
  assert.equal(persisted.gemini.used, 0);
});
