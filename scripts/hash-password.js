/**
 * Generate a bcrypt hash for ADMIN_PASSWORD_HASH.
 * Usage: node scripts/hash-password.js "your-secure-password"
 */
const bcrypt = require('bcrypt');

const { validateAdminPasswordStrength } = require('../backend/security');

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hash-password.js "your-password"');
  process.exit(1);
}

const strength = validateAdminPasswordStrength(password);
if (!strength.valid) {
  console.error(strength.error);
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log(hash);
