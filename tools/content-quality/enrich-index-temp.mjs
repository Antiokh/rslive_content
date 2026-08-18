import { execFileSync } from 'node:child_process';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import YAML from 'yaml';

const root = process.cwd();
const docsRoot = path.join(root, 'src', 'content', 'docs');
const indexPath = path.join(docsRoot, 'CONTENT_INDEX.yml');
const marker = '  # ==== ROUTE COVERAGE (auto-added; enrich semantic metadata when editing) ====';

const rootTags = {
  '404': ['служебная', '404'],
  about: ['RSLive', 'о проекте'],
  adaptation: ['адаптация', 'жизнь в Сербии'],
  arrival: ['переезд', 'первые шаги'],
  'beli-karton': ['регистрация иностранца', 'белый картон'],
  blog: ['блог', 'Сербия'],
  children: ['дети', 'семья'],
  cookie: ['политика сайта', 'конфиденциальность'],
  drive: ['автомобиль', 'транспорт'],
  en: ['английский', 'English'],
  gov: ['госуслуги', 'документы'],
  graph: ['навигация', 'миграция'],
  integration: ['интеграция', 'документы'],
  intro: ['навигация', 'Инструкция по Сербии'],
  lifestyle: ['жизнь в Сербии', 'быт'],
  list: ['навигация', 'структура сайта'],
  m25: ['события', 'Сербия'],
  m26: ['служебная', 'm26'],
  med: ['медицина', 'здравоохранение'],
  move: ['переезд', 'миграция'],
  ru: ['русский', 'навигация'],
  sr: ['сербский', 'српски'],
  uplatnica: ['платежи', 'uplatnica'],
};

const segmentTags = {
  acquiring: 'эквайринг',
  bank: 'банки',
  banks: 'банки',
  boravak: 'РВП',
  business: 'бизнес',
  buy: 'покупка',
  codes: 'коды',
  cookie: 'cookies',
  demographics: 'демография',
  education: 'образование',
  house: 'недвижимость',
  law: 'право',
  license: 'лицензирование',
  mobile: 'связь',
  policy: 'политика',
  russians: 'русские в Сербии',
  school: 'образование',
  taxes: 'налоги',
  travel: 'путешествия',
};

const special = {
  '/404/': {
    tags: ['404', 'ошибка', 'навигация'],
    aliases: ['страница не найдена', 'ошибка 404'],
    link_when: ['пользователь открыл несуществующий URL', 'нужно вернуться к навигации по сайту'],
  },
  '/arrival/banks/': {
    tags: ['банки', 'финансы', 'навигация'],
    aliases: ['банки Сербии', 'банковские счета в Сербии'],
    link_when: ['нужна навигация по банкам и банковским счетам в Сербии'],
  },
  '/cookie/': {
    tags: ['cookies', 'политика сайта', 'конфиденциальность'],
    aliases: ['cookie settings', 'настройки cookies'],
    link_when: ['нужна служебная страница раздела cookies'],
  },
  '/cookie/banner/': {
    tags: ['cookies', 'баннер', 'согласие'],
    aliases: ['cookie banner', 'баннер cookies'],
    link_when: ['нужна информация о баннере cookies и согласии пользователя'],
  },
  '/m26/': {
    tags: ['служебная', 'm26'],
    aliases: ['m26'],
    link_when: ['нужна служебная страница m26'],
  },
  '/ru/': {
    tags: ['русский', 'главная', 'навигация'],
    aliases: ['русская версия', 'RSLive на русском'],
    link_when: ['нужна русская версия или переход к основной редакции RSLive'],
  },
  '/sr/user/petro/': {
    tags: ['сербский', 'профиль', 'Petro'],
    aliases: ['Petro', 'профиль Petro'],
    link_when: ['нужна страница пользователя Petro в сербской редакции'],
  },
};

const uniq = (values) => [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
const yamlScalar = (value) => JSON.stringify(String(value));
const inlineList = (values) => `[${values.map(yamlScalar).join(', ')}]`;

async function walk(dir) {
  const result = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...(await walk(full)));
    else if (entry.isFile() && /\.(?:md|mdx)$/i.test(entry.name)) result.push(full);
  }
  return result;
}

function routeForFile(file) {
  const relative = path.relative(docsRoot, file).split(path.sep).join('/');
  const withoutExtension = relative.replace(/\.(?:md|mdx)$/i, '');
  if (withoutExtension === 'index') return '/';
  if (withoutExtension.endsWith('/index')) return `/${withoutExtension.slice(0, -'/index'.length)}/`;
  return `/${withoutExtension}/`;
}

function frontmatter(source) {
  const normalized = source.replace(/^\uFEFF/, '');
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return {};
  return YAML.parse(match[1]) || {};
}

function cleanDescription(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!?]+$/, '');
}

