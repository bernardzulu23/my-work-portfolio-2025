const bcrypt = require('bcrypt');
const { getAdminEmail, validateAdminPasswordStrength, verifyAdminPassword } = require('./security');

const DUMMY_HASH = '$2b$12$0qifBO.bUIyv/xJoaR7PtOl8mV7uuaAd5XEYor5VoBgRZqh6TP5je';

function bool(value) {
  return value === true || value === 't' || value === 'true' || value === 1;
}

async function ensureAdminAccountSchema(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS admin_accounts (
      email VARCHAR(255) PRIMARY KEY,
      password_hash TEXT NOT NULL,
      must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
      skip_passkey BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function resolveBootstrapHash() {
  if (process.env.ADMIN_PASSWORD_HASH) {
    return process.env.ADMIN_PASSWORD_HASH;
  }
  if (process.env.ADMIN_PASSWORD) {
    return bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  }
  return '';
}

async function seedAdminAccount(db) {
  await ensureAdminAccountSchema(db);

  const email = getAdminEmail();
  const hash = await resolveBootstrapHash();
  if (!email || !hash) return;

  const [rows] = await db.query(
    'SELECT email, must_change_password FROM admin_accounts LIMIT 1'
  );
  const row = rows[0];

  if (!row) {
    await db.query(
      'INSERT INTO admin_accounts (email, password_hash, must_change_password, skip_passkey) VALUES (?, ?, TRUE, FALSE)',
      [email, hash]
    );
    return;
  }

  if (row.email !== email) {
    await db.query('UPDATE admin_accounts SET email=? WHERE email=?', [email, row.email]);
    try {
      await db.query('UPDATE auth_mfa SET email=? WHERE email=?', [email, row.email]);
      await db.query('UPDATE auth_passkeys SET email=? WHERE email=?', [email, row.email]);
    } catch (err) {
      console.warn('Could not retarget MFA records to the new admin email:', err.message);
    }
  }

  const mustChange = bool(row.must_change_password);
  if (mustChange || process.env.ADMIN_FORCE_RESEED === '1') {
    await db.query(
      'UPDATE admin_accounts SET password_hash=?, must_change_password=TRUE, skip_passkey=FALSE, updated_at=CURRENT_TIMESTAMP WHERE email=?',
      [hash, email]
    );
    try {
      await db.query('DELETE FROM auth_mfa WHERE email=?', [email]);
      await db.query('DELETE FROM auth_passkeys WHERE email=?', [email]);
    } catch (err) {
      console.warn('Could not reset MFA for the seeded admin:', err.message);
    }
  }
}

async function getAccount(db, email) {
  const [rows] = await db.query(
    'SELECT email, password_hash, must_change_password, skip_passkey FROM admin_accounts WHERE email=?',
    [email]
  );
  const row = rows[0];
  if (!row) return null;
  return {
    email: row.email,
    passwordHash: row.password_hash,
    mustChangePassword: bool(row.must_change_password),
    skipPasskey: bool(row.skip_passkey)
  };
}

async function verifyPassword(db, email, password) {
  const adminEmail = getAdminEmail();
  const emailOk = Boolean(adminEmail) && String(email || '').trim().toLowerCase() === adminEmail;
  if (!emailOk || !password) {
    await bcrypt.compare(String(password || ''), DUMMY_HASH);
    return false;
  }

  try {
    const account = await getAccount(db, adminEmail);
    if (account?.passwordHash) {
      return bcrypt.compare(password, account.passwordHash);
    }
  } catch (err) {
    console.warn('Admin account lookup failed, using bootstrap hash:', err.message);
  }

  return verifyAdminPassword(password);
}

async function changePassword(db, email, currentPassword, newPassword) {
  const currentOk = await verifyPassword(db, email, currentPassword);
  if (!currentOk) {
    return { ok: false, status: 401, error: 'Current password is incorrect' };
  }

  if (typeof newPassword !== 'string' || newPassword === currentPassword) {
    return { ok: false, status: 400, error: 'Choose a new password that is different from the current one' };
  }

  const strength = validateAdminPasswordStrength(newPassword);
  if (!strength.valid) {
    return { ok: false, status: 400, error: strength.error };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  const account = await getAccount(db, email);
  if (account) {
    await db.query(
      'UPDATE admin_accounts SET password_hash=?, must_change_password=FALSE, updated_at=CURRENT_TIMESTAMP WHERE email=?',
      [passwordHash, email]
    );
  } else {
    await db.query(
      'INSERT INTO admin_accounts (email, password_hash, must_change_password, skip_passkey) VALUES (?, ?, FALSE, FALSE)',
      [email, passwordHash]
    );
  }

  return { ok: true };
}

async function setSkipPasskey(db, email) {
  await db.query(
    'UPDATE admin_accounts SET skip_passkey=TRUE, updated_at=CURRENT_TIMESTAMP WHERE email=?',
    [email]
  );
}

function setupFrom(account, mfaState) {
  const mustChangePassword = Boolean(account?.mustChangePassword);
  const totpEnabled = Boolean(mfaState?.totpEnabled);
  const passkeyCount = (mfaState?.passkeys || []).length;
  const skipPasskey = Boolean(account?.skipPasskey);
  const setupRequired = mustChangePassword || !totpEnabled || (passkeyCount === 0 && !skipPasskey);
  return {
    mustChangePassword,
    totpEnabled,
    passkeyCount,
    skipPasskey,
    setupRequired
  };
}

const SETUP_ALLOWED_PATHS = new Set([
  '/api/auth/me',
  '/api/auth/logout',
  '/api/auth/password',
  '/api/auth/mfa',
  '/api/auth/mfa/totp/setup',
  '/api/auth/mfa/totp/enable',
  '/api/auth/passkey/register/options',
  '/api/auth/passkey/register/verify',
  '/api/auth/passkey/skip'
]);

function isSetupAllowedPath(path) {
  return SETUP_ALLOWED_PATHS.has(path);
}

module.exports = {
  seedAdminAccount,
  getAccount,
  verifyPassword,
  changePassword,
  setSkipPasskey,
  setupFrom,
  isSetupAllowedPath
};
