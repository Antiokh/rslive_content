import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';

import YAML from 'yaml';

const LEGACY_REF = process.env.LEGACY_REF || '01a48adab04c28e12f7e06648d615af21b3cb3e2';
const INDEX_PATH = 'src/content/docs/CONTENT_INDEX.yml';

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

function coverage(value, candidateStrings) {
  const source = [...new Set(tokens(value))];
  const candidate = new Set(tokens(candidateStrings.join(' ')));
  const missing = source.filter((token) => !candidate.has(token));
  return {
    total: source.length,
    covered: source.length - missing.length,
    ratio: source.length === 0 ? 1 : (source.length - missing.length) / source.length,
    missing,
  };
}

function bestSingleCoverage(value, candidateStrings) {
  let best = { ratio: 0, covered: 0, total: [...new Set(tokens(value))].length, missing: [], candidate: null };
  for (const candidate of candidateStrings) {
    const result = coverage(value, [candidate]);
    if (result.ratio > best.ratio || (result.ratio === best.ratio && result.covered > best.covered)) {
      best = { ...result, candidate };
    }
  }
  if (candidateStrings.length === 0) best = { ...coverage(value, []), candidate: null };
  return best;
}

function phraseAudit(value, currentPage, sameFieldValues = []) {
  const normalized = normalize(value);
  const currentSemantic = semanticStrings(currentPage);
  const global = coverage(value, currentSemantic);
  const single = bestSingleCoverage(value, currentSemantic);
  return {
    value,
    exactSameField: sameFieldValues.some((item) => normalize(item) === normalized),
    exactAnywhere: currentSemantic.some((item) => normalize(item) === normalized),
    globalRatio: global.ratio,
    globalMissing: global.missing,
    bestSingleRatio: single.ratio,
    bestSingleCandidate: single.candidate,
    bestSingleMissing: single.missing,
  };
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

const report = {
  legacyRef: LEGACY_REF,
  legacyRoutes: legacyPages.length,
  currentRoutes: currentPages.length,
  missingRoutes: [],
  anchors: { legacyCount: 0 },
  titles: [],
  fields: { tags: [], aliases: [], link_when: [] },
};

for (const legacyPage of legacyPages) {
  const current = currentByUrl.get(legacyPage.url);
  if (!current) {
    report.missingRoutes.push(legacyPage.url);
    continue;
  }

  for (const anchor of list(legacyPage.anchors)) report.anchors.legacyCount += 1;

  if (legacyPage.title && normalize(legacyPage.title) !== normalize(current.title)) {
    report.titles.push({ url: legacyPage.url, currentTitle: current.title, ...phraseAudit(legacyPage.title, current) });
  }

  for (const field of ['tags', 'aliases', 'link_when']) {
    const currentField = list(current[field]);
    for (const value of list(legacyPage[field])) {
      const item = phraseAudit(value, current, currentField);
      if (!item.exactSameField) report.fields[field].push({ url: legacyPage.url, ...item });
    }
  }
}

const summary = {};
for (const field of ['tags', 'aliases', 'link_when']) {
  const items = report.fields[field];
  summary[field] = {
    absentFromSameField: items.length,
    exactElsewhere: items.filter((item) => item.exactAnywhere).length,
    globalFullCoverage: items.filter((item) => item.globalRatio === 1).length,
    singleFieldFullCoverage: items.filter((item) => item.bestSingleRatio === 1).length,
    singleFieldPartialCoverage: items.filter((item) => item.bestSingleRatio > 0 && item.bestSingleRatio < 1).length,
    singleFieldZeroCoverage: items.filter((item) => item.bestSingleRatio === 0).length,
  };
}
summary.titles = {
  changed: report.titles.length,
  exactElsewhere: report.titles.filter((item) => item.exactAnywhere).length,
  singleFieldFullCoverage: report.titles.filter((item) => item.bestSingleRatio === 1).length,
  singleFieldPartialCoverage: report.titles.filter((item) => item.bestSingleRatio > 0 && item.bestSingleRatio < 1).length,
  singleFieldZeroCoverage: report.titles.filter((item) => item.bestSingleRatio === 0).length,
};
report.summary = summary;

await writeFile('/tmp/content-index-full-audit.json', `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(JSON.stringify({
  legacyRef: report.legacyRef,
  legacyRoutes: report.legacyRoutes,
  currentRoutes: report.currentRoutes,
  missingRoutes: report.missingRoutes.length,
  legacyAnchors: report.anchors.legacyCount,
  summary,
}, null, 2));

for (const category of ['titles', 'tags', 'aliases', 'link_when']) {
  const items = category === 'titles' ? report.titles : report.fields[category];
  const weak = items.filter((item) => item.bestSingleRatio < 1);
  console.log(`\n=== ${category}: ${weak.length} phrases not fully represented in any single current metadata value ===`);
  for (const item of weak) {
    console.log(`${item.url}\t${item.bestSingleRatio.toFixed(3)}\tlegacy=${item.value}\tbest=${item.bestSingleCandidate ?? ''}\tmissing=[${item.bestSingleMissing.join(', ')}]`);
  }
}

if (report.missingRoutes.length > 0) process.exitCode = 2;
