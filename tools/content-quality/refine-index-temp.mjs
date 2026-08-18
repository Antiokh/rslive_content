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
  codes: 'коды деятельности',
  demographics: 'демография',
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
  for (const entry of await readdir(dir, { withFileTypes: true })) {
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
  const match = source.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  return match ? YAML.parse(match[1]) || {} : {};
}

function cleanDescription(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim().replace(/[.!?]+$/, '');
  if (!text) return '';
  if (text.length > 240) return '';
  if (/----|\bschema:|\bcols:|\bcsv:|\bclass:|<[^>]+>|\*\*|^!\s*/i.test(text)) return '';
  return text;
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

  const linkWhen = [];
  if (description) linkWhen.push(`запрос связан с темой: ${description}`);
  else if (keywords[0]) linkWhen.push(`ищешь информацию по запросу «${keywords[0]}»`);
  if (title) linkWhen.push(`нужна информация по теме «${title}»`);

  return {
    tags: uniq(tags).slice(0, 6),
    aliases: uniq(aliases).slice(0, 4),
    link_when: uniq(linkWhen).slice(0, 2),
  };
}

function replaceBlock(block, metadataByUrl) {
  const firstLine = block.split(/\r?\n/, 1)[0];
  const match = firstLine.match(/^  - url:\s*(\S+)\s*$/);
  if (!match) return block;
  const metadata = metadataByUrl.get(match[1]);
  if (!metadata) return block;

  let result = block;
  result = result.replace(/^    tags: .*$/m, `    tags: ${inlineList(metadata.tags)}`);
  result = result.replace(/^    aliases: .*$/m, `    aliases: ${inlineList(metadata.aliases)}`);
  result = result.replace(
    /^    link_when:\n(?:      - .*\n)+(?=    anchors:)/m,
    `    link_when:\n${metadata.link_when.map((value) => `      - ${yamlScalar(value)}`).join('\n')}\n`,
  );
  return result;
}

const currentText = await readFile(indexPath, 'utf8');
const mainText = execFileSync('git', ['show', 'origin/main:src/content/docs/CONTENT_INDEX.yml'], { encoding: 'utf8' });
const currentIndex = YAML.parse(currentText);
const mainIndex = YAML.parse(mainText);
const mainUrls = new Set((mainIndex.pages || []).map((page) => page?.url).filter(Boolean));
const targetPages = (currentIndex.pages || []).filter((page) => page?.url && !mainUrls.has(page.url));
if (targetPages.length !== 91) throw new Error(`Expected 91 newly indexed routes, found ${targetPages.length}`);

const fileByRoute = new Map((await walk(docsRoot)).map((file) => [routeForFile(file), file]));
const metadataByUrl = new Map();
for (const page of targetPages) {
  const file = fileByRoute.get(page.url);
  if (!file) throw new Error(`No content file found for ${page.url}`);
  const fm = frontmatter(await readFile(file, 'utf8'));
  const metadata = special[page.url] || genericMetadata(page.url, page, fm);
  if (!metadata.tags.length || !metadata.aliases.length || !metadata.link_when.length) {
    throw new Error(`Incomplete metadata for ${page.url}`);
  }
  metadataByUrl.set(page.url, metadata);
}

const markerIndex = currentText.indexOf(marker);
if (markerIndex < 0) throw new Error('Route coverage marker not found');
const prefix = currentText.slice(0, markerIndex);
const tail = currentText.slice(markerIndex);
const result = prefix + tail.split(/(?=^  - url: )/m).map((part) => replaceBlock(part, metadataByUrl)).join('');
const parsed = YAML.parse(result);
const targets = (parsed.pages || []).filter((page) => metadataByUrl.has(page?.url));
const bad = targets.filter((page) =>
  !page.tags?.length || !page.aliases?.length || !page.link_when?.length ||
  page.link_when.some((value) => String(value).length > 280 || /----|\bschema:|\bcols:|\bcsv:|\bclass:|<[^>]+>|\*\*/i.test(String(value)))
);
if (bad.length) throw new Error(`Suspicious metadata remains for: ${bad.map((page) => page.url).join(', ')}`);

await writeFile(indexPath, result, 'utf8');
console.log(`routes refined: ${targets.length}`);
console.log(`non-empty tags: ${targets.filter((page) => page.tags?.length).length}`);
console.log(`non-empty aliases: ${targets.filter((page) => page.aliases?.length).length}`);
console.log(`non-empty link_when: ${targets.filter((page) => page.link_when?.length).length}`);
console.log('suspicious link_when: 0');
