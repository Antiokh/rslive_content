import { lstat, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import YAML from 'yaml';

function parseArgs(argv) {
  const args = { root: process.cwd(), check: false, auditLegacy: false };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--root') {
      const next = argv[index + 1];
      if (!next) throw new Error('--root requires a path.');
      args.root = path.resolve(process.cwd(), next);
      index += 1;
      continue;
    }
    if (value === '--check') {
      args.check = true;
      continue;
    }
    if (value === '--audit-legacy') {
      args.auditLegacy = true;
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
    else if (entry.isFile() && /\.(?:md|mdx)$/i.test(entry.name) && entry.name.toLowerCase() !== 'readme.md') {
      result.push(fullPath);
    }
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

function parseYaml(source, relative) {
  const document = YAML.parseDocument(source, {
    prettyErrors: true,
    strict: true,
    uniqueKeys: true,
  });
  if (document.errors.length > 0) {
    throw new Error(`${relative}: invalid YAML: ${document.errors[0].message}`);
  }
  return document.toJS();
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

  const data = parseYaml(lines.slice(1, closing).join('\n'), relative);
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`${relative}: frontmatter must be a mapping/object.`);
  }
  return data;
}

function normalizeString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function normalizeStringList(value) {
  const values = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
  const result = [];
  const seen = new Set();
  for (const item of values) {
    const normalized = normalizeString(item);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}

function strictStringList(value, field, relative) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${relative}: ${field} must be a non-empty string array.`);
  }

  const result = [];
  const seen = new Set();
  for (const item of value) {
    const normalized = normalizeString(item);
    if (!normalized) throw new Error(`${relative}: ${field} contains an empty or non-string value.`);
    if (seen.has(normalized)) throw new Error(`${relative}: ${field} contains a duplicate value: ${normalized}`);
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}

function normalizeLinking(value, relative) {
  if (value === undefined) return { aliases: [], when: [] };
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${relative}: linking must be a mapping/object.`);
  }

  const allowed = new Set(['aliases', 'when']);
  const unknown = Object.keys(value).filter((key) => !allowed.has(key));
  if (unknown.length > 0) throw new Error(`${relative}: unknown linking field(s): ${unknown.join(', ')}.`);

  const aliases = strictStringList(value.aliases, 'linking.aliases', relative);
  const when = strictStringList(value.when, 'linking.when', relative);
  if (aliases.length === 0 && when.length === 0) {
    throw new Error(`${relative}: linking must contain aliases or when.`);
  }
  return { aliases, when };
}

function localeForRoute(route) {
  if (route === '/en/' || route.startsWith('/en/')) return 'en';
  if (route === '/sr/' || route.startsWith('/sr/')) return 'sr';
  return null;
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
  return normalizeStringList(routeTagRules.flatMap(([pattern, tags]) => (pattern.test(route) ? tags : [])));
}

function defaultLinkWhen({ title, description, locale }) {
  if (locale === 'en') {
    return [
      description ? `the request is about: ${description}` : null,
      `information is needed about “${title}”`,
    ].filter(Boolean);
  }
  if (locale === 'sr') {
    return [
      description ? `упит је о теми: ${description}` : null,
      `потребне су информације о теми „${title}“`,
    ].filter(Boolean);
  }
  return [
    description ? `запрос связан с темой: ${description}` : null,
    `нужна информация по теме «${title}»`,
  ].filter(Boolean);
}

function compareRoutes(left, right) {
  return left.url < right.url ? -1 : left.url > right.url ? 1 : 0;
}

function buildPage({ route, data, relative }) {
  const title = normalizeString(data.title);
  if (!title) throw new Error(`${relative}: title is required for CONTENT_INDEX.yml.`);

  const locale = normalizeString(data.locale) ?? localeForRoute(route);
  const description = normalizeString(data.description);
  const keywords = normalizeStringList(data.keywords);
  const linking = normalizeLinking(data.linking, relative);
  const explicitTags = normalizeStringList(data.tags);
  const explicitAliases = normalizeStringList(data.aliases);
  const explicitLinkWhen = normalizeStringList(data.link_when);

  const page = {
    url: route,
    title,
    tags: normalizeStringList([...routeTags(route), ...keywords, ...explicitTags]),
    aliases: normalizeStringList([...linking.aliases, ...explicitAliases]),
    link_when: normalizeStringList([
      ...linking.when,
      ...explicitLinkWhen,
      ...defaultLinkWhen({ title, description, locale }),
    ]),
    anchors: [],
  };
  if (locale) page.locale = locale;
  if (description) page.description = description;
  if (keywords.length > 0) page.keywords = keywords;
  return page;
}

