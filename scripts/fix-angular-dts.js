/**
 * Angular 20.3.34 publishes some declarations as *.d.d.ts while index.d.ts
 * imports *.d.js (resolved as *.d.ts). Copy the files so the IDE can resolve
 * @angular/core and related packages.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'node_modules', '@angular');
if (!fs.existsSync(root)) process.exit(0);

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(full);
      continue;
    }
    if (!ent.name.endsWith('.d.d.ts')) continue;
    const dest = full.replace(/\.d\.d\.ts$/, '.d.ts');
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(full, dest);
    }
  }
}

walk(root);
