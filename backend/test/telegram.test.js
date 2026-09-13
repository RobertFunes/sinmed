const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const axios = require('axios');
const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'sinmed-telegram-'));
const envFile = path.join(tempDirectory, '.env');
const telegramEnvKeys = [
  'SINMED_ENV_FILE',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID',
  'TELEGRAM_CHAT_USERNAME',
  'TELEGRAM_CHAT_DISPLAY_NAME',
  'TELEGRAM_NOTIFY_LOGIN',
  'TELEGRAM_NOTIFY_PROFILE_CREATE',
  'TELEGRAM_NOTIFY_PROFILE_UPDATE',
  'TELEGRAM_NOTIFY_PROFILE_DELETE',
  'TELEGRAM_NOTIFY_APPOINTMENT_CREATE',
  'TELEGRAM_NOTIFY_APPOINTMENT_DELETE',
];
const previousEnv = new Map(telegramEnvKeys.map((key) => [key, process.env[key]]));

fs.writeFileSync(envFile, [
  'TELEGRAM_BOT_TOKEN=bot-token',
  'TELEGRAM_CHAT_ID=',
  'TELEGRAM_CHAT_USERNAME=',
  'TELEGRAM_CHAT_DISPLAY_NAME=',
  'TELEGRAM_NOTIFY_LOGIN=false',
  'TELEGRAM_NOTIFY_PROFILE_CREATE=false',
  'TELEGRAM_NOTIFY_PROFILE_UPDATE=false',
  'TELEGRAM_NOTIFY_PROFILE_DELETE=false',
  'TELEGRAM_NOTIFY_APPOINTMENT_CREATE=false',
  'TELEGRAM_NOTIFY_APPOINTMENT_DELETE=false',
  'OTHER_SETTING=keep',
  '',
].join('\n'));

process.env.SINMED_ENV_FILE = envFile;
process.env.TELEGRAM_BOT_TOKEN = 'bot-token';
delete process.env.TELEGRAM_CHAT_ID;
delete process.env.TELEGRAM_CHAT_USERNAME;
delete process.env.TELEGRAM_CHAT_DISPLAY_NAME;
for (const key of telegramEnvKeys.slice(5)) process.env[key] = 'false';

let updates = [];
let getUpdatesDelayMs = 0;
let getMeGate = null;
const sentMessages = [];
const telegramCalls = [];
const originalAxiosPost = axios.post;
axios.post = async (url, payload) => {
  const method = url.slice(url.lastIndexOf('/') + 1);
  telegramCalls.push({ method, payload });

  if (method === 'getMe') {
    if (getMeGate) {
      const gate = getMeGate;
      getMeGate = null;
      await new Promise((resolve) => {
        gate.release = resolve;
        gate.started();
      });
    }
    return {
      data: url.includes('invalid-token')
        ? { ok: false }
        : { ok: true, result: { first_name: 'SINMED', username: 'sinmed_test_bot' } },
    };
  }
  if (method === 'getUpdates') {
    if (getUpdatesDelayMs > 0) await new Promise((resolve) => setTimeout(resolve, getUpdatesDelayMs));
    return { data: { ok: true, result: updates } };
  }
  if (method === 'sendMessage') {
    sentMessages.push(payload);
    return { data: { ok: true, result: { message_id: sentMessages.length } } };
  }
  throw new Error(`Unexpected Telegram method: ${method}`);
};

const settingsStorePath = require.resolve('../src/services/settingsStore');
const telegramPath = require.resolve('../src/services/telegram');
delete require.cache[settingsStorePath];
delete require.cache[telegramPath];
const telegram = require('../src/services/telegram');
const db = require('../src/models/db');
const profile = require('../src/models/profile');

test.after(() => {
  axios.post = originalAxiosPost;
  for (const [key, value] of previousEnv) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  delete require.cache[telegramPath];
  delete require.cache[settingsStorePath];
  fs.rmSync(tempDirectory, { recursive: true, force: true });
});

