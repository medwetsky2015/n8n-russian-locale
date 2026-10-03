#!/usr/bin/env node
/**
 * n8n Russian locale installer.
 *
 * Injects a Russian dictionary into the prebuilt n8n editor-ui bundle, because
 * n8n ships English only and N8N_DEFAULT_LOCALE=ru alone falls back to English.
 *
 * Two files are patched:
 *   1. the main i18n bundle  — the file containing  messages:{en:C}
 *   2. the mini-dict loader  — the file containing  "./lang/en.ts"
 *
 * Asset filenames are content-hashed and change between n8n releases, so the
 * files are located by CONTENT, never by name.
 *
 * Usage:
 *   node apply.js [--dist <assets-dir>] [--dry-run] [--restore]
 *
 * Exit codes: 0 ok, 1 error, 2 bad usage.
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const HERE = __dirname;
const BACKUP_DIR = path.join(HERE, '.backup');

// ---------------------------------------------------------------------------
// Russian plural rule for vue-i18n.
//
// vue-i18n picks a form by index. Layouts used by this dictionary:
//   t <= 2 : [one, other]                 -> English-like conditional switch
//   t == 3 : [one, few, many]
//   t >= 4 : [bare(no count), one, few, many]
// A call without a count arrives as pluralIndex -1.
// ---------------------------------------------------------------------------
const PLURAL_RULE =
  'pluralRules:{ru:(e,t)=>{let n=Math.abs(e);' +
  'if(t<=2)return n===1?0:1;' +
  'if(t>=4){if(e<0)return 0;if(n===0)return 3;' +
  'if(n%10===1&&n%100!==11)return 1;' +
  'if(n%10>=2&&n%10<=4&&(n%100<12||n%100>14))return 2;return 3}' +
  'if(e<0)return 0;' +
  'if(n%10===1&&n%100!==11)return 0;' +
  'if(n%10>=2&&n%10<=4&&(n%100<12||n%100>14))return 1;return 2}}';

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function die(msg) {
  console.error('\n  ОШИБКА: ' + msg + '\n');
  process.exit(1);
}

/** Locate the editor-ui assets dir. */
function findDist(explicit) {
  if (explicit) {
    if (!fs.existsSync(explicit)) die('каталог не найден: ' + explicit);
    return explicit;
  }
  const home = process.env.HOME || '';
  const candidates = [
    '/usr/local/lib/node_modules/n8n/node_modules/n8n-editor-ui/dist/assets',
    '/usr/lib/node_modules/n8n/node_modules/n8n-editor-ui/dist/assets',
    path.join(home, '.local/lib/node_modules/n8n/node_modules/n8n-editor-ui/dist/assets'),
    path.join(home, '.npm-global/lib/node_modules/n8n/node_modules/n8n-editor-ui/dist/assets'),
  ];
  for (const c of candidates) {
    if (c && fs.existsSync(c)) return c;
  }
  die('не удалось найти каталог editor-ui/assets.\n' +
      '  Укажите его явно:  node apply.js --dist /путь/к/n8n-editor-ui/dist/assets\n' +
      '  В Docker:          docker exec -it <контейнер> node /tmp/apply.js');
}

/** Find a file in dist whose content matches pred. */
function findFile(dist, pred) {
  for (const f of fs.readdirSync(dist)) {
    if (!f.endsWith('.js')) continue;
    const body = fs.readFileSync(path.join(dist, f), 'utf8');
    if (pred(body)) return { name: f, body, file: path.join(dist, f) };
  }
  return null;
}

/**
 * Return the [start, end) span of the value that follows `key` in `src`.
 *
 * Handles the shape used by the loader:
 *     "./lang/en.ts":()=>t(()=>import(`./en-XXX.js`),__vite__mapDeps([0,1]))
 *
 * An empty-argument arrow function `() =>` is skipped first — otherwise the
 * balanced scan would stop at its `)` and truncate the value.
 */
function valueSpanAfterKey(src, key) {
  const at = src.indexOf(key);
  if (at === -1) return null;
  let i = at + key.length;
  while (i < src.length && /\s/.test(src[i])) i++;
  const arrow = /^\(\s*\)\s*=>\s*/.exec(src.slice(i, i + 40));
  if (arrow) i += arrow[0].length;

  let depth = 0, opened = false;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (c === '(' || c === '[' || c === '{') { depth++; opened = true; }
    else if (c === ')' || c === ']' || c === '}') {
      if (depth === 0) return { start: at, end: j };      // enclosing object closes
      depth--;
      if (depth === 0) return { start: at, end: j + 1 };  // value complete
    } else if (!opened && (c === ',' || c === '}')) {
      return { start: at, end: j };                        // primitive value
    }
  }
  return null;
}

function backup(dist, name) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const dest = path.join(BACKUP_DIR, name);
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(path.join(dist, name), dest);
    return dest;
  }
  return null;
}

/** Syntax-check a string as an ES module without touching the real file. */
function checkSyntaxOf(source, label) {
  const tmp = path.join(os.tmpdir(), 'n8n-ru-check-' + process.pid + '-' + Math.random().toString(36).slice(2) + '.mjs');
  fs.writeFileSync(tmp, source);
  try {
    execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' });
  } catch (e) {
    fs.unlinkSync(tmp);
    const detail = (e.stderr || Buffer.from('')).toString().split('\n').slice(0, 6).join('\n');
    die('проверка синтаксиса не пройдена (' + label + '):\n' + detail);
  }
  fs.unlinkSync(tmp);
}

