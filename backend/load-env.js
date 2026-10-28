const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

let loaded = false;

function applyEnvFile(filePath, { override }) {
  if (!fs.existsSync(filePath)) return;
  const parsed = dotenv.parse(fs.readFileSync(filePath));
  for (const [key, raw] of Object.entries(parsed)) {
    const value = String(raw ?? '').trim();
    if (!value) continue;
    if (!override && process.env[key] !== undefined && String(process.env[key]).trim() !== '') {
      continue;
    }
    process.env[key] = value;
  }
}

function loadEnv() {
  if (loaded) return;
  loaded = true;
  const root = path.join(__dirname, '..');
  applyEnvFile(path.join(root, '.env'), { override: false });
  applyEnvFile(path.join(root, '.env.local'), { override: true });
  applyEnvFile(path.join(__dirname, '.env'), { override: true });
}

loadEnv();

module.exports = { loadEnv, applyEnvFile };