function genericMetadata(url, page, fm) {
  const title = String(fm.title || page.title || url).trim();
  const description = cleanDescription(fm.description);
  const keywords = Array.isArray(fm.keywords) ? uniq(fm.keywords).slice(0, 7) : [];
  const segments = url.split('/').filter(Boolean);

  const tags = [];
  if (page.locale === 'en') tags.push('английский');
  if (page.locale === 'sr') tags.push('сербский');
  tags.push(...(rootTags[segments[0]] || []));
  for (const segment of segments.slice(1)) {
    if (segmentTags[segment]) tags.push(segmentTags[segment]);
  }
  tags.push(...keywords);
  if (tags.length < 3 && title && !['start', 'banks', 'banner'].includes(title.toLowerCase())) tags.push(title);

  const aliases = [];
  aliases.push(...keywords.slice(0, 3));
  for (const value of [fm.seoTitle, fm.ogTitle]) {
    if (typeof value === 'string' && value.trim() && value.trim() !== title) aliases.push(value.trim());
  }
  if (aliases.length === 0 && title) aliases.push(title);
  const slug = segments.at(-1)?.replace(/[-_]+/g, ' ');
  if (slug && slug.toLowerCase() !== title.toLowerCase() && !aliases.includes(slug)) aliases.push(slug);

  const linkWhen = [];
  if (description) linkWhen.push(`запрос связан с темой: ${description}`);
  if (title) linkWhen.push(`нужна страница «${title}»`);

  return {
    tags: uniq(tags).slice(0, 6),
    aliases: uniq(aliases).slice(0, 4),
    link_when: uniq(linkWhen).slice(0, 2),
  };
}

function enrichBlock(block, metadataByUrl) {
  const firstLine = block.split(/\r?\n/, 1)[0];
  const match = firstLine.match(/^  - url:\s*(\S+)\s*$/);
  if (!match) return block;
  const url = match[1];
  const metadata = metadataByUrl.get(url);
  if (!metadata) return block;

  let result = block;
  result = result.replace(/^    tags: \[\]$/m, `    tags: ${inlineList(metadata.tags)}`);
  result = result.replace(/^    aliases: \[\]$/m, `    aliases: ${inlineList(metadata.aliases)}`);
  result = result.replace(
    /^    link_when: \[\]$/m,
    `    link_when:\n${metadata.link_when.map((value) => `      - ${yamlScalar(value)}`).join('\n')}`,
  );
  return result;
}

const currentText = await readFile(indexPath, 'utf8');
const mainText = execFileSync('git', ['show', 'origin/main:src/content/docs/CONTENT_INDEX.yml'], { encoding: 'utf8' });
const currentIndex = YAML.parse(currentText);
const mainIndex = YAML.parse(mainText);
const mainUrls = new Set((mainIndex.pages || []).map((page) => page?.url).filter(Boolean));
const newPages = (currentIndex.pages || []).filter((page) => page?.url && !mainUrls.has(page.url));

if (newPages.length !== 91) {
  throw new Error(`Expected 91 newly indexed routes, found ${newPages.length}. Re-check branch against main before enriching.`);
}

const files = await walk(docsRoot);
const fileByRoute = new Map(files.map((file) => [routeForFile(file), file]));
const metadataByUrl = new Map();

for (const page of newPages) {
  const file = fileByRoute.get(page.url);
  if (!file) throw new Error(`No content file found for ${page.url}`);
  const fm = frontmatter(await readFile(file, 'utf8'));
  const metadata = special[page.url] || genericMetadata(page.url, page, fm);
  if (!metadata.tags?.length || !metadata.aliases?.length || !metadata.link_when?.length) {
    throw new Error(`Incomplete generated metadata for ${page.url}`);
  }
  metadataByUrl.set(page.url, metadata);
}

const markerIndex = currentText.indexOf(marker);
if (markerIndex < 0) throw new Error('Route coverage marker not found');

const prefix = currentText.slice(0, markerIndex);
const tail = currentText.slice(markerIndex);
const parts = tail.split(/(?=^  - url: )/m);
const enrichedTail = parts.map((part) => enrichBlock(part, metadataByUrl)).join('');
const result = prefix + enrichedTail;

const parsedResult = YAML.parse(result);
const enrichedPages = (parsedResult.pages || []).filter((page) => page?.url && metadataByUrl.has(page.url));
const incomplete = enrichedPages.filter(
  (page) => !Array.isArray(page.tags) || page.tags.length === 0 || !Array.isArray(page.aliases) || page.aliases.length === 0 || !Array.isArray(page.link_when) || page.link_when.length === 0,
);
if (incomplete.length) throw new Error(`Generated empty metadata for: ${incomplete.map((page) => page.url).join(', ')}`);

await writeFile(indexPath, result, 'utf8');

console.log(`new routes enriched: ${enrichedPages.length}`);
console.log(`with tags: ${enrichedPages.filter((page) => page.tags?.length).length}`);
console.log(`with aliases: ${enrichedPages.filter((page) => page.aliases?.length).length}`);
console.log(`with link_when: ${enrichedPages.filter((page) => page.link_when?.length).length}`);
