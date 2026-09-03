import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import GithubSlugger from 'github-slugger';
import YAML from 'yaml';

const LEGACY_REF = process.env.LEGACY_REF || '01a48adab04c28e12f7e06648d615af21b3cb3e2';
const INDEX_PATH = 'src/content/docs/CONTENT_INDEX.yml';
const DOCS_ROOT = path.resolve('src/content/docs');

const stopWords = new Set([
  'для', 'или', 'как', 'что', 'это', 'при', 'про', 'под', 'над', 'без', 'после', 'перед', 'между', 'через',
  'нужно', 'нужна', 'нужен', 'нужны', 'хочешь', 'ищешь', 'планируешь', 'требуется', 'вопрос', 'вопросы',
  'информация', 'информации', 'понять', 'проверить', 'узнать', 'выбрать', 'получить', 'оформить', 'сделать',
  'сербии', 'сербия', 'србији', 'about', 'information', 'needed', 'request', 'topic', 'the', 'and', 'for', 'with',
  'from', 'this', 'that', 'page', 'материал', 'материала', 'тема', 'теме', 'связан', 'связана',
]);

const russianEndings = [
  'иями', 'ями', 'ами', 'ение', 'ения', 'ений', 'ого', 'ему', 'ому', 'ыми', 'ими', 'ский', 'ская', 'ские', 'ского',
  'ность', 'ности', 'овых', 'евых', 'иях', 'ах', 'ях', 'ов', 'ев', 'ий', 'ый', 'ая', 'яя', 'ое', 'ее', 'ые', 'ие',
  'ам', 'ям', 'ом', 'ем', 'у', 'ю', 'а', 'я', 'ы', 'и', 'е', 'о', 'й', 'ь',
];

function stemToken(token) {
  if (!/[а-яё]/iu.test(token) || token.length < 5) return token;
  for (const ending of russianEndings) {
    if (token.endsWith(ending) && token.length - ending.length >= 3) return token.slice(0, -ending.length);
  }
  return token;
}

function tokens(value) {
  return String(value ?? '')
    .toLocaleLowerCase('ru-RU')
    .replaceAll('ё', 'е')
    .normalize('NFKC')
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length >= 2 && !stopWords.has(token))
    .map(stemToken);
}

function normalize(value) {
  return String(value ?? '')
    .toLocaleLowerCase('ru-RU')
    .replaceAll('ё', 'е')
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function list(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string' && item.trim()) : [];
}

function semanticStrings(page) {
  return [
    page?.title,
    page?.description,
    ...list(page?.keywords),
    ...list(page?.tags),
    ...list(page?.aliases),
    ...list(page?.link_when),
  ].filter((value) => typeof value === 'string' && value.trim());
}

function tokenCoverage(value, candidateStrings) {
  const legacyTokens = [...new Set(tokens(value))];
  const candidateTokens = new Set(tokens(candidateStrings.join(' ')));
  const missing = legacyTokens.filter((token) => !candidateTokens.has(token));
  return {
    total: legacyTokens.length,
    covered: legacyTokens.length - missing.length,
    ratio: legacyTokens.length === 0 ? 1 : (legacyTokens.length - missing.length) / legacyTokens.length,
    missing,
  };
}

function fieldAudit(legacyPage, currentPage, field) {
  const currentField = list(currentPage?.[field]);
  const currentNormalized = new Set(currentField.map(normalize));
  const currentAnyNormalized = new Set(semanticStrings(currentPage).map(normalize));
  return list(legacyPage?.[field]).map((value) => {
    const normalized = normalize(value);
    const exactSameField = currentNormalized.has(normalized);
    const exactAnywhere = currentAnyNormalized.has(normalized);
    const coverage = tokenCoverage(value, semanticStrings(currentPage));
    return { value, exactSameField, exactAnywhere, ...coverage };
  });
}

async function walk(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...(await walk(full)));
    else if (entry.isFile() && /\.(?:md|mdx)$/i.test(entry.name) && entry.name.toLowerCase() !== 'readme.md') result.push(full);
  }
  return result;
}

function routeForFile(file) {
  const relative = path.relative(DOCS_ROOT, file).split(path.sep).join('/').replace(/\.(?:md|mdx)$/i, '');
  if (relative === 'index') return '/';
  if (relative.endsWith('/index')) return `/${relative.slice(0, -'/index'.length)}/`;
  return `/${relative}/`;
}

function stripInlineMarkup(value) {
  return value
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[\\*_~]/g, '')
    .trim();
}

