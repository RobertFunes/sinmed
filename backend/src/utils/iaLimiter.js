// utils/iaLimiter.js
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const FILE = path.join(DATA_DIR, 'ia-usage.json');

const DEFAULTS = {
  month: null, // YYYY-MM
  gemini: { used: 0, limit: 250 }, // mensajes
  image: { used: 0, limit: 40 },   // imágenes
};

let state = null;

function nowMonth() {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

function monthEndIso(ym = nowMonth()) {
  const [y, m] = ym.split('-').map(n => parseInt(n, 10));
  const next = m === 12 ? new Date(y + 1, 0, 1) : new Date(y, m, 1);
  const end = new Date(next.getTime() - 1000); // 1s antes del mes siguiente
  return end.toISOString();
}

function load() {
  try {
    if (!fs.existsSync(FILE)) {
      ensureDir();
      state = { ...DEFAULTS, month: nowMonth() };
      save();
      return;
    }
    const raw = fs.readFileSync(FILE, 'utf8');
    const parsed = JSON.parse(raw);
    state = {
      month: parsed.month || nowMonth(),
      gemini: { used: Number(parsed?.gemini?.used) || 0, limit: Number(parsed?.gemini?.limit) || DEFAULTS.gemini.limit },
      image:  { used: Number(parsed?.image?.used)  || 0, limit: Number(parsed?.image?.limit)  || DEFAULTS.image.limit },
    };
    ensureMonth();
  } catch (e) {
    // fallback seguro
    ensureDir();
    state = { ...DEFAULTS, month: nowMonth() };
    save();
  }
}

function ensureDir() {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (_) {}
}

function save() {
  try {
    ensureDir();
    fs.writeFileSync(FILE, JSON.stringify(state, null, 2));
  } catch (_) {
    // si falla el guardado, no romper la app
  }
}

function ensureMonth() {
  if (!state) load();
  const cur = nowMonth();
  if (state.month !== cur) {
    state.month = cur;
    state.gemini.used = 0;
    state.image.used = 0;
    save();
  }
}

function canUse(kind) {
  ensureMonth();
  const k = kind === 'image' ? 'image' : 'gemini';
  const used = state[k].used;
  const limit = state[k].limit;
  return used < limit;
}

function consume(kind, n = 1) {
  ensureMonth();
  const k = kind === 'image' ? 'image' : 'gemini';
  state[k].used = Math.max(0, (state[k].used || 0)) + n;
  save();
}

function getInfo(kind) {
  ensureMonth();
  const k = kind === 'image' ? 'image' : 'gemini';
  const used = state[k].used;
  const limit = state[k].limit;
  const remaining = Math.max(0, limit - used);
  return {
    month: state.month,
    limit,
    used,
    remaining,
    resetAt: monthEndIso(state.month),
  };
}

module.exports = { canUse, consume, getInfo };

