import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { compile } from '@mdx-js/mdx';
import remarkGfm from 'remark-gfm';
import YAML from 'yaml';

const root = process.cwd();
const docsRoot = path.join(root, 'src', 'content', 'docs');
const updatesRoot = path.join(root, 'docs', 'updates');
const contentIndexPath = path.join(docsRoot, 'CONTENT_INDEX.yml');
const stickerRoot = path.join(docsRoot, 'about', 'stickers', 'assets', 'svg');

let errorCount = 0;
let warningCount = 0;

const toPosix = (value) => value.split(path.sep).join('/');
const relativeToRoot = (value) => toPosix(path.relative(root, value));

function escapeCommand(value) {
  return String(value)
    .replaceAll('%', '%25')
    .replaceAll('\r', '%0D')
    .replaceAll('\n', '%0A');
}

function report(level, file, line, message) {
  if (level === 'error') errorCount += 1;
  else warningCount += 1;

  const location = line ? `,line=${Math.max(1, line)}` : '';
  console.log(
    `::${level} file=${escapeCommand(file)}${location}::${escapeCommand(message)}`,
  );
}

async function walk(dir, predicate = () => true) {
  const result = [];
  let entries;

  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error?.code === 'ENOENT') return result;
    throw error;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...(await walk(fullPath, predicate)));
    else if (entry.isFile() && predicate(fullPath)) result.push(fullPath);
  }

  return result.sort();
}

function routeForFile(file) {
  const relative = toPosix(path.relative(docsRoot, file));
  const withoutExtension = relative.replace(/\.(?:md|mdx)$/i, '');

  if (withoutExtension === 'index') return '/';
  if (withoutExtension.endsWith('/index')) {
    return `/${withoutExtension.slice(0, -'/index'.length)}/`;
  }
  return `/${withoutExtension}/`;
}

function splitFrontmatter(source, file) {
  const normalized = source.replace(/^\uFEFF/, '');
  const lines = normalized.split(/\r?\n/);

  if (lines[0]?.trim() !== '---') {
    report('error', file, 1, 'MDX page must start with YAML frontmatter (---).');
    return { data: {}, body: normalized, bodyStartLine: 1 };
  }

  let closing = -1;
  for (let index = 1; index < lines.length; index += 1) {
    const marker = lines[index].trim();
    if (marker === '---' || marker === '...') {
      closing = index;
      break;
    }
  }

  if (closing === -1) {
    report('error', file, 1, 'Frontmatter is not closed with --- or ....');
    return { data: {}, body: normalized, bodyStartLine: 1 };
  }

  const rawFrontmatter = lines.slice(1, closing).join('\n');
  const document = YAML.parseDocument(rawFrontmatter, {
    prettyErrors: true,
    strict: true,
    uniqueKeys: true,
  });

  for (const issue of document.errors) {
    const line = issue?.linePos?.[0]?.line ? issue.linePos[0].line + 1 : 2;
    report('error', file, line, `Invalid frontmatter YAML: ${issue.message}`);
  }

  for (const issue of document.warnings) {
    const line = issue?.linePos?.[0]?.line ? issue.linePos[0].line + 1 : 2;
    report('warning', file, line, `Frontmatter YAML warning: ${issue.message}`);
  }

  let data = {};
  if (document.errors.length === 0) {
    const parsed = document.toJS();
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) data = parsed;
    else report('error', file, 2, 'Frontmatter must be a YAML mapping/object.');
  }

  return {
    data,
    body: lines.slice(closing + 1).join('\n'),
    bodyStartLine: closing + 2,
  };
}