test('advances past a matching group update and accepts a later private link', async () => {
  const link = await telegram.createLink();
  const token = new URL(link.linkUrl).searchParams.get('start');

  updates = [{
    update_id: 100,
    message: { text: `/start ${token}`, chat: { id: -10, type: 'group' } },
  }];
  await assert.rejects(
    () => telegram.verifyLink(),
    (error) => error.code === 'TELEGRAM_PRIVATE_CHAT_REQUIRED' && error.status === 400,
  );

  updates = [{
    update_id: 101,
    message: {
      text: `/start ${token}`,
      chat: { id: 123456789, type: 'private', username: 'alice', first_name: 'Alice' },
    },
  }];
  const state = await telegram.verifyLink();
  const updateCalls = telegramCalls.filter(({ method }) => method === 'getUpdates');

  assert.equal(updateCalls.at(-1).payload.offset, 101);
  assert.equal(state.recipient.linked, true);
  assert.equal(state.recipient.chatIdMasked, '12••••89');
  assert.equal(state.recipient.username, 'alice');
  assert.equal(state.recipient.displayName, 'Alice');
});

test('validates token replacement and resets the linked recipient and preferences', async () => {
  await telegram.updateSettings({ preferences: { profile_create: true } });
  await assert.rejects(
    () => telegram.updateSettings({ token: 'invalid-token' }),
    (error) => error.code === 'TELEGRAM_BOT_TOKEN_INVALID',
  );
  assert.equal(process.env.TELEGRAM_BOT_TOKEN, 'bot-token');

  const state = await telegram.updateSettings({ token: 'replacement-token' });
  const envContent = fs.readFileSync(envFile, 'utf8');

  assert.equal(state.bot.configured, true);
  assert.equal(state.bot.username, 'sinmed_test_bot');
  assert.equal(state.recipient.linked, false);
  assert.ok(Object.values(state.preferences).every((value) => value === false));
  assert.equal(process.env.TELEGRAM_BOT_TOKEN, 'replacement-token');
  assert.match(envContent, /OTHER_SETTING=keep/);
  assert.match(envContent, /TELEGRAM_CHAT_ID=\n/);
  assert.doesNotMatch(JSON.stringify(state), /replacement-token|123456789/);
});

test('serializes simultaneous link verification calls so the link is consumed once', async () => {
  const link = await telegram.createLink();
  const token = new URL(link.linkUrl).searchParams.get('start');
  updates = [{
    update_id: 175,
    message: {
      text: `/start ${token}`,
      chat: { id: 222333444, type: 'private', first_name: 'Concurrent' },
    },
  }];
  const callsBefore = telegramCalls.filter(({ method }) => method === 'getUpdates').length;
  getUpdatesDelayMs = 15;
  try {
    const [first, second] = await Promise.all([telegram.verifyLink(), telegram.verifyLink()]);
    assert.deepEqual(second, first);
  } finally {
    getUpdatesDelayMs = 0;
  }

  const callsAfter = telegramCalls.filter(({ method }) => method === 'getUpdates').length;
  assert.equal(callsAfter - callsBefore, 1);
  await assert.rejects(
    () => telegram.verifyLink(),
    (error) => error.code === 'TELEGRAM_LINK_NOT_FOUND',
  );
});

test('sends enabled notifications and test messages through the central service', async () => {
  const link = await telegram.createLink();
  const token = new URL(link.linkUrl).searchParams.get('start');
  updates = [{
    update_id: 200,
    message: {
      text: `/start ${token}`,
      chat: { id: 987654321, type: 'private', first_name: 'Bob' },
    },
  }];
  await telegram.verifyLink();
  await telegram.updateSettings({ preferences: { login: true } });

  await telegram.notify('login', 'Acceso: usuario de prueba');
  await telegram.sendTest();

  assert.equal(sentMessages.length, 2);
  assert.equal(sentMessages[0].chat_id, '987654321');
  assert.match(sentMessages[0].text, /usuario de prueba/);
  assert.match(sentMessages[1].text, /Prueba de notificaciones SINMED/);
});

