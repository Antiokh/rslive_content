import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = 'src/content/docs';
const SITE = 'https://rslive.ru';
const CONCURRENCY = 4;
const RETRIES = 2;
const TIMEOUT_MS = 20_000;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else if (/\.(md|mdx)$/i.test(entry.name)) files.push(fullPath);
  }
  return files.sort();
}

function routeFor(filePath) {
  const relative = path.relative(ROOT, filePath).split(path.sep).join('/');
  const withoutExtension = relative.replace(/\.(md|mdx)$/i, '');
  const parts = withoutExtension.split('/');
  if (parts.at(-1) === 'index') parts.pop();
  return parts.length === 0 ? '/' : `/${parts.join('/')}/`;
}

function updateFrontmatter(filePath, input) {
  const newline = input.includes('\r\n') ? '\r\n' : '\n';
  const hadFinalNewline = input.endsWith('\n');
  const lines = input.replace(/^\uFEFF/, '').split(/\r?\n/);
  if (lines[0] !== '---') throw new Error(`${filePath}: frontmatter is missing`);
  const end = lines.findIndex((line, index) => index > 0 && line === '---');
  if (end === -1) throw new Error(`${filePath}: frontmatter is not closed`);

  const expectedLive = `${SITE}${routeFor(filePath)}`;
  const liveLine = `live: "${expectedLive}"`;
  const frontmatter = lines.slice(1, end);
  const body = lines.slice(end + 1);
  const cleaned = [];
  let insertionIndex = null;
  let hadSource = false;
  let hadLive = false;

  for (const line of frontmatter) {
    if (/^source\s*:/.test(line)) {
      hadSource = true;
      if (insertionIndex === null) insertionIndex = cleaned.length;
      continue;
    }
    if (/^live\s*:/.test(line)) {
      hadLive = true;
      if (insertionIndex === null) insertionIndex = cleaned.length;
      continue;
    }
    cleaned.push(line);
  }

  if (insertionIndex === null) insertionIndex = cleaned.length;
  cleaned.splice(insertionIndex, 0, liveLine);

  const outputLines = ['---', ...cleaned, '---', ...body];
  let output = outputLines.join(newline);
  if (hadFinalNewline && !output.endsWith(newline)) output += newline;

  const normalizedFrontmatter = cleaned.join('\n');
  if ((normalizedFrontmatter.match(/^live\s*:/gm) ?? []).length !== 1) throw new Error(`${filePath}: live field is not unique`);
  if ((normalizedFrontmatter.match(/^source\s*:/gm) ?? []).length !== 0) throw new Error(`${filePath}: source field remains`);
  if (!normalizedFrontmatter.includes(liveLine)) throw new Error(`${filePath}: live URL does not match route`);

  let action = 'unchanged';
  if (output !== input) action = hadSource ? 'replaced' : hadLive ? 'normalized' : 'added';
  return { output, action, expectedLive };
}

function replaceRequired(text, search, replacement, label) {
  if (!text.includes(search)) throw new Error(`README.md: expected block not found: ${label}`);
  return text.replace(search, replacement);
}

async function updateReadme() {
  const filePath = 'README.md';
  let text = await readFile(filePath, 'utf8');
  text = replaceRequired(
    text,
    'keywords: ["ключевая фраза 1", "ключевая фраза 2"]\nsourceCheckedAt: 2026-07-31\n---',
    'keywords: ["ключевая фраза 1", "ключевая фраза 2"]\nsourceCheckedAt: 2026-07-31\nlive: "https://rslive.ru/arrival/new-topic/"\n---',
    'new article template',
  );
  text = replaceRequired(
    text,
    'Каждая статья должна начинаться с frontmatter. Поле `title` обязательно, `description` настоятельно рекомендуется.\n\n```mdx',
    'Каждая статья должна начинаться с frontmatter. Поля `title` и `live` обязательны, `description` настоятельно рекомендуется.\n\n`live` содержит абсолютный канонический URL опубликованной страницы на `https://rslive.ru`. Значение выводится из пути файла: `src/content/docs/index.mdx` соответствует `https://rslive.ru/`, а `src/content/docs/arrival/boravak/index.mdx` — `https://rslive.ru/arrival/boravak/`. Для файлов не с именем `index.mdx` используйте маршрут с именем файла без расширения и завершающим `/`.\n\nПоле `source` относится к завершённой миграции с DokuWiki и больше не используется. Не добавляйте его в новые или существующие статьи; при обнаружении заменяйте его на `live` с фактическим URL страницы.\n\n```mdx',
    'frontmatter requirements',
  );
  text = replaceRequired(
    text,
    'keywords: ["виза в Сербию", "въезд в Сербию", "документы"]\nsourceCheckedAt: 2026-07-31\n---',
    'keywords: ["виза в Сербию", "въезд в Сербию", "документы"]\nsourceCheckedAt: 2026-07-31\nlive: "https://rslive.ru/move/visa/"\n---',
    'frontmatter example',
  );
  text = replaceRequired(
    text,
    'sourceCheckedAt: 2026-07-31\nsource: "описание или путь к исходному материалу"',
    'sourceCheckedAt: 2026-07-31\nlive: "https://rslive.ru/arrival/boravak/"',
    'additional fields example',
  );
  await writeFile(filePath, text, 'utf8');
}

async function checkUrl(url) {
  let lastError = null;
  for (let attempt = 1; attempt <= RETRIES + 1; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; RSLiveMetadataCheck/1.0; +https://rslive.ru/)',
          accept: 'text/html,application/xhtml+xml',
        },
      });
      await response.body?.cancel();
      if (response.status >= 200 && response.status < 400) return { ok: true, status: response.status, finalUrl: response.url };
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    } finally {
      clearTimeout(timer);
    }
    if (attempt <= RETRIES) await new Promise((resolve) => setTimeout(resolve, 1_000 * attempt));
  }
  return { ok: false, error: lastError };
}

const files = await walk(ROOT);
const stats = { replaced: 0, added: 0, normalized: 0, unchanged: 0 };
const pages = [];
const seen = new Map();
for (const filePath of files) {
  const input = await readFile(filePath, 'utf8');
  const { output, action, expectedLive } = updateFrontmatter(filePath, input);
  if (seen.has(expectedLive)) throw new Error(`${filePath}: duplicate live URL also used by ${seen.get(expectedLive)}: ${expectedLive}`);
  seen.set(expectedLive, filePath);
  stats[action] += 1;
  pages.push({ filePath, live: expectedLive });
  if (output !== input) await writeFile(filePath, output, 'utf8');
}
await updateReadme();

const failures = [];
let cursor = 0;
async function worker() {
  while (true) {
    const index = cursor++;
    if (index >= pages.length) return;
    const page = pages[index];
    const result = await checkUrl(page.live);
    if (!result.ok) failures.push({ ...page, ...result });
    else console.log(`OK ${result.status} ${page.live}${result.finalUrl !== page.live ? ` -> ${result.finalUrl}` : ''}`);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
console.log(JSON.stringify({ files: files.length, ...stats }, null, 2));
if (failures.length > 0) {
  console.error(`Failed ${failures.length} live URLs:`);
  for (const failure of failures.sort((a, b) => a.live.localeCompare(b.live))) {
    console.error(`${failure.live}\t${failure.filePath}\t${failure.error}`);
  }
  process.exit(1);
}
console.log(`Verified ${pages.length} published live URLs.`);
