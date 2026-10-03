#!/usr/bin/env node
/**
 * Bundle the assembled per-unit node/credential translations into a single
 * file the installer can consume:  nodes-ru.json
 *
 * Shape:
 * {
 *   "sourceVersion": "2.41.6",
 *   "headers": { "<shortNodeType>": { "displayName": "…" } },
 *   "files": {
 *     "<path relative to n8n-nodes-base/dist>": { "<key>": "…" }
 *   }
 * }
 *
 * The installer recomputes nothing: it just writes each entry under
 * <n8n-nodes-base>/dist/<relative path> and emits headers.js.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WORK = path.join(ROOT, 'work');
const UNITS_DIR = path.join(ROOT, 'nodes', 'ru');
const N8N = process.env.N8N_ROOT || '/Users/nikita/.local/lib/node_modules/n8n';
const NB = path.join(N8N, 'node_modules/n8n-nodes-base');

const units = JSON.parse(fs.readFileSync(path.join(WORK, 'units.json'), 'utf8'));
const n8nVersion = JSON.parse(fs.readFileSync(path.join(N8N, 'package.json'), 'utf8')).version;

const files = {};
const headers = {};
let missingFiles = 0;

for (const u of units) {
  const repoFile = path.join(UNITS_DIR, u.kind + '-' + u.name + '.json');
  if (!fs.existsSync(repoFile)) { missingFiles++; continue; }
  const dict = JSON.parse(fs.readFileSync(repoFile, 'utf8'));

  // absolute outPath -> path relative to n8n-nodes-base
  const rel = path.relative(NB, u.outPath).split(path.sep).join('/');
  files[rel] = dict;

  if (u.kind === 'node') {
    const short = u.name.replace('n8n-nodes-base.', '');
    if (dict.__displayName) headers[short] = { displayName: dict.__displayName };
  }
}

const bundle = {
  sourceVersion: n8nVersion,
  generatedAt: new Date().toISOString(),
  headers,
  files,
};

const out = path.join(ROOT, 'nodes-ru.json');
fs.writeFileSync(out, JSON.stringify(bundle));
const kb = (fs.statSync(out).size / 1024).toFixed(0);
console.log('units:', units.length, '| files in bundle:', Object.keys(files).length, '| missing:', missingFiles);
console.log('headers (node names):', Object.keys(headers).length);
console.log('wrote', out, '(', kb, 'KB )');