test('keeps unlink as the final state when it races with a settings save', async () => {
  let signalStarted;
  const getMeStarted = new Promise((resolve) => { signalStarted = resolve; });
  const gate = { started: signalStarted, release: null };
  getMeGate = gate;

  const save = telegram.updateSettings({ preferences: { profile_create: true } });
  await getMeStarted;
  const unlink = telegram.unlinkRecipient();
  gate.release();
  await Promise.all([save, unlink]);

  assert.equal(process.env.TELEGRAM_CHAT_ID, '');
  assert.equal(process.env.TELEGRAM_CHAT_USERNAME, '');
  assert.equal(process.env.TELEGRAM_NOTIFY_LOGIN, 'false');
  assert.equal(process.env.TELEGRAM_NOTIFY_PROFILE_CREATE, 'false');
});

function responseRecorder() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function transactionHarness() {
  const events = [];
  const transaction = { query: async () => [[], {}] };
  return {
    events,
    db: {
      withTransaction: async (work) => {
        events.push('begin');
        try {
          const result = await work(transaction);
          events.push('commit');
          return result;
        } catch (error) {
          events.push('rollback');
          throw error;
        } finally {
          events.push('release');
        }
      },
    },
    transaction,
  };
}

function loadMockedUserController({ event, profile }) {
  const userControllerPath = require.resolve('../src/controllers/user');
  const dependencyMocks = new Map([
    [require.resolve('../src/models/db'), profile.db],
    [require.resolve('../src/models/profile'), profile.model],
    [require.resolve('../src/services/telegram'), {
      isNotificationEnabled: (candidate) => candidate === event,
      notify: profile.notify,
      notifyBestEffort: async () => {},
      profileMessage: () => 'profile notification',
      appointmentMessage: () => 'appointment notification',
      cloneAppointmentsMessage: () => 'clone notification',
      formatMexicoDate: () => 'date',
    }],
    [require.resolve('../src/utils/iaLimiter'), { getInfo: () => ({}) }],
    [require.resolve('../src/services/aiSettings'), { getState: () => ({ mode: 'normal', usageMultiplier: 1 }) }],
    [require.resolve('../src/helpers/jwt'), { signAccessToken: () => 'token' }],
    [require.resolve('../src/helpers/authCookies'), { setAccessCookie: () => {} }],
  ]);
  const previousModules = new Map();
  for (const [modulePath, exports] of dependencyMocks) {
    previousModules.set(modulePath, require.cache[modulePath]);
    require.cache[modulePath] = { id: modulePath, filename: modulePath, loaded: true, exports };
  }
  delete require.cache[userControllerPath];

  const controller = require(userControllerPath);
  return {
    controller,
    restore() {
      delete require.cache[userControllerPath];
      for (const [modulePath, previous] of previousModules) {
        if (previous) require.cache[modulePath] = previous;
        else delete require.cache[modulePath];
      }
    },
  };
}

function failingTransactionController({ event, profileMethods }) {
  const harness = transactionHarness();
  const calls = [];
  const notifyCalls = [];
  const model = {};
  for (const [name, result] of Object.entries(profileMethods)) {
    model[name] = async (...args) => {
      calls.push({ name, executor: args.at(-1) });
      return typeof result === 'function' ? result(...args) : result;
    };
  }
  const notify = async (...args) => {
    notifyCalls.push(args);
    const error = new Error('telegram unavailable');
    error.code = 'TELEGRAM_NOTIFICATION_FAILED';
    throw error;
  };
  const loaded = loadMockedUserController({
    event,
    profile: { db: harness.db, model, notify },
  });
  return { ...harness, ...loaded, calls, notifyCalls };
}

