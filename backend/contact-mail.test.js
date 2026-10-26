const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { escapeHtml, firstEmail, notifyContact } = require('./contact-mail');

const originalEnv = { ...process.env };

afterEach(() => {
  for (const key of ['RESEND_API_KEY', 'CONTACT_FROM_EMAIL', 'CONTACT_TO_EMAIL', 'ADMIN_EMAIL']) {
    if (originalEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = originalEnv[key];
    }
  }
});

describe('contact mail', () => {
  it('escapes HTML in visitor fields', () => {
    assert.equal(escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('picks the first non-empty email', () => {
    assert.equal(firstEmail('', 'you@example.com', 'admin@example.com'), 'you@example.com');
  });

  it('skips sending when from address or API key is missing', async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_FROM_EMAIL;
    const result = await notifyContact({ id: '1', name: 'A', email: 'a@b.com', subject: 'Hi', message: 'Hello' });
    assert.equal(result.skipped, true);
  });

  it('does not throw when the mail helper returns an error', async () => {
    process.env.RESEND_API_KEY = 're_test';
    process.env.CONTACT_FROM_EMAIL = 'Portfolio <hello@example.com>';
    process.env.CONTACT_TO_EMAIL = 'owner@example.com';

    const result = await notifyContact(
      { id: 'msg-1', name: 'Ada', email: 'ada@example.com', subject: 'Hello', message: 'Can we talk?' },
      { sendEmail: async () => ({ error: { message: 'provider down' } }) }
    );

    assert.equal(result.ok, false);
  });

  it('does not throw when sendEmail throws', async () => {
    process.env.RESEND_API_KEY = 're_test';
    process.env.CONTACT_FROM_EMAIL = 'Portfolio <hello@example.com>';
    process.env.CONTACT_TO_EMAIL = 'owner@example.com';

    const result = await notifyContact(
      { id: 'msg-throw', name: 'Ada', email: 'ada@example.com', subject: 'Hello', message: 'Can we talk?' },
      { sendEmail: async () => { throw new Error('network'); } }
    );

    assert.equal(result.ok, false);
  });

  it('falls back to About email when CONTACT_TO_EMAIL is unset', async () => {
    process.env.RESEND_API_KEY = 're_test';
    process.env.CONTACT_FROM_EMAIL = 'Portfolio <hello@example.com>';
    delete process.env.CONTACT_TO_EMAIL;

    let captured;
    const result = await notifyContact(
      { id: 'msg-3', name: 'Ada', email: 'ada@example.com', subject: 'Hello', message: 'Can we talk?' },
      {
        getAboutEmail: async () => 'about@example.com',
        sendEmail: async (payload) => {
          captured = payload;
          return { data: { id: 'email_2' } };
        }
      }
    );

    assert.equal(result.ok, true);
    assert.equal(captured.to[0], 'about@example.com');
  });

  it('sends to CONTACT_TO_EMAIL with reply-to set to the visitor', async () => {
    process.env.RESEND_API_KEY = 're_test';
    process.env.CONTACT_FROM_EMAIL = 'Portfolio <hello@example.com>';
    process.env.CONTACT_TO_EMAIL = 'owner@example.com';

    let captured;
    const result = await notifyContact(
      { id: 'msg-2', name: 'Ada', email: 'ada@example.com', subject: 'Hello', message: 'Can we talk?' },
      {
        getAboutEmail: async () => 'about@example.com',
        sendEmail: async (payload, key) => {
          captured = { payload, key };
          return { data: { id: 'email_1' } };
        }
      }
    );

    assert.equal(result.ok, true);
    assert.equal(captured.payload.to[0], 'owner@example.com');
    assert.equal(captured.payload.replyTo, 'ada@example.com');
    assert.equal(captured.key, 'contact/msg-2');
  });
});
