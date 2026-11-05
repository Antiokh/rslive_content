#!/usr/bin/env node
// Create a reviewable Starlight Blog monthly digest from the canonical monthly update archive.
// Standard Node.js only. Existing pages are never overwritten automatically.
import { readFile, mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MONTH_NAMES = [
  'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь',
];
const SECTIONS = [
  { id: 'relocation', name: 'Переезд, документы, работа и транспорт' },
  { id: 'finance', name: 'Бизнес, банки и налоги' },
  { id: 'family', name: 'Медицина, семья и образование' },
  { id: 'everyday', name: 'Повседневная жизнь и адаптация' },
  { id: 'travel', name: 'Города, маршруты, культура и карты' },
  { id: 'languages', name: 'Страницы на английском и сербском' },
  { id: 'other', name: 'Другие материалы' },
];
const INTERNAL_TERMS = /\b(?:supabase(?:-backed)?|postgres(?:ql)?|sqlite|backend|dataset|edge\s+functions?|github\s+actions)\b/i;

function safeText(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('{', '&#123;')
    .replaceAll('}', '&#125;');
}

function safeLinkTitle(value) {
  return safeText(value).replaceAll('[', '\\[').replaceAll(']', '\\]');
}

function groupForPath(route) {
  if (/^\/(?:arrival\/(?:business|bank)\/|gov\/taxes\/)/.test(route)) return 'finance';
  if (/^\/(?:med|edu|children)\//.test(route) || /^\/adaptation\/birth\//.test(route)) return 'family';
  if (/^\/(?:en|sr)\//.test(route)) return 'languages';
  if (/^\/(?:map|lifestyle)\//.test(route)) return 'travel';
  if (/^\/(?:arrival|integration|move|drive)\//.test(route)) return 'relocation';
  if (/^\/(?:adaptation|gov)\//.test(route)) return 'everyday';
  return 'other';
}

export function parseMonthlyUpdates(markdown, month) {
  if (!/^\d{4}-(?:0[1-9]|1[0-2])$/.test(month)) {
    throw new Error('Invalid month: ' + month);
  }
  const fm = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm || !new RegExp('^month:\\s*["\\x27]?' + month + '["\\x27]?\\s*$', 'm').test(fm[1])) {
    throw new Error('Source monthly archive has no matching month frontmatter: ' + month);
  }

  const days = new Set();
  const entries = [];
  const entryRe = /^- \[([^\]]+)\]\(((?:https:\/\/rslive\.ru)?\/(?!\/)[^)]*)\)\s+[—-]\s+(.+)$/;
  let currentDay = null;
  for (const line of markdown.slice(fm[0].length).split('\n')) {
    const heading = line.match(/^## (\d{4}-\d{2}-\d{2})$/);
    if (heading) {
      if (!heading[1].startsWith(month + '-')) throw new Error('Entry outside month: ' + heading[1]);
      currentDay = heading[1];
      days.add(currentDay);
      continue;
    }
    if (!line.startsWith('- [')) continue;
    const match = line.match(entryRe);
    if (!match) throw new Error('Unsupported monthly article link: ' + line.slice(0, 150));
    if (!currentDay) throw new Error('Entry without a dated section: ' + line.slice(0, 100));
    const route = match[2].replace(/^https:\/\/rslive\.ru/, '');
    if (!/^\/(?!\/)[a-zA-Z0-9_/%.-]*\/$/.test(route)) {
      throw new Error('Unsafe or noncanonical route: ' + route);
    }
    if (INTERNAL_TERMS.test(match[1] + ' ' + match[3])) {
      throw new Error('Public monthly summary contains internal infrastructure at ' + route);
    }
    entries.push({ date: currentDay, title: match[1], route, summary: match[3].trim() });
  }

  if (!entries.length) throw new Error('Monthly archive has no article updates: ' + month);
  const byRoute = new Map();
  for (const entry of entries) {
    const existing = byRoute.get(entry.route);
    if (existing) existing.updates.push(entry);
    else byRoute.set(entry.route, {
      route: entry.route,
      title: entry.title,
      updates: [entry],
      section: groupForPath(entry.route),
    });
  }
  return {
    month,
    days: days.size,
    entries: entries.length,
    pages: [...byRoute.values()],
  };
}

function monthLabel(month) {
  const number = Number(month.slice(5, 7));
  return MONTH_NAMES[number - 1] + ' ' + month.slice(0, 4) + ' года';
}

function renderSection(group) {
  const lines = ['## ' + group.name, ''];
  const highlights = group.pages.slice(0, 4);
  for (const page of highlights) {
    // The last update gives the latest published state of the page for this month.
    const last = page.updates[page.updates.length - 1];
    const text = safeText(last.summary).replace(/[.\s]+$/, '');
    lines.push('- [' + safeLinkTitle(page.title) + '](' + page.route + ') — ' + text + '.');
  }
  const rest = group.pages.slice(highlights.length);
  if (rest.length) {
    lines.push('', '**Также обновлены:**', '');
    for (let i = 0; i < rest.length; i += 3) {
      lines.push('- ' + rest.slice(i, i + 3)
        .map((page) => '[' + safeLinkTitle(page.title) + '](' + page.route + ')').join(' · '));
    }
  }
  return lines.join('\n');
}

export function renderMonthlyBlog(parsed, publicationDate, options = {}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publicationDate)) {
    throw new Error('Invalid publication date: ' + publicationDate);
  }
  const month = parsed.month;
  const title = 'Что изменилось в RSLive за ' + monthLabel(month);
  const description = 'Обзор изменений статей RSLive за ' + monthLabel(month)
    + ': ' + parsed.pages.length + ' обновлённых страниц и ' + parsed.entries + ' записей в редакционной сводке.';
  const route = '/blog/updates-' + month + '/';
  const frontmatter = [
    '---',
    'title: ' + JSON.stringify(title),
    'description: ' + JSON.stringify(description),
    'excerpt: ' + JSON.stringify(description),
    'ogSticker: logo',
    'keywords: ["обновления RSLive", "что нового в Инструкции по Сербии", "новые статьи о Сербии"]',
    'date: ' + publicationDate,
    'authors:',
    '  - antiokh',
    'live: ' + JSON.stringify('https://rslive.ru' + route),
    '---',
    '',
  ];
  const start = 'За ' + monthLabel(month) + ' в редакционной сводке зафиксировано '
    + parsed.entries + ' изменений на ' + parsed.pages.length + ' страницах за '
    + parsed.days + ' ' + (parsed.days % 10 === 1 && parsed.days % 100 !== 11 ? 'день'
      : parsed.days % 10 >= 2 && parsed.days % 10 <= 4 && !(parsed.days % 100 >= 12 && parsed.days % 100 <= 14) ? 'дня' : 'дней')
    + '. Ниже — обзор по темам. Каждая ссылка ведёт к соответствующей статье, а не к служебным материалам редакции.';
  const note = 'Этот выпуск подготовлен по архиву редакционных изменений. Он показывает, что было добавлено или пересмотрено в течение месяца; дата выпуска не означает, что все приведённые в статьях нормы, цены и процедуры повторно проверены сегодня.';
  const groups = SECTIONS.map((section) => ({
    ...section,
    pages: parsed.pages.filter((page) => page.section === section.id),
  })).filter((group) => group.pages.length);
  const body = [
    start,
    '',
    note,
    '',
    ...groups.flatMap((group) => [renderSection(group), '']),
  ];
  if (options.retrospective) {
    body.push('**Архивный выпуск:** составлен ретроспективно, после окончания указанного календарного месяца.', '');
  }
  return frontmatter.join('\n') + body.join('\n').trimEnd() + '\n';
}

function todayInBelgrade() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Belgrade', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

function argsFromCli(args) {
  const values = { dryRun: false, retrospective: false };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--month' || arg === '--date') {
      if (!args[i + 1]) throw new Error('Missing value after ' + arg);
      values[arg.slice(2)] = args[++i];
    } else if (arg === '--dry-run') values.dryRun = true;
    else if (arg === '--retrospective') values.retrospective = true;
    else throw new Error('Unknown argument: ' + arg);
  }
  return values;
}