test('rolls back a profile creation when its Telegram notification fails', async () => {
  const run = failingTransactionController({
    event: 'profile_create',
    profileMethods: {
      add: 501,
      addAntecedentesFamiliares: 0,
      upsertAntecedentesPersonales: { affectedRows: 0 },
      upsertGinecoObstetricos: { affectedRows: 0 },
      addAntecedentesPersonalesPatologicos: 0,
      upsertExploracionFisica: { affectedRows: 0 },
      upsertConsultas: { affectedRows: 1, insertId: 601 },
      addPersonalizados: 0,
    },
  });
  try {
    const response = responseRecorder();
    await run.controller.add({ body: { datos_personales: { nombre: 'Ana' } } }, response);
    assert.equal(response.statusCode, 503);
    assert.deepEqual(response.body, { ok: false, error: 'TELEGRAM_NOTIFICATION_FAILED' });
    assert.deepEqual(run.events, ['begin', 'rollback', 'release']);
    assert.equal(run.notifyCalls.length, 1);
    assert.ok(run.calls.length > 0);
    assert.ok(run.calls.every(({ executor }) => executor === run.transaction));
  } finally {
    run.restore();
  }
});

test('rolls back an appointment creation when its Telegram notification fails', async () => {
  const run = failingTransactionController({
    event: 'appointment_create',
    profileMethods: { addAppointment: { id_cita: 701 } },
  });
  try {
    const response = responseRecorder();
    await run.controller.createCalendar({
      body: {
        inicio_utc: '2026-09-13 10:00:00',
        fin_utc: '2026-09-13 10:45:00',
        nombre: 'Cita de prueba',
      },
    }, response);
    assert.equal(response.statusCode, 503);
    assert.deepEqual(run.events, ['begin', 'rollback', 'release']);
    assert.equal(run.notifyCalls.length, 1);
    assert.deepEqual(run.calls.map(({ name, executor }) => ({ name, executor })), [
      { name: 'addAppointment', executor: run.transaction },
    ]);
  } finally {
    run.restore();
  }
});

test('rolls back every cloned appointment and sends one summary when Telegram fails', async () => {
  let nextId = 800;
  const run = failingTransactionController({
    event: 'appointment_create',
    profileMethods: {
      addAppointment: () => ({ id_cita: nextId++ }),
    },
  });
  try {
    const response = responseRecorder();
    await run.controller.cloneDay({
      body: {
        source_date: '2026-09-13',
        target_date: '2026-09-14',
        events: [
          { inicio_utc: '2026-09-13 09:00:00', fin_utc: '2026-09-13 09:30:00', nombre: 'Primera' },
          { inicio_utc: '2026-09-13 11:00:00', fin_utc: '2026-09-13 11:30:00', nombre: 'Segunda' },
        ],
      },
    }, response);
    assert.equal(response.statusCode, 503);
    assert.deepEqual(run.events, ['begin', 'rollback', 'release']);
    assert.equal(run.calls.length, 2);
    assert.ok(run.calls.every(({ executor }) => executor === run.transaction));
    assert.equal(run.notifyCalls.length, 1);
  } finally {
    run.restore();
  }
});

test('exposes the transaction helper and accepts transaction executors in profile writes', async () => {
  assert.equal(typeof db.withTransaction, 'function');
  const queries = [];
  const executor = {
    query: async (...args) => {
      queries.push(args);
      return [{ insertId: 42 }];
    },
  };

  const profileId = await profile.add({ nombre: 'Perfil de prueba' }, executor);

  assert.equal(profileId, 42);
  assert.equal(queries.length, 1);
  assert.match(queries[0][0], /^INSERT INTO perfil SET \?/);

  const originalGetConnection = db.getConnection;
  const transactionEvents = [];
  const transaction = {
    beginTransaction: async () => transactionEvents.push('begin'),
    commit: async () => transactionEvents.push('commit'),
    rollback: async () => transactionEvents.push('rollback'),
    release: () => transactionEvents.push('release'),
  };
  db.getConnection = async () => transaction;
  try {
    const result = await db.withTransaction(async (executor) => {
      assert.equal(executor, transaction);
      return 'committed';
    });
    assert.equal(result, 'committed');
    await assert.rejects(
      () => db.withTransaction(async () => { throw new Error('transaction failure'); }),
      /transaction failure/,
    );
  } finally {
    db.getConnection = originalGetConnection;
  }

  assert.deepEqual(transactionEvents, ['begin', 'commit', 'release', 'begin', 'rollback', 'release']);
});
