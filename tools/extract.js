#!/usr/bin/env node
/**
 * Extract every translatable string from n8n-nodes-base nodes and credentials,
 * in exactly the shape n8n's translation loader expects.
 *
 * Output (into OUT dir):
 *   units.json        – [{id, kind, name, outPath, keys:{key:en}}]
 *   chunks/in-XX.json – {unitId: {key: en}}  (translation input)
 *
 * Key paths mirror packages/frontend/editor-ui i18n lookups:
 *   node:       <param>.<field>                     (nodeView.<param>.*)
 *   credential: <param>.<field>                     (credText)
 */
'use strict';

const fs = require('fs');
const path = require('path');

const N8N = process.env.N8N_ROOT || '/Users/nikita/.local/lib/node_modules/n8n';
const NB = path.join(N8N, 'node_modules/n8n-nodes-base/dist');
const OUT = process.env.OUT_DIR || path.join(__dirname, '..', 'work');
const CHUNK_CHARS = parseInt(process.env.CHUNK_CHARS || '15000', 10);

fs.mkdirSync(path.join(OUT, 'chunks'), { recursive: true });

const isTranslatable = (v) =>
  typeof v === 'string' && v.trim().length > 0 && /[A-Za-z]{3}/.test(v) && !/^https?:\/\//.test(v);

/** Walk a parameter tree and emit flat key -> English value. */
function collectParams(params, prefix, out) {
  for (const p of params || []) {
    if (!p || typeof p !== 'object') continue;
    const base = prefix ? prefix + '.' + p.name : p.name;
    const put = (suffix, v) => { if (isTranslatable(v)) out[base + suffix] = v; };
    put('.displayName', p.displayName);
    put('.description', p.description);
    put('.placeholder', p.placeholder);
    put('.hint', p.hint);
    if (Array.isArray(p.options)) {
      for (const o of p.options) {
        if (!o || typeof o !== 'object') continue;
        const val = o.value !== undefined ? o.value : o.name;
        const ob = base + '.options.' + val;
        if (isTranslatable(o.name)) out[ob + '.displayName'] = o.name;
        if (isTranslatable(o.description)) out[ob + '.description'] = o.description;
        if (Array.isArray(o.values)) collectParams(o.values, ob + '.values', out);
      }
    }
  }
}

function loadNodeDesc(file) {
  const mod = require(file);
  for (const k of Object.keys(mod)) {
    const C = mod[k];
    if (typeof C !== 'function') continue;
    // `description` may be a getter on the instance (versioned nodes) — always
    // read it from an instance first, then fall back to the static property.
    let d;
    try { d = new C().description; } catch { /* fall through */ }
    if (!d) { try { d = C.description; } catch { /* fall through */ } }
    if (!d) continue;

    // Versioned nodes keep parameters in a sibling Description.js; merge it in.
    if (!d.properties || !d.properties.length) {
      const dir = path.dirname(file);
      for (const cand of fs.readdirSync(dir)) {
        if (!/^Description.*\.js$/.test(cand)) continue;
        try {
          const m2 = require(path.join(dir, cand));
          for (const key of Object.keys(m2)) {
            const v = m2[key];
            if (v && Array.isArray(v.properties)) { d = Object.assign({}, d, v); break; }
            if (v && typeof v === 'object' && v.description && Array.isArray(v.description.properties)) {
              d = Object.assign({}, d, v.description); break;
            }
          }
        } catch { /* ignore */ }
        if (d.properties && d.properties.length) break;
      }
    }
    if (!d.properties || !d.properties.length) continue;

    // Versioned nodes (HttpRequest/V3/HttpRequestV3.node.js) leave `name` empty:
    // n8n derives it from the top-level directory (n8n-nodes-base.httpRequest).
    // Recover it so the translation file lands where the loader looks it up.
    if (!d.name) {
      const rel = path.relative(path.join(NB, 'nodes'), file).split(path.sep);
      const dirName = rel[0];
      const short = dirName.charAt(0).toLowerCase() + dirName.slice(1);
      d = Object.assign({}, d, { name: 'n8n-nodes-base.' + short });
    }
    return d;
  }
  return null;
}

function loadCredDesc(file) {
  const mod = require(file);
  for (const k of Object.keys(mod)) {
    const C = mod[k];
    if (typeof C !== 'function') continue;
    let d; try { const i = new C(); d = i.description || i; } catch { d = C; }
    if (d && d.properties) return d;
  }
  return null;
}

function walkFiles(dir, suffix, out) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkFiles(p, suffix, out);
    else if (e.name.endsWith(suffix)) out.push(p);
  }
  return out;
}