async function loadStaticPages(root) {
  const relative = 'tools/content-quality/content-index-static-pages.yml';
  const file = path.join(root, relative);
  const source = await readFile(file, 'utf8').catch((error) => {
    if (error?.code === 'ENOENT') return null;
    throw error;
  });
  if (source === null) return [];

  const data = parseYaml(source, relative);
  if (!data || !Array.isArray(data.pages)) {
    throw new Error(`${relative}: pages must be an array.`);
  }

  return data.pages.map((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error(`${relative}: pages[${index}] must be a mapping/object.`);
    }
    const route = normalizeString(entry.url);
    if (!route || !route.startsWith('/') || !route.endsWith('/')) {
      throw new Error(`${relative}: pages[${index}].url must be an absolute trailing-slash route.`);
    }
    const pageData = { ...entry };
    delete pageData.url;
    return buildPage({ route, data: pageData, relative: `${relative}:pages[${index}]` });
  });
}

async function buildIndex(root) {
  const docsRoot = path.join(root, 'src', 'content', 'docs');
  const files = await walk(docsRoot);
  const pages = [];

  for (const file of files) {
    const relative = toPosix(path.relative(root, file));
    const data = parseFrontmatter(await readFile(file, 'utf8'), relative);
    pages.push(buildPage({ route: routeForFile(root, file), data, relative }));
  }

  pages.push(...(await loadStaticPages(root)));
  pages.sort(compareRoutes);

  const seenRoutes = new Set();
  for (const page of pages) {
    if (seenRoutes.has(page.url)) throw new Error(`CONTENT_INDEX route is duplicated: ${page.url}`);
    seenRoutes.add(page.url);
  }
  return pages;
}

function quote(value) {
  return JSON.stringify(String(value));
}

function flowList(values) {
  return `[${values.map(quote).join(', ')}]`;
}

function serialize(pages) {
  const lines = [
    '# GENERATED FILE — DO NOT EDIT MANUALLY.',
    '# Source of truth: src/content/docs/**/*.{md,mdx} paths and frontmatter.',
    '# Engine-owned non-MDX routes: tools/content-quality/content-index-static-pages.yml.',
    '# Optional curated linking metadata lives in frontmatter.linking.',
    'schema: 2',
    'pages:',
  ];

  for (const page of pages) {
    lines.push(`  - url: ${quote(page.url)}`);
    lines.push(`    title: ${quote(page.title)}`);
    if (page.locale) lines.push(`    locale: ${quote(page.locale)}`);
    if (page.description) lines.push(`    description: ${quote(page.description)}`);
    if (page.keywords?.length) lines.push(`    keywords: ${flowList(page.keywords)}`);
    lines.push(`    tags: ${flowList(page.tags ?? [])}`);
    lines.push(`    aliases: ${flowList(page.aliases ?? [])}`);
    if (page.link_when?.length) {
      lines.push('    link_when:');
      for (const item of page.link_when) lines.push(`      - ${quote(item)}`);
    } else {
      lines.push('    link_when: []');
    }
    lines.push('    anchors: []');
  }

  return `${lines.join('\n')}\n`;
}

const stopWords = new Set([
  'для', 'или', 'как', 'что', 'это', 'при', 'про', 'под', 'над', 'без', 'после', 'перед', 'между', 'через',
  'нужно', 'нужна', 'нужен', 'нужны', 'хочешь', 'ищешь', 'планируешь', 'требуется', 'вопрос', 'вопросы',
  'информация', 'информации', 'понять', 'проверить', 'узнать', 'выбрать', 'получить', 'оформить', 'сделать',
  'сербии', 'сербия', 'србији', 'about', 'information', 'needed', 'request', 'topic', 'the', 'and', 'for', 'with',
  'from', 'this', 'that', 'page', 'нужна', 'материал', 'материала', 'тема', 'теме', 'связан', 'связана',
]);

const russianEndings = [
  'иями', 'ями', 'ами', 'ение', 'ения', 'ений', 'ого', 'ему', 'ому', 'ыми', 'ими', 'ский', 'ская', 'ские', 'ского',
  'ность', 'ности', 'овых', 'евых', 'иях', 'ах', 'ях', 'ов', 'ев', 'ий', 'ый', 'ая', 'яя', 'ое', 'ее', 'ые', 'ие',
  'ам', 'ям', 'ом', 'ем', 'у', 'ю', 'а', 'я', 'ы', 'и', 'е', 'о', 'й', 'ь',
];

