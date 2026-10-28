const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { applyEnvFile } = require('./load-env');

describe('load-env', () => {
  it('lets .env.local override .env and skips empty assignments', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'load-env-'));
    const envPath = path.join(dir, '.env');
    const localPath = path.join(dir, '.env.local');
    fs.writeFileSync(envPath, 'CV_TEST_KEY=from-env\nCV_TEST_EMPTY=\nCV_TEST_KEEP=keep-me\n');
    fs.writeFileSync(localPath, 'CV_TEST_KEY=from-local\nCV_TEST_EMPTY=\nCV_TEST_NEW=added\n');

    const previous = {
      key: process.env.CV_TEST_KEY,
      empty: process.env.CV_TEST_EMPTY,
      keep: process.env.CV_TEST_KEEP,
      added: process.env.CV_TEST_NEW
    };
    delete process.env.CV_TEST_KEY;
    delete process.env.CV_TEST_EMPTY;
    delete process.env.CV_TEST_KEEP;
    delete process.env.CV_TEST_NEW;

    try {
      applyEnvFile(envPath, { override: false });
      assert.equal(process.env.CV_TEST_KEY, 'from-env');
      assert.equal(process.env.CV_TEST_KEEP, 'keep-me');
      assert.equal(process.env.CV_TEST_EMPTY, undefined);

      applyEnvFile(localPath, { override: true });
      assert.equal(process.env.CV_TEST_KEY, 'from-local');
      assert.equal(process.env.CV_TEST_KEEP, 'keep-me');
      assert.equal(process.env.CV_TEST_NEW, 'added');
      assert.equal(process.env.CV_TEST_EMPTY, undefined);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
      for (const [name, value] of Object.entries({
        CV_TEST_KEY: previous.key,
        CV_TEST_EMPTY: previous.empty,
        CV_TEST_KEEP: previous.keep,
        CV_TEST_NEW: previous.added
      })) {
        if (value === undefined) delete process.env[name];
        else process.env[name] = value;
      }
    }
  });
});