/** Resolve the output path n8n will read (mirrors NodeTypes.getNodeTranslationPath). */
function nodeOutPath(file, longName) {
  const nodeDir = path.dirname(file);
  const versioned = fs.readdirSync(nodeDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^v\d$/.test(e.name));
  const maxV = versioned.length ? Math.max(...versioned.map((d) => parseInt(d.name.slice(1), 10))) : null;
  const short = longName.replace('n8n-nodes-base.', '');
  return maxV
    ? path.join(nodeDir, `v${maxV}`, 'translations', 'ru', `${short}.json`)
    : path.join(nodeDir, 'translations', 'ru', `${short}.json`);
}

const units = [];
const seenNode = new Set();
const seenCred = new Set();

// ---------- nodes ----------
for (const file of walkFiles(path.join(NB, 'nodes'), '.node.js', [])) {
  let d;
  try { d = loadNodeDesc(file); } catch { continue; }
  if (!d || seenNode.has(d.name)) continue;
  seenNode.add(d.name);
  const keys = {};
  if (isTranslatable(d.displayName)) keys['__displayName'] = d.displayName;
  if (isTranslatable(d.description)) keys['__description'] = d.description;
  if (isTranslatable(d.eventTriggerDescription)) keys['__eventTriggerDescription'] = d.eventTriggerDescription;
  if (isTranslatable(d.activationMessage)) keys['__activationMessage'] = d.activationMessage;
  collectParams(d.properties, '', keys);
  if (!Object.keys(keys).length) continue;
  units.push({
    id: 'node:' + d.name,
    kind: 'node',
    name: d.name,
    displayName: d.displayName,
    outPath: nodeOutPath(file, d.name),
    keys,
  });
}

// ---------- credentials ----------
for (const file of walkFiles(path.join(NB, 'credentials'), '.credentials.js', [])) {
  let d;
  try { d = loadCredDesc(file); } catch { continue; }
  if (!d || !d.name || seenCred.has(d.name)) continue;
  seenCred.add(d.name);
  const keys = {};
  if (isTranslatable(d.displayName)) keys['__displayName'] = d.displayName;
  if (isTranslatable(d.description)) keys['__description'] = d.description;
  collectParams(d.properties, '', keys);
  if (!Object.keys(keys).length) continue;
  units.push({
    id: 'cred:' + d.name,
    kind: 'credential',
    name: d.name,
    displayName: d.displayName,
    outPath: path.join(NB, 'credentials', 'translations', 'ru', `${d.name}.json`),
    keys,
  });
}

// ---------- chunk ----------
const totalStrings = units.reduce((a, u) => a + Object.keys(u.keys).length, 0);
const totalChars = units.reduce((a, u) => a + Object.values(u.keys).reduce((x, s) => x + s.length, 0), 0);
console.log('units (nodes + credentials):', units.length);
console.log('translatable strings:', totalStrings, '| chars:', totalChars);

// pack whole units into chunks; split a unit only when it alone exceeds the budget
const packed = [];   // [{parts: {unitId: {key:en}}, chars}]
for (const u of units) {
  const entries = Object.entries(u.keys);
  const size = entries.reduce((a, [, v]) => a + v.length, 0);
  if (size <= CHUNK_CHARS) {
    packed.push({ parts: { [u.id]: u.keys }, chars: size, ids: [u.id] });
    continue;
  }
  // split large unit across several chunks
  let cur = {}, curChars = 0;
  for (const [k, v] of entries) {
    if (curChars + v.length > CHUNK_CHARS && Object.keys(cur).length) {
      packed.push({ parts: { [u.id]: cur }, chars: curChars, ids: [u.id] });
      cur = {}; curChars = 0;
    }
    cur[k] = v; curChars += v.length;
  }
  if (Object.keys(cur).length) packed.push({ parts: { [u.id]: cur }, chars: curChars, ids: [u.id] });
}

// balance: merge small adjacent chunks up to the budget
const merged = [];
for (const p of packed) {
  const last = merged[merged.length - 1];
  if (last && last.chars + p.chars <= CHUNK_CHARS && Object.keys(p.parts).every((id) => !(id in last.parts))) {
    Object.assign(last.parts, p.parts);
    last.chars += p.chars;
    last.ids.push(...p.ids);
  } else merged.push({ parts: { ...p.parts }, chars: p.chars, ids: [...p.ids] });
}

merged.forEach((c, i) => {
  const n = Object.keys(c.parts).length;
  const cnt = Object.values(c.parts).reduce((a, o) => a + Object.keys(o).length, 0);
  fs.writeFileSync(path.join(OUT, 'chunks', 'in-' + String(i + 1).padStart(3, '0') + '.json'),
    JSON.stringify(c.parts, null, 1));
});
fs.writeFileSync(path.join(OUT, 'units.json'), JSON.stringify(units, null, 1));
console.log('chunks written:', merged.length);
console.log('sample chunk sizes:', merged.slice(0, 5).map((c) => c.chars).join(', '));