async function main() {
  const opts = argsFromCli(process.argv.slice(2));
  const now = todayInBelgrade();
  const month = opts.month ?? (now.slice(5, 7) === '01'
    ? String(Number(now.slice(0, 4)) - 1) + '-12'
    : now.slice(0, 4) + '-' + String(Number(now.slice(5, 7)) - 1).padStart(2, '0'));
  if (!/^\d{4}-(?:0[1-9]|1[0-2])$/.test(month)) throw new Error('Invalid month');
  if (month >= now.slice(0, 7)) throw new Error('Month is not closed in Europe/Belgrade: ' + month);
  const published = opts.date ?? now;
  const source = path.join(root, 'docs', 'updates', 'monthly', month + '.md');
  const target = path.join(root, 'src', 'content', 'docs', 'blog', 'updates-' + month, 'index.mdx');
  const archive = await readFile(source, 'utf8');
  const result = renderMonthlyBlog(parseMonthlyUpdates(archive, month), published, opts);
  if (opts.dryRun) {
    process.stdout.write(result);
    return;
  }
  try {
    await access(target);
    console.log('Monthly blog page already exists, leaving it unchanged: ' + path.relative(root, target));
    return;
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, result, { encoding: 'utf8', flag: 'wx' });
  console.log('Generated monthly blog page: ' + path.relative(root, target));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error); process.exitCode = 1; });
}