function stemToken(token) {
  if (!/[а-яё]/iu.test(token) || token.length < 5) return token;
  for (const ending of russianEndings) {
    if (token.endsWith(ending) && token.length - ending.length >= 3) {
      return token.slice(0, -ending.length);
    }
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

function semanticValues(page) {
  return [
    page?.title,
    page?.description,
    ...(Array.isArray(page?.keywords) ? page.keywords : []),
    ...(Array.isArray(page?.tags) ? page.tags : []),
    ...(Array.isArray(page?.aliases) ? page.aliases : []),
    ...(Array.isArray(page?.link_when) ? page.link_when : []),
  ].filter(Boolean);
}

function semanticTokenSet(page) {
  return new Set(tokens(semanticValues(page).join(' ')));
}

function legacySemanticTokenSet(page) {
  return new Set(tokens([
    ...(Array.isArray(page?.tags) ? page.tags : []),
    ...(Array.isArray(page?.aliases) ? page.aliases : []),
    ...(Array.isArray(page?.link_when) ? page.link_when : []),
  ].join(' ')));
}

function coverage(legacyTokens, candidateTokens) {
  if (legacyTokens.size === 0) return { covered: 0, total: 0, ratio: 1, missing: [] };
  const missing = [...legacyTokens].filter((token) => !candidateTokens.has(token));
  return {
    covered: legacyTokens.size - missing.length,
    total: legacyTokens.size,
    ratio: (legacyTokens.size - missing.length) / legacyTokens.size,
    missing,
  };
}

async function auditLegacy(root, candidatePages) {
  const indexPath = path.join(root, 'src', 'content', 'docs', 'CONTENT_INDEX.yml');
  const legacy = parseYaml(await readFile(indexPath, 'utf8'), 'src/content/docs/CONTENT_INDEX.yml');
  const legacyPages = legacy?.pages;
  if (!Array.isArray(legacyPages)) throw new Error('Legacy CONTENT_INDEX.yml must contain pages array.');

  const candidates = new Map(candidatePages.map((page) => [page.url, page]));
  let missingRoutes = 0;
  let legacyTokenCount = 0;
  let coveredTokenCount = 0;
  const weakPages = [];

  for (const legacyPage of legacyPages) {
    if (!legacyPage || typeof legacyPage.url !== 'string') continue;
    const candidate = candidates.get(legacyPage.url);
    if (!candidate) {
      missingRoutes += 1;
      console.error(`::error file=src/content/docs/CONTENT_INDEX.yml::Generated index misses legacy route ${legacyPage.url}`);
      continue;
    }

    const result = coverage(legacySemanticTokenSet(legacyPage), semanticTokenSet(candidate));
    legacyTokenCount += result.total;
    coveredTokenCount += result.covered;

    if (result.total >= 4 && result.ratio < 0.72) {
      weakPages.push({ url: legacyPage.url, ...result });
    }
  }

  const globalRatio = legacyTokenCount === 0 ? 1 : coveredTokenCount / legacyTokenCount;
  for (const page of weakPages) {
    console.error(
      `::error file=src/content/docs/CONTENT_INDEX.yml::${page.url} keeps ${page.covered}/${page.total} ` +
      `legacy semantic concepts (${Math.round(page.ratio * 100)}%); missing normalized concepts: ${page.missing.join(', ')}`,
    );
  }

  console.log(
    `Legacy audit: ${legacyPages.length} legacy routes, ${candidatePages.length} generated routes; ` +
    `${coveredTokenCount}/${legacyTokenCount} normalized legacy semantic concepts covered ` +
    `(${Math.round(globalRatio * 1000) / 10}%); ${missingRoutes} missing routes; ${weakPages.length} weak pages.`,
  );

  if (candidatePages.length < legacyPages.length || missingRoutes > 0 || globalRatio < 0.9 || weakPages.length > 0) {
    process.exitCode = 1;
  }
}

async function assertSafeOutput(outputPath) {
  const stat = await lstat(outputPath).catch((error) => {
    if (error?.code === 'ENOENT') return null;
    throw error;
  });
  if (stat?.isSymbolicLink()) throw new Error('CONTENT_INDEX.yml must not be a symbolic link.');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outputPath = path.join(args.root, 'src', 'content', 'docs', 'CONTENT_INDEX.yml');
  await assertSafeOutput(outputPath);

  const pages = await buildIndex(args.root);
  const output = serialize(pages);

  if (args.auditLegacy) {
    await auditLegacy(args.root, pages);
    return;
  }

  if (args.check) {
    const current = await readFile(outputPath, 'utf8').catch(() => '');
    if (current !== output) {
      console.error('CONTENT_INDEX.yml is stale. Regenerate it from MDX frontmatter.');
      process.exitCode = 1;
      return;
    }
    console.log('CONTENT_INDEX.yml is up to date.');
    return;
  }

  await writeFile(outputPath, output, 'utf8');
  console.log(`Generated CONTENT_INDEX.yml from ${pages.length} public routes.`);
}

await main();
