const fs = require('fs');
const path = require('path');

const fsp = fs.promises;
const ENV_PATH = path.resolve(
  process.env.SINMED_ENV_FILE || path.join(__dirname, '../../.env'),
);
let envWriteQueue = Promise.resolve();

function formatEnvValue(value) {
  const stringValue = String(value ?? '');
  if (/^[A-Za-z0-9_./:@+-]*$/.test(stringValue)) return stringValue;
  return JSON.stringify(stringValue);
}

/**
 * Updates only the keys explicitly allowed by the caller and keeps writes
 * serialized so independent settings pages cannot overwrite each other.
 */
async function writeManagedEnv(updates, managedKeys = Object.keys(updates)) {
  const allowedKeys = new Set(managedKeys);
  const operation = async () => {
    const original = await fsp.readFile(ENV_PATH, 'utf8');
    const originalStats = await fsp.stat(ENV_PATH);
    const newline = original.includes('\r\n') ? '\r\n' : '\n';
    const lines = original.split(/\r?\n/);
    const seen = new Set();
    const replaced = lines.map((line) => {
      const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=.*$/);
      const key = match?.[1];
      if (!key || !allowedKeys.has(key) || !Object.prototype.hasOwnProperty.call(updates, key)) {
        return line;
      }
      seen.add(key);
      return `${key}=${formatEnvValue(updates[key])}`;
    });

    const missing = Object.keys(updates)
      .filter((key) => allowedKeys.has(key) && !seen.has(key))
      .map((key) => `${key}=${formatEnvValue(updates[key])}`);
    let nextContent = replaced.join(newline);
    if (missing.length > 0) {
      if (!nextContent.endsWith(newline)) nextContent += newline;
      nextContent += missing.join(newline);
    }
    if (original.endsWith('\n') && !nextContent.endsWith(newline)) nextContent += newline;

    const tempPath = `${ENV_PATH}.${process.pid}.${Date.now()}.tmp`;
    try {
      await fsp.writeFile(tempPath, nextContent, 'utf8');
      if (process.platform !== 'win32') await fsp.chmod(tempPath, originalStats.mode);
      await fsp.rename(tempPath, ENV_PATH);
    } catch (error) {
      try { await fsp.unlink(tempPath); } catch (_) { /* best effort cleanup */ }
      throw error;
    }

    for (const [key, value] of Object.entries(updates)) {
      if (allowedKeys.has(key)) process.env[key] = String(value ?? '');
    }
  };

  envWriteQueue = envWriteQueue.then(operation, operation);
  return envWriteQueue;
}

module.exports = { writeManagedEnv };
