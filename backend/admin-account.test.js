const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { setupFrom, isSetupAllowedPath } = require('./admin-account');

describe('admin account setup flags', () => {
  it('requires a password change, authenticator, and passkey for a seeded account', () => {
    const flags = setupFrom(
      { mustChangePassword: true, skipPasskey: false },
      { totpEnabled: false, passkeys: [] }
    );
    assert.equal(flags.setupRequired, true);
    assert.equal(flags.mustChangePassword, true);
  });

  it('is complete after password change, TOTP, and a passkey', () => {
    const flags = setupFrom(
      { mustChangePassword: false, skipPasskey: false },
      { totpEnabled: true, passkeys: [{ id: '1' }] }
    );
    assert.equal(flags.setupRequired, false);
  });

  it('allows skipping passkeys only when that flag is stored', () => {
    const flags = setupFrom(
      { mustChangePassword: false, skipPasskey: true },
      { totpEnabled: true, passkeys: [] }
    );
    assert.equal(flags.setupRequired, false);
  });

  it('allows setup API paths while blocking CMS writes', () => {
    assert.equal(isSetupAllowedPath('/api/auth/password'), true);
    assert.equal(isSetupAllowedPath('/api/projects'), false);
  });
});
