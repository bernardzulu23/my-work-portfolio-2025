/**
 * Upsert the admin login from ADMIN_EMAIL + ADMIN_PASSWORD_HASH (or ADMIN_PASSWORD).
 * Forces a password-change + MFA/passkey setup on next login.
 */
require('dotenv').config();
const db = require('../backend/db');
const adminAccount = require('../backend/admin-account');

(async () => {
  process.env.ADMIN_FORCE_RESEED = '1';
  await adminAccount.seedAdminAccount(db);
  const email = process.env.ADMIN_EMAIL;
  const account = await adminAccount.getAccount(db, String(email || '').trim().toLowerCase());
  console.log(JSON.stringify({
    seeded: Boolean(account),
    email: account?.email || null,
    mustChangePassword: Boolean(account?.mustChangePassword)
  }));
  process.exit(0);
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
