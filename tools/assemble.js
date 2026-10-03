#!/usr/bin/env node
/**
 * Assemble translated unique-string chunks back into per-node / per-credential
 * translation files, then (optionally) install them into n8n-nodes-base.
 *
 * Inputs:
 *   work/units.json          – unit map from extract.js
 *   work/unique-strings.json – ordered unique English strings
 *   work/ustr/out-*.json     – {index: russian}
 *
 * Outputs:
 *   nodes/ru/<unit>.json     – per-unit dictionaries (repo copy)
 *   --install                – write them into n8n-nodes-base
 */
'use strict';

const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const ROOT = path.join(HERE, '..');
const WORK = path.join(ROOT, 'work');
const USTR = path.join(WORK, 'ustr');
const N8N = process.env.N8N_ROOT || '/Users/nikita/.local/lib/node_modules/n8n';

const install = process.argv.includes('--install');

// ---------- load ----------
const units = JSON.parse(fs.readFileSync(path.join(WORK, 'units.json'), 'utf8'));
const unique = JSON.parse(fs.readFileSync(path.join(WORK, 'unique-strings.json'), 'utf8'));

// index -> russian
const ru = {};
const files = fs.readdirSync(USTR).filter((f) => /^out-\d+\.json$/.test(f)).sort();
for (const f of files) {
  let raw = fs.readFileSync(path.join(USTR, f), 'utf8').trim();
  raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const a = raw.indexOf('{'), b = raw.lastIndexOf('}');
  if (a > 0 || b < raw.length - 1) raw = raw.slice(a, b + 1);
  Object.assign(ru, JSON.parse(raw));
}
console.log('chunks:', files.length, '| translated entries:', Object.keys(ru).length, '/', unique.length);

// ---------- map index -> translation, then string -> translation ----------
const byString = new Map();
let missing = 0;
for (let i = 0; i < unique.length; i++) {
  const en = unique[i];
  const t = ru[String(i)];
  if (t == null) { missing++; continue; }
  byString.set(en, t);
}
if (missing) console.log('WARNING: untranslated unique strings:', missing);

// ---------- rebuild per-unit dictionaries ----------
const outDir = path.join(ROOT, 'nodes', 'ru');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const written = [];
let totalKeys = 0, untranslated = 0;
for (const u of units) {
  const dict = {};
  for (const [k, en] of Object.entries(u.keys)) {
    const t = byString.get(en);
    if (t == null) { untranslated++; dict[k] = en; }
    else dict[k] = t;
  }
  totalKeys += Object.keys(dict).length;
  const safe = u.kind + '-' + u.name + '.json';
  fs.writeFileSync(path.join(outDir, safe), JSON.stringify(dict, null, 1));
  written.push({ ...u, repoFile: path.join(outDir, safe) });
}
console.log('units written:', written.length, '| keys:', totalKeys, '| left in English:', untranslated);

// ---------- install into n8n ----------
if (install) {
  let n = 0;
  for (const u of written) {
    fs.mkdirSync(path.dirname(u.outPath), { recursive: true });
    fs.writeFileSync(u.outPath, JSON.stringify(
      Object.fromEntries(Object.entries(JSON.parse(fs.readFileSync(u.repoFile, 'utf8')))), null, 0));
    n++;
  }
  console.log('installed into n8n:', n, 'files');
  console.log('  nodes      -> <NodeDir>/translations/ru/<name>.json');
  console.log('  credentials-> n8n-nodes-base/dist/credentials/translations/ru/<name>.json');
}