function headingsFromSource(source) {
  const slugger = new GithubSlugger();
  const headings = [];
  let inFence = false;
  let fenceMarker = null;
  for (const line of source.split(/\r?\n/)) {
    const fence = line.match(/^\s*(```+|~~~+)/);
    if (fence) {
      const marker = fence[1][0];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (marker === fenceMarker) {
        inFence = false;
        fenceMarker = null;
      }
      continue;
    }
    if (inFence) continue;
    const match = line.match(/^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/);
    if (!match) continue;
    const text = stripInlineMarkup(match[1]);
    if (!text) continue;
    headings.push({ text, id: slugger.slug(text) });
  }
  return headings;
}

async function buildHeadingMap() {
  const map = new Map();
  for (const file of await walk(DOCS_ROOT)) {
    const route = routeForFile(file);
    const source = await readFile(file, 'utf8');
    map.set(route, headingsFromSource(source));
  }
  return map;
}

function parseIndex(source, label) {
  const data = YAML.parse(source);
  if (!data || !Array.isArray(data.pages)) throw new Error(`${label}: pages must be an array`);
  return data.pages;
}

const legacySource = execFileSync('git', ['show', `${LEGACY_REF}:${INDEX_PATH}`], { encoding: 'utf8' });
const currentSource = await readFile(INDEX_PATH, 'utf8');
const legacyPages = parseIndex(legacySource, 'legacy');
const currentPages = parseIndex(currentSource, 'current');
const currentByUrl = new Map(currentPages.map((page) => [page.url, page]));
const headingMap = await buildHeadingMap();

const report = {
  legacyRef: LEGACY_REF,
  legacyRoutes: legacyPages.length,
  currentRoutes: currentPages.length,
  missingRoutes: [],
  changedTitles: [],
  missingDescriptions: [],
  fields: { tags: [], aliases: [], link_when: [] },
  anchors: { legacyCount: 0, exactGenerated: 0, missing: [] },
};

for (const legacyPage of legacyPages) {
  const current = currentByUrl.get(legacyPage.url);
  if (!current) {
    report.missingRoutes.push(legacyPage.url);
    continue;
  }

  if (legacyPage.title && normalize(legacyPage.title) !== normalize(current.title)) {
    report.changedTitles.push({ url: legacyPage.url, legacy: legacyPage.title, current: current.title });
  }
  if (legacyPage.description && !current.description) {
    report.missingDescriptions.push({ url: legacyPage.url, legacy: legacyPage.description });
  }

  for (const field of ['tags', 'aliases', 'link_when']) {
    for (const item of fieldAudit(legacyPage, current, field)) {
      if (!item.exactSameField) report.fields[field].push({ url: legacyPage.url, ...item });
    }
  }

  const currentHeadings = headingMap.get(legacyPage.url) ?? [];
  const currentHeadingIds = new Set(currentHeadings.map((heading) => heading.id));
  for (const anchor of list(legacyPage.anchors)) {
    report.anchors.legacyCount += 1;
    if (currentHeadingIds.has(anchor)) {
      report.anchors.exactGenerated += 1;
    } else {
      report.anchors.missing.push({
        url: legacyPage.url,
        anchor,
        headings: currentHeadings.slice(0, 30),
      });
    }
  }
}

for (const field of ['tags', 'aliases', 'link_when']) {
  report.fields[field].sort((a, b) => a.ratio - b.ratio || a.url.localeCompare(b.url) || a.value.localeCompare(b.value));
}

const summary = {};
for (const field of ['tags', 'aliases', 'link_when']) {
  const items = report.fields[field];
  summary[field] = {
    legacyItemsAbsentFromSameField: items.length,
    exactElsewhere: items.filter((item) => item.exactAnywhere).length,
    fullTokenCoverage: items.filter((item) => item.ratio === 1).length,
    partialTokenCoverage: items.filter((item) => item.ratio > 0 && item.ratio < 1).length,
    zeroTokenCoverage: items.filter((item) => item.ratio === 0).length,
    below80Percent: items.filter((item) => item.ratio < 0.8).length,
  };
}
report.summary = summary;

await import('node:fs/promises').then(({ writeFile }) => writeFile('/tmp/content-index-full-audit.json', `${JSON.stringify(report, null, 2)}\n`, 'utf8'));

console.log(JSON.stringify({
  legacyRef: report.legacyRef,
  legacyRoutes: report.legacyRoutes,
  currentRoutes: report.currentRoutes,
  missingRoutes: report.missingRoutes.length,
  changedTitles: report.changedTitles.length,
  missingDescriptions: report.missingDescriptions.length,
  anchors: report.anchors,
  summary,
}, null, 2));

for (const field of ['tags', 'aliases', 'link_when']) {
  const weak = report.fields[field].filter((item) => item.ratio < 1);
  console.log(`\n=== ${field}: ${weak.length} legacy values with incomplete semantic token coverage ===`);
  for (const item of weak.slice(0, 500)) {
    console.log(`${item.url}\t${item.ratio.toFixed(3)}\tmissing=[${item.missing.join(', ')}]\t${item.value}`);
  }
}

if (report.missingRoutes.length > 0) process.exitCode = 2;