function maskCode(text) {
  const lines = text.split('\n');
  let fence = null;

  return lines
    .map((line) => {
      const match = line.match(/^\s*(`{3,}|~{3,})/);
      if (match) {
        const marker = match[1][0];
        if (fence === null) fence = marker;
        else if (fence === marker) fence = null;
        return '';
      }
      if (fence !== null) return '';
      return line.replace(/`[^`\n]*`/g, '');
    })
    .join('\n');
}

function lineAt(text, index) {
  return text.slice(0, index).split('\n').length;
}

function checkFootnotes(file, body, bodyStartLine) {
  const masked = maskCode(body);
  const definitions = new Map();
  const references = [];
  const definitionPattern = /^\s*\[\^([^\]]+)\]:/gm;

  for (const match of masked.matchAll(definitionPattern)) {
    const label = match[1];
    const line = bodyStartLine + lineAt(masked, match.index) - 1;
    definitions.set(label, line);
    if (!/^\d+$/.test(label)) {
      report('error', file, line, `Footnote label must be numeric: [^${label}].`);
    }
  }

  const referencePattern = /\[\^([^\]]+)\]/g;
  for (const match of masked.matchAll(referencePattern)) {
    const lineStart = masked.lastIndexOf('\n', match.index - 1) + 1;
    const before = masked.slice(lineStart, match.index);
    const after = masked.slice(match.index + match[0].length);
    if (/^\s*$/.test(before) && after.startsWith(':')) continue;

    const label = match[1];
    const line = bodyStartLine + lineAt(masked, match.index) - 1;
    references.push({ label, line });
    if (!/^\d+$/.test(label)) {
      report('error', file, line, `Footnote reference must be numeric: [^${label}].`);
    }
  }

  const referencedLabels = new Set(references.map((item) => item.label));

  for (const reference of references) {
    if (!definitions.has(reference.label)) {
      report(
        'error',
        file,
        reference.line,
        `Footnote [^${reference.label}] has no definition.`,
      );
    }
  }

  for (const [label, line] of definitions) {
    if (!referencedLabels.has(label)) {
      report('error', file, line, `Footnote definition [^${label}] is never referenced.`);
    }
  }

  const firstNumericReferences = [];
  const seen = new Set();
  for (const reference of references) {
    if (!/^\d+$/.test(reference.label) || seen.has(reference.label)) continue;
    seen.add(reference.label);
    firstNumericReferences.push(reference);
  }

  firstNumericReferences.forEach((reference, index) => {
    const expected = String(index + 1);
    if (reference.label !== expected) {
      report(
        'error',
        file,
        reference.line,
        `Footnotes must be numbered by first appearance: expected [^${expected}], found [^${reference.label}].`,
      );
    }
  });
}

const allowedDynamicRoutes = [
  /^\/api(?:\/|$)/,
  /^\/edit\/?$/,
  /^\/methodology(?:\/|$)/,
  /^\/\.well-known(?:\/|$)/,
];

function checkLinks(file, body, bodyStartLine, routeSet) {
  const masked = maskCode(body);

  for (const match of masked.matchAll(/<https?:\/\/[^>\s]+>/g)) {
    const line = bodyStartLine + lineAt(masked, match.index) - 1;
    report(
      'error',
      file,
      line,
      'Markdown autolinks in angle brackets are not allowed; use [URL](URL).',
    );
  }

  const linkPattern = /(?<!!)\[[^\]\n]*\]\(([^)\n]+)\)/g;
  for (const match of masked.matchAll(linkPattern)) {
    let destination = match[1].trim();
    if (destination.startsWith('<')) {
      const closing = destination.indexOf('>');
      if (closing !== -1) destination = destination.slice(1, closing);
    } else {
      destination = destination.split(/\s+/)[0];
    }

    if (!destination || destination.startsWith('#') || destination.startsWith('{')) continue;
    if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(destination)) continue;
    if (destination.startsWith('//')) continue;

    const line = bodyStartLine + lineAt(masked, match.index) - 1;

    if (!destination.startsWith('/')) {
      report(
        'error',
        file,
        line,
        `Internal link must use an absolute root path: ${destination}`,
      );
      continue;
    }

    const pathname = destination.split(/[?#]/, 1)[0];
    if (!pathname) continue;
    if (allowedDynamicRoutes.some((pattern) => pattern.test(pathname))) continue;
    if (/\.[a-z0-9]{1,8}$/i.test(pathname)) continue;

    if (!routeSet.has(pathname)) {
      if (!pathname.endsWith('/') && routeSet.has(`${pathname}/`)) {
        report(
          'error',
          file,
          line,
          `Internal route must use its canonical trailing slash: ${pathname}/`,
        );
      } else {
        report('error', file, line, `Internal route does not exist in src/content/docs: ${pathname}`);
      }
    }
  }
}

