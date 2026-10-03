#!/usr/bin/env node
/**
 * Generate n8n-nodes-base/dist/nodes/headers.js — the file the editor fetches
 * to localise node NAMES on the canvas.
 *
 * The frontend merges this payload as vue-i18n messages under `headers`, then
 * looks up  headers.<shortNodeType>.displayName  (see localizeNodeName in the
 * editor bundle). Without this file node names stay English.
 *
 * Output shape:
 *   module.exports = { scheduleTrigger: { displayName: '…' }, … }
 */
'use strict';

const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const ROOT = path.join(HERE, '..');
const WORK = path.join(ROOT, 'work');
const N8N = process.env.N8N_ROOT || '/Users/nikita/.local/lib/node_modules/n8n';
const NB = path.join(N8N, 'node_modules/n8n-nodes-base/dist');

const units = JSON.parse(fs.readFileSync(path.join(WORK, 'units.json'), 'utf8'));

// shortName (as it appears in `headers.<name>.displayName`) -> russian displayName
const headers = {};
for (const u of units) {
  if (u.kind !== 'node') continue;
  const short = u.name.replace('n8n-nodes-base.', '');
  // the RU name comes from the assembled translation file (__displayName key)
  const repoFile = path.join(ROOT, 'nodes', 'ru', 'node-' + u.name + '.json');
  if (!fs.existsSync(repoFile)) continue;
  const d = JSON.parse(fs.readFileSync(repoFile, 'utf8'));
  if (d.__displayName) headers[short] = { displayName: d.__displayName };
}

console.log('node display names collected:', Object.keys(headers).length);

const body = 'module.exports=' + JSON.stringify(headers) + ';\n';
const repoOut = path.join(ROOT, 'nodes', 'headers.js');
fs.mkdirSync(path.dirname(repoOut), { recursive: true });
fs.writeFileSync(repoOut, body);
console.log('wrote repo copy:', repoOut);

if (process.argv.includes('--install')) {
  const target = path.join(NB, 'nodes', 'headers.js');
  fs.writeFileSync(target, body);
  console.log('installed:', target);
}
