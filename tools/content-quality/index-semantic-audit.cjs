const fs = require('fs');
const path = require('path');
const YAML = require('./node_modules/yaml');

const root = process.cwd();
const docsRoot = path.join(root, 'src', 'content', 'docs');
const indexPath = path.join(docsRoot, 'CONTENT_INDEX.yml');

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(full));
    else if (ent.isFile() && /\.(md|mdx)$/i.test(ent.name)) out.push(full);
  }
  return out.sort();
}

function routeFor(file) {
  let rel = path.relative(docsRoot, file).split(path.sep).join('/').replace(/\.(md|mdx)$/i, '');
  if (rel === 'index') return '/';
  if (rel.endsWith('/index')) rel = rel.slice(0, -'/index'.length);
  return `/${rel}/`;
}

function frontmatter(file) {
  const src = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const lines = src.split(/\r?\n/);
  if (lines[0]?.trim() !== '---') return {};
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    const marker = lines[i].trim();
    if (marker === '---' || marker === '...') { end = i; break; }
  }
  if (end < 0) return {};
  try { return YAML.parse(lines.slice(1, end).join('\n')) || {}; }
  catch { return {}; }
}

function arr(v) {
  return Array.isArray(v) ? v.filter(x => typeof x === 'string' && x.trim()) : [];
}

function norm(v) {
  return String(v || '')
    .toLocaleLowerCase('ru-RU')
    .replace(/[«»"'`’“”!?.,:;()[\]{}]/g, ' ')
    .replace(/[—–-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function uniq(values) {
  return [...new Set(values.map(norm).filter(Boolean))];
}

const genericTags = new Set([
  'сербия', 'переезд', 'первые шаги', 'адаптация', 'жизнь в сербии', 'интеграция', 'документы',
  'госуслуги', 'навигация', 'блог', 'события', 'медицина', 'здравоохранение', 'автомобиль', 'транспорт',
  'дети', 'семья', 'политика сайта', 'конфиденциальность', 'английский', 'english', 'сербский', 'русский',
]);
const technicalTitles = new Set(['start', 'banner', 'banks', 'm26', 'petro']);
const genericLinkPatterns = [
  /^нужна информация по теме/,
  /^ищешь информацию по запросу/,
  /^вопросы? (о|об)\b/,
  /^нужна историческая справка$/,
  /^хочешь понять контекст/,
  /^выбираешь банк$/,
  /^нужно найти юриста$/,
  /^нужно зарегистрироваться как иностранец$/,
  /^нужна служебная страница/,
];
const badMarkup = /(----|\b(schema|class|csv):|<\/?[A-Z][A-Za-z0-9]*\b|\{\{|\}\}|\[\[|\]\])/i;

const pages = YAML.parse(fs.readFileSync(indexPath, 'utf8')).pages || [];
const byUrl = new Map(pages.map(p => [p.url, p]));
const files = walk(docsRoot);
const routes = new Set(files.map(routeFor));
const extras = pages.filter(p => typeof p.url === 'string' && !routes.has(p.url)).map(p => p.url);
const missing = [...routes].filter(r => !byUrl.has(r));

const rows = [];
const reasonCounts = new Map();
for (const file of files) {
  const route = routeFor(file);
  const page = byUrl.get(route) || {};
  const fm = frontmatter(file);
  const tags = arr(page.tags);
  const aliases = arr(page.aliases);
  const links = arr(page.link_when);
  const title = page.title || fm.title || '';
  const keywords = arr(fm.keywords);
  const reasons = [];
  let score = 0;

  if (!tags.length) { reasons.push('tags-empty'); score += 5; }
  if (!aliases.length) { reasons.push('aliases-empty'); score += 5; }
  if (!links.length) { reasons.push('link_when-empty'); score += 5; }

  if (tags.length > 0 && tags.length < 3) { reasons.push('tags-thin'); score += 1; }
  if (aliases.length > 0 && aliases.length < 2) { reasons.push('aliases-thin'); score += 1; }
  if (links.length > 0 && links.length < 2) { reasons.push('link_when-thin'); score += 1; }

  const nTitle = norm(title);
  const nAliases = uniq(aliases);
  if (nAliases.length && nAliases.every(a => a === nTitle)) { reasons.push('alias-title-only'); score += 1; }

  if (links.length && links.every(v => genericLinkPatterns.some(re => re.test(norm(v))))) {
    reasons.push('link_when-generic'); score += 2;
  }

  if (links.some(v => badMarkup.test(v) || v.length > 240 || (v.length >= 180 && !/[.!?…)]$/.test(v.trim())))) {
    reasons.push('link_when-suspicious'); score += 3;
  }

  const topical = new Set(uniq([...tags, ...aliases]));
  if (keywords.length >= 2 && !keywords.some(k => topical.has(norm(k)))) {
    reasons.push('keywords-unrepresented'); score += 1;
  }

  const nTags = uniq(tags);
  if (nTags.length && nTags.length <= 3 && nTags.every(t => genericTags.has(t) || t === nTitle)) {
    reasons.push('tags-generic'); score += 1;
  }

  if (technicalTitles.has(nTitle)) { reasons.push('technical-title'); score += 1; }

  const bucket = score >= 3 ? 'weak' : score === 2 ? 'borderline' : 'ok';
  rows.push({ route, score, bucket, reasons, title, keywords: keywords.length, tags: tags.length, aliases: aliases.length, links: links.length });
  for (const reason of reasons) reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
}

const counts = Object.fromEntries(['ok', 'borderline', 'weak'].map(k => [k, rows.filter(r => r.bucket === k).length]));
console.log(`AUDIT_SUMMARY content_pages=${files.length} index_entries=${pages.length} missing=${missing.length} extra=${extras.length} ok=${counts.ok} borderline=${counts.borderline} weak=${counts.weak}`);
console.log(`AUDIT_EXTRA ${extras.length ? extras.join(',') : '-'}`);
console.log(`AUDIT_MISSING ${missing.length ? missing.join(',') : '-'}`);
console.log('AUDIT_REASON_COUNTS');
for (const [reason, count] of [...reasonCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
  console.log(`${reason}\t${count}`);
}
console.log('AUDIT_WEAK');
for (const row of rows.filter(r => r.bucket === 'weak').sort((a, b) => b.score - a.score || a.route.localeCompare(b.route))) {
  console.log(`${row.score}\t${row.route}\t${row.reasons.join(',')}\tK=${row.keywords}\tT=${row.tags}\tA=${row.aliases}\tL=${row.links}\t${row.title}`);
}
console.log('AUDIT_BORDERLINE');
for (const row of rows.filter(r => r.bucket === 'borderline').sort((a, b) => a.route.localeCompare(b.route))) {
  console.log(`${row.score}\t${row.route}\t${row.reasons.join(',')}\tK=${row.keywords}\tT=${row.tags}\tA=${row.aliases}\tL=${row.links}\t${row.title}`);
}