async function checkMdxFile(file, routeSet, stickerNames) {
  const relative = relativeToRoot(file);
  const source = await readFile(file, 'utf8');
  const { data, body, bodyStartLine } = splitFrontmatter(source, relative);
  const route = routeForFile(file);

  if (typeof data.title !== 'string' || data.title.trim() === '') {
    report('error', relative, 2, 'Frontmatter must contain a non-empty title.');
  }

  if (!data.description) {
    report('warning', relative, 2, 'Frontmatter has no description (allowed for legacy pages).');
  }

  if (Object.hasOwn(data, 'source')) {
    report('warning', relative, 2, 'Legacy frontmatter field source is deprecated; use live.');
  }

  if (typeof data.live === 'string') {
    const expected = `https://rslive.ru${route}`;
    if (data.live !== expected) {
      report('error', relative, 2, `Frontmatter live must match the file route: ${expected}`);
    }
  }

  if (typeof data.ogSticker === 'string' && !stickerNames.has(data.ogSticker)) {
    report('error', relative, 2, `Unknown ogSticker: ${data.ogSticker}`);
  }

  try {
    await compile({ path: relative, value: body }, { remarkPlugins: [remarkGfm] });
  } catch (error) {
    const parserLine = error?.position?.start?.line ?? 1;
    report(
      'error',
      relative,
      bodyStartLine + parserLine - 1,
      `Invalid MDX syntax: ${error?.reason || error?.message || String(error)}`,
    );
  }

  checkFootnotes(relative, body, bodyStartLine);
  checkLinks(relative, body, bodyStartLine, routeSet);
}

async function checkContentIndex(routeSet) {
  const relative = relativeToRoot(contentIndexPath);
  const source = await readFile(contentIndexPath, 'utf8');
  const document = YAML.parseDocument(source, {
    prettyErrors: true,
    strict: true,
    uniqueKeys: true,
  });

  for (const issue of document.errors) {
    const line = issue?.linePos?.[0]?.line ?? 1;
    report('error', relative, line, `Invalid CONTENT_INDEX.yml: ${issue.message}`);
  }

  if (document.errors.length > 0) return;

  const data = document.toJS();
  if (!Array.isArray(data?.pages)) {
    report('error', relative, 1, 'CONTENT_INDEX.yml must contain a pages array.');
    return;
  }

  const seen = new Set();
  for (const page of data.pages) {
    const url = page?.url;
    if (typeof url !== 'string') {
      report('error', relative, 1, 'Every CONTENT_INDEX page entry must contain a string url.');
      continue;
    }
    if (seen.has(url)) report('error', relative, 1, `Duplicate CONTENT_INDEX URL: ${url}`);
    seen.add(url);

    if (!url.startsWith('/') || (url !== '/' && !url.endsWith('/'))) {
      report('error', relative, 1, `CONTENT_INDEX URL must be an absolute canonical route: ${url}`);
    }
    if (!routeSet.has(url)) {
      report('error', relative, 1, `CONTENT_INDEX URL has no matching content file: ${url}`);
    }
  }
}

async function checkUpdateJson() {
  const jsonFiles = await walk(updatesRoot, (file) => file.endsWith('.json'));
  for (const file of jsonFiles) {
    const relative = relativeToRoot(file);
    try {
      JSON.parse(await readFile(file, 'utf8'));
    } catch (error) {
      report('error', relative, 1, `Invalid JSON: ${error.message}`);
    }
  }
}

async function loadStickerNames() {
  const names = new Set();
  let entries = [];
  try {
    entries = await readdir(stickerRoot, { withFileTypes: true });
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.svg')) names.add(entry.name.slice(0, -4));
  }
  return names;
}

async function main() {
  await access(docsRoot);

  const mdxFiles = await walk(
    docsRoot,
    (file) => /\.(?:md|mdx)$/i.test(file) && path.basename(file).toLowerCase() !== 'readme.md',
  );
  const routeSet = new Set(mdxFiles.map(routeForFile));
  const stickerNames = await loadStickerNames();

  console.log(`Checking ${mdxFiles.length} content pages...`);

  await checkContentIndex(routeSet);
  await checkUpdateJson();
  for (const file of mdxFiles) await checkMdxFile(file, routeSet, stickerNames);

  console.log(`Content quality: ${errorCount} error(s), ${warningCount} warning(s).`);
  if (errorCount > 0) process.exitCode = 1;
}

await main();