/** Mirror the English shape: linked-message dictionaries stay nested. */
function nest(flatMap) {
  const root = {};
  for (const [k, v] of Object.entries(flatMap)) {
    const parts = k.split('.');
    let cur = root;
    for (let i = 0; i < parts.length - 1; i++) cur = (cur[parts[i]] = cur[parts[i]] || {});
    cur[parts[parts.length - 1]] = v;
  }
  return root;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

function main() {
  const argv = process.argv.slice(2);
  let dist = null, dryRun = false, restore = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--dist') dist = argv[++i];
    else if (argv[i] === '--dry-run') dryRun = true;
    else if (argv[i] === '--restore') restore = true;
    else if (argv[i] === '--help' || argv[i] === '-h') {
      console.log('usage: node apply.js [--dist <assets-dir>] [--dry-run] [--restore]');
      process.exit(0);
    } else die('неизвестный аргумент: ' + argv[i]);
  }

  dist = findDist(dist);
  console.log('Каталог assets: ' + dist);

  // ---------- restore ----------
  if (restore) {
    if (!fs.existsSync(BACKUP_DIR)) die('бэкап не найден: ' + BACKUP_DIR);
    let n = 0;
    for (const f of fs.readdirSync(BACKUP_DIR)) {
      fs.copyFileSync(path.join(BACKUP_DIR, f), path.join(dist, f));
      console.log('  восстановлен: ' + f);
      n++;
    }
    console.log('\nВосстановлено файлов: ' + n + '. Перезапустите n8n.');
    return;
  }

  // ---------- load dictionaries ----------
  const mainDict = JSON.parse(fs.readFileSync(path.join(HERE, 'ru.json'), 'utf8'));
  const miniDict = JSON.parse(fs.readFileSync(path.join(HERE, 'ru-mini.json'), 'utf8'));
  console.log('Словарь: ' + Object.keys(mainDict).length + ' строк (основной) + ' +
              Object.keys(miniDict).length + ' (панель ассистента)');

  // ---------- locate targets ----------
  const main = findFile(dist, (s) => s.includes('messages:{en:C}'));
  if (!main) die('не найден основной i18n-бандл (нет messages:{en:C}).\n' +
                 '  Возможно, n8n обновлён и структура изменилась, либо патч уже применён.\n' +
                 '  Откатите:  node apply.js --restore');

  const loader = findFile(dist, (s) => s.includes('"./lang/en.ts"'));
  if (!loader) die('не найден загрузчик мини-словаря (нет "./lang/en.ts").');

  console.log('Основной бандл:  ' + main.name);
  console.log('Загрузчик:       ' + loader.name);

  // ---------- split reusable keys (must stay nested) ----------
  const reusable = {};
  const plain = {};
  for (const [k, v] of Object.entries(mainDict)) {
    if (k.startsWith('_reusableBaseText.') || k.startsWith('_reusableDynamicText.')) reusable[k] = v;
    else plain[k] = v;
  }
  const payload = Object.assign({}, plain, nest(reusable));

  // ---------- build patched content ----------
  // main bundle
  let s = main.body;
  const A1 = 'fallbackLocale:`en`,';
  if (s.split(A1).length - 1 !== 1) {
    die('якорь fallbackLocale не найден или не уникален в ' + main.name +
        '\n  Похоже, бандл уже пропатчен или версия n8n несовместима.');
  }
  s = s.replace(A1, A1 + PLURAL_RULE + ',');

  const A2 = 'messages:{en:C}';
  if (s.split(A2).length - 1 !== 1) die('якорь messages:{en:C} не уникален в ' + main.name);
  s = s.replace(A2, 'messages:{en:C,ru:' + JSON.stringify(payload) + '}');

  // mini-dict loader
  let l = loader.body;
  const span = valueSpanAfterKey(l, '"./lang/en.ts":');
  if (!span) die('не найдено значение "./lang/en.ts" в ' + loader.name);
  const valueText = l.slice(span.start, span.end);
  if (l.split(valueText).length - 1 !== 1) die('значение "./lang/en.ts" не уникально');
  l = l.slice(0, span.end) +
      ',"./lang/ru.ts":()=>({default:' + JSON.stringify(miniDict) + '})' +
      l.slice(span.end);

  // ---------- validate BEFORE writing ----------
  checkSyntaxOf(s, 'основной бандл');
  checkSyntaxOf(l, 'загрузчик');

  if (dryRun) {
    console.log('\n--dry-run: файлы не изменены.');
    console.log('  основной:  ' + s.length + ' символов (было ' + main.body.length + ')');
    console.log('  загрузчик: ' + l.length + ' символов (было ' + loader.body.length + ')');
    console.log('  синтаксис обоих файлов корректен.');
    return;
  }

  // ---------- write ----------
  const bk1 = backup(dist, main.name);
  const bk2 = backup(dist, loader.name);
  if (bk1) console.log('Бэкап: ' + bk1);
  if (bk2) console.log('Бэкап: ' + bk2);

  fs.writeFileSync(main.file, s);
  fs.writeFileSync(loader.file, l);

  console.log('\nГотово. Проверка синтаксиса пройдена.');
  console.log('\nДальше:');
  console.log('  1. Задайте локаль:  export N8N_DEFAULT_LOCALE=ru');
  console.log('     (Docker: добавьте N8N_DEFAULT_LOCALE: "ru" в environment сервиса)');
  console.log('  2. Перезапустите n8n.');
  console.log('\nОткат:  node apply.js --restore');
}

main();
