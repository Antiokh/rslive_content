import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import YAML from 'yaml';

function parseArgs(argv) {
  const args = { root: process.cwd(), manifest: null };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--root') {
      if (!argv[index + 1]) throw new Error('--root requires a path.');
      args.root = path.resolve(process.cwd(), argv[index + 1]);
      index += 1;
      continue;
    }
    if (value === '--manifest') {
      if (!argv[index + 1]) throw new Error('--manifest requires a path.');
      args.manifest = path.resolve(process.cwd(), argv[index + 1]);
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${value}`);
  }
  return args;
}

async function walk(dir) {
  const result = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...(await walk(fullPath)));
    else if (entry.isFile() && /\.(?:md|mdx)$/i.test(entry.name) && entry.name.toLowerCase() !== 'readme.md') result.push(fullPath);
  }
  return result.sort();
}

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function routeForFile(root, file) {
  const relative = toPosix(path.relative(path.join(root, 'src', 'content', 'docs'), file));
  const withoutExtension = relative.replace(/\.(?:md|mdx)$/i, '');
  if (withoutExtension === 'index') return '/';
  if (withoutExtension.endsWith('/index')) return `/${withoutExtension.slice(0, -'/index'.length)}/`;
  return `/${withoutExtension}/`;
}

function parseFrontmatter(source, relative) {
  const normalized = source.replace(/^\uFEFF/, '');
  const lines = normalized.split(/\r?\n/);
  if (lines[0]?.trim() !== '---') throw new Error(`${relative}: missing YAML frontmatter.`);
  let closing = -1;
  for (let index = 1; index < lines.length; index += 1) {
    const marker = lines[index].trim();
    if (marker === '---' || marker === '...') {
      closing = index;
      break;
    }
  }
  if (closing === -1) throw new Error(`${relative}: frontmatter is not closed.`);
  const document = YAML.parseDocument(lines.slice(1, closing).join('\n'), { strict: true, uniqueKeys: true });
  if (document.errors.length > 0) throw new Error(`${relative}: ${document.errors[0].message}`);
  const data = document.toJS();
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(`${relative}: frontmatter must be a mapping.`);
  return { lines, closing, data };
}

function normalizeList(value) {
  const values = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
  return [...new Set(values.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim()))];
}

const routeTagRules = [
  [/^\/arrival(?:\/|$)/, ['переезд', 'первые шаги']],
  [/^\/adaptation(?:\/|$)/, ['адаптация', 'жизнь в Сербии']],
  [/^\/integration(?:\/|$)/, ['интеграция']],
  [/^\/gov(?:\/|$)/, ['госуслуги', 'документы']],
  [/^\/edu(?:\/|$)/, ['образование']],
  [/^\/med(?:\/|$)/, ['медицина', 'здравоохранение']],
  [/^\/children(?:\/|$)/, ['дети', 'семья']],
  [/^\/drive(?:\/|$)/, ['транспорт']],
  [/^\/move(?:\/|$)/, ['переезд', 'миграция']],
  [/^\/lifestyle(?:\/|$)/, ['жизнь в Сербии']],
  [/^\/map(?:\/|$)/, ['карта']],
  [/^\/blog(?:\/|$)/, ['блог']],
  [/^\/en(?:\/|$)/, ['английский']],
  [/^\/sr(?:\/|$)/, ['сербский']],
];

function routeTags(route) {
  return routeTagRules.flatMap(([pattern, tags]) => (pattern.test(route) ? tags : []));
}

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

function addTokens(target, value) {
  for (const token of tokens(value)) target.add(token);
}

function isCovered(value, semanticTokens) {
  const valueTokens = [...new Set(tokens(value))];
  return valueTokens.length === 0 || valueTokens.every((token) => semanticTokens.has(token));
}

function yamlListLines(name, values) {
  if (values.length === 0) return [];
  return [`  ${name}:`, ...values.map((value) => `    - ${JSON.stringify(value)}`)];
}

function insertLinking(source, parsed, linking) {
  if (parsed.data.linking !== undefined) throw new Error('Migration expects articles without existing linking frontmatter.');
  const block = [
    'linking:',
    ...yamlListLines('tags', linking.tags),
    ...yamlListLines('aliases', linking.aliases),
    ...yamlListLines('when', linking.when),
  ];
  const lines = [...parsed.lines];
  lines.splice(parsed.closing, 0, ...block);
  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const docsRoot = path.join(args.root, 'src', 'content', 'docs');
  const indexPath = path.join(docsRoot, 'CONTENT_INDEX.yml');
  const legacyDoc = YAML.parseDocument(await readFile(indexPath, 'utf8'), { strict: true, uniqueKeys: true });
  if (legacyDoc.errors.length > 0) throw new Error(`Legacy CONTENT_INDEX.yml: ${legacyDoc.errors[0].message}`);
  const legacyPages = legacyDoc.toJS()?.pages;
  if (!Array.isArray(legacyPages)) throw new Error('Legacy CONTENT_INDEX.yml must contain pages array.');
  const legacyByRoute = new Map(legacyPages.filter((page) => page?.url).map((page) => [page.url, page]));

  const manifest = [];
  let migratedPages = 0;
  let migratedTags = 0;
  let migratedAliases = 0;
  let migratedWhen = 0;

  for (const file of await walk(docsRoot)) {
    const relative = toPosix(path.relative(args.root, file));
    const route = routeForFile(args.root, file);
    const legacy = legacyByRoute.get(route);
    if (!legacy) continue;

    const source = await readFile(file, 'utf8');
    const parsed = parseFrontmatter(source, relative);
    if (parsed.data.linking !== undefined) continue;

    const semanticTokens = new Set();
    addTokens(semanticTokens, parsed.data.title);
    addTokens(semanticTokens, parsed.data.description);
    for (const value of normalizeList(parsed.data.keywords)) addTokens(semanticTokens, value);
    for (const value of routeTags(route)) addTokens(semanticTokens, value);

    const linking = { tags: [], aliases: [], when: [] };
    for (const value of normalizeList(legacy.tags)) {
      if (isCovered(value, semanticTokens)) continue;
      linking.tags.push(value);
      addTokens(semanticTokens, value);
    }
    for (const value of normalizeList(legacy.aliases)) {
      if (isCovered(value, semanticTokens)) continue;
      linking.aliases.push(value);
      addTokens(semanticTokens, value);
    }
    for (const value of normalizeList(legacy.link_when)) {
      if (isCovered(value, semanticTokens)) continue;
      linking.when.push(value);
      addTokens(semanticTokens, value);
    }

    if (linking.tags.length === 0 && linking.aliases.length === 0 && linking.when.length === 0) continue;
    const output = insertLinking(source, parsed, linking);
    await writeFile(file, output, 'utf8');
    manifest.push({ path: relative, content: output });
    migratedPages += 1;
    migratedTags += linking.tags.length;
    migratedAliases += linking.aliases.length;
    migratedWhen += linking.when.length;
  }

  if (args.manifest) {
    await writeFile(args.manifest, JSON.stringify({
      summary: { migratedPages, migratedTags, migratedAliases, migratedWhen },
      files: manifest,
    }), null, 2) + '\n', 'utf8');
  }

  console.log(
    `Linking migration: ${migratedPages} pages; ${migratedTags} tags, ` +
    `${migratedAliases} aliases, ${migratedWhen} contexts added.`,
  );
}

await main();
