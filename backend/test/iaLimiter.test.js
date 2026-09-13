const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'sinmed-ia-limiter-'));
const limiterModule = require.resolve('../src/utils/iaLimiter');
const currentMonth = new Date().toISOString().slice(0, 7);
let fileIndex = 0;

function freshLimiter(used) {
  const file = path.join(tempDirectory, `usage-${fileIndex++}.json`);
  fs.writeFileSync(file, JSON.stringify({
    month: currentMonth,
    gemini: { used, limit: 400 },
  }));
  process.env.SINMED_IA_USAGE_FILE = file;
  delete require.cache[limiterModule];
  return require(limiterModule);
}

test.after(() => {
  delete process.env.SINMED_IA_USAGE_FILE;
  delete require.cache[limiterModule];
  fs.rmSync(tempDirectory, { recursive: true, force: true });
});

test('allows a normal request at 399 and stops at the limit', () => {
  const limiter = freshLimiter(399);

  assert.equal(limiter.canUse(1), true);
  limiter.consume(1);
  assert.equal(limiter.getInfo().used, 400);
  assert.equal(limiter.getInfo().remaining, 0);
  assert.equal(limiter.canUse(1), false);
});

test('allows an augmented request at 398.75 and records 1.25 units', () => {
  const limiter = freshLimiter(398.75);

  assert.equal(limiter.canUse(1.25), true);
  limiter.consume(1.25);
  assert.equal(limiter.getInfo().used, 400);
  assert.equal(limiter.getInfo().remaining, 0);
});

test('rejects an augmented request that would exceed the limit', () => {
  const limiter = freshLimiter(399);

  assert.equal(limiter.canUse(1.25), false);
  assert.equal(limiter.getInfo().used, 399);
});

test('rejects invalid usage units', () => {
  const limiter = freshLimiter(0);

  assert.throws(() => limiter.canUse(0), /INVALID_IA_USAGE_UNITS/);
  assert.throws(() => limiter.consume(-1), /INVALID_IA_USAGE_UNITS/);
});
