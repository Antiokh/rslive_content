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

  const document = YAML.parseDocument(lines.slice(1, closing).join('\n'), {
    prettyErrors: true,
    strict: true,
    uniqueKeys: true,
  });
  if (document.errors.length > 0) {
    throw new Error(`${relative}: invalid frontmatter YAML: ${document.errors[0].message}`);
  }

  const data = document.toJS();
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
    throw new Error(`${relative}: linking.${field} must be a non-empty string array.`);
  }

  const result = [];
  const seen = new Set();
  for (const item of value) {
    const normalized = normalizeString(item);
    if (!normalized) throw new Error(`${relative}: linking.${field} contains an empty or non-string value.`);
    if (seen.has(normalized)) throw new Error(`${relative}: linking.${field} contains a duplicate value: ${normalized}`);
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

  const aliases = strictStringList(value.aliases, 'aliases', relative);
  const when = strictStringList(value.when, 'when', relative);
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

async function buildIndex(root) {
  const docsRoot = path.join(root, 'src', 'content', 'docs');
  const files = await walk(docsRoot);
  const pages = [];

  for (const file of files) {
    const relative = toPosix(path.relative(root, file));
    const data = parseFrontmatter(await readFile(file, 'utf8'), relative);
    const route = routeForFile(root, file);
    const title = normalizeString(data.title);
    if (!title) throw new Error(`${relative}: frontmatter title is required for CONTENT_INDEX.yml.`);

    const locale = localeForRoute(route);
    const description = normalizeString(data.description);
    const keywords = normalizeStringList(data.keywords);
    const linking = normalizeLinking(data.linking, relative);
    const linkWhen = normalizeStringList([
      ...linking.when,
      ...defaultLinkWhen({ title, description, locale }),
    ]);

    const page = {
      url: route,
      title,
      tags: keywords,
      aliases: linking.aliases,
      link_when: linkWhen,
      anchors: [],
    };
    if (locale) page.locale = locale;
    if (description) page.description = description;
    if (keywords.length > 0) page.keywords = keywords;

    pages.push(page);
  }

  pages.sort(compareRoutes);
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
  'для', 'или', 'как', 'что', 'это', 'при', 'про', 'под', 'над', 'без', 'после', 'перед', 'между',
  'нужно', 'нужна', 'нужен', 'нужны', 'хочешь', 'ищешь', 'планируешь', 'требуется', 'вопрос', 'вопросы',
  'информация', 'информации', 'понять', 'проверить', 'узнать', 'выбрать', 'получить', 'оформить', 'сербии',
  'сербия', 'србији', 'about', 'information', 'needed', 'request', 'topic', 'the', 'and', 'for', 'with', 'from',
]);

function tokens(value) {
  return String(value ?? '')
    .toLocaleLowerCase('ru-RU')
    .replaceAll('ё', 'е')
    .normalize('NFKC')
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length >= 2 && !stopWords.has(token));
}

function coverageScore(legacyValue, candidateValues) {
  const legacyTokens = [...new Set(tokens(legacyValue))];
  if (legacyTokens.length === 0) return 1;
  const candidateTokens = new Set(tokens(candidateValues.join(' ')));
  const covered = legacyTokens.filter((token) => candidateTokens.has(token)).length;
  return covered / legacyTokens.length;
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

function classifyMissing(field, value, candidate) {
  const score = coverageScore(value, semanticValues(candidate));
  const tokenCount = tokens(value).length;
  const threshold = field === 'link_when' ? 0.55 : tokenCount <= 1 ? 1 : 0.67;
  return score < threshold ? { field, value, score } : null;
}

async function auditLegacy(root, candidatePages) {
  const indexPath = path.join(root, 'src', 'content', 'docs', 'CONTENT_INDEX.yml');
  const legacyDocument = YAML.parseDocument(await readFile(indexPath, 'utf8'), {
    prettyErrors: true,
    strict: true,
    uniqueKeys: true,
  });
  if (legacyDocument.errors.length > 0) {
    throw new Error(`Legacy CONTENT_INDEX.yml is invalid: ${legacyDocument.errors[0].message}`);
  }
  const legacyPages = legacyDocument.toJS()?.pages;
  if (!Array.isArray(legacyPages)) throw new Error('Legacy CONTENT_INDEX.yml must contain pages array.');

  const candidates = new Map(candidatePages.map((page) => [page.url, page]));
  let missingRoutes = 0;
  let legacyItems = 0;
  let missingItems = 0;

  for (const legacy of legacyPages) {
    if (!legacy || typeof legacy.url !== 'string') continue;
    const candidate = candidates.get(legacy.url);
    if (!candidate) {
      missingRoutes += 1;
      console.error(`::error file=src/content/docs/CONTENT_INDEX.yml::Generated index misses legacy route ${legacy.url}`);
      continue;
    }

    const missing = [];
    for (const field of ['tags', 'aliases', 'link_when']) {
      const values = Array.isArray(legacy[field]) ? legacy[field] : [];
      legacyItems += values.length;
      for (const value of values) {
        const item = classifyMissing(field, value, candidate);
        if (item) missing.push(item);
      }
    }

    if (missing.length > 0) {
      missingItems += missing.length;
      const details = missing
        .map(({ field, value, score }) => `${field}=${JSON.stringify(value)} (${Math.round(score * 100)}%)`)
        .join('; ');
      console.error(`::error file=src/content/docs/CONTENT_INDEX.yml::${legacy.url} loses legacy semantic context: ${details}`);
    }
  }

  console.log(
    `Legacy audit: ${legacyPages.length} legacy routes, ${candidatePages.length} generated routes, ` +
    `${legacyItems - missingItems}/${legacyItems} legacy semantic items covered; ` +
    `${missingRoutes} missing routes, ${missingItems} insufficiently covered semantic items.`,
  );

  if (missingRoutes > 0 || missingItems > 0) {
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
  console.log(`Generated CONTENT_INDEX.yml from ${pages.length} content pages.`);
}

await main();
