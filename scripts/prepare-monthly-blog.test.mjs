import assert from 'node:assert/strict';
import test from 'node:test';
import { parseMonthlyUpdates, renderMonthlyBlog } from './prepare-monthly-blog.mjs';

const SAMPLE = [
  '---',
  'month: 2026-10',
  'type: content-update-monthly',
  'days: 2',
  '---',
  '',
  '# Обновления за 2026-10',
  '',
  '## 2026-10-01',
  '',
  '[Подневный сборник](../daily/2026-10-01.md)',
  '',
  '- [РВП и ВНЖ](/arrival/boravak/) — Обновили инструкцию о продлении РВП',
  '- [English guide](https://rslive.ru/en/guide/) — Added a guide in English',
  '- [Главная](/) — Обновили главную страницу',
  '',
  '## 2026-10-15',
  '',
  '- [РВП и ВНЖ](/arrival/boravak/) — Уточнили список документов',
  '- [Српска страница](/sr/vodic/) — Објавили водич на српском',
].join('\n');

test('monthly parser accepts canonical relative, absolute and root links', () => {
  const parsed = parseMonthlyUpdates(SAMPLE, '2026-10');
  assert.equal(parsed.days, 2);
  assert.equal(parsed.entries, 5);
  assert.equal(parsed.pages.length, 4);
  const rvp = parsed.pages.find((page) => page.route === '/arrival/boravak/');
  assert.equal(rvp.updates.length, 2);
  assert.equal(rvp.updates[1].summary, 'Уточнили список документов');
  assert(parsed.pages.some((page) => page.route === '/'));
});

test('public blog is chronological, grouped and preserves source-language text', () => {
  const parsed = parseMonthlyUpdates(SAMPLE, '2026-10');
  const result = renderMonthlyBlog(parsed, '2026-11-05', { retrospective: true });
  assert(result.includes('title: "Что изменилось в RSLive за октябрь 2026 года"'));
  assert(result.includes('\ndate: 2026-11-05\n'));
  assert(result.includes('\n---\n\nЗа октябрь'));
  assert(result.includes('зафиксировано 5 изменений на 4 страницах за 2 дня.'));
  assert(result.includes('[РВП и ВНЖ](/arrival/boravak/) — Уточнили список документов.'));
  assert(result.includes('[English guide](/en/guide/) — Added a guide in English.'));
  assert(result.includes('[Српска страница](/sr/vodic/) — Објавили водич на српском.'));
  assert(result.includes('составлен ретроспективно'));
  assert(!result.includes('supabase'));
});

test('rejects internal implementation, foreign links and unfinished archive', () => {
  assert.throws(() => parseMonthlyUpdates(SAMPLE.replace('Обновили инструкцию', 'Supabase backend обновил инструкцию'), '2026-10'), /internal infrastructure/);
  assert.throws(() => parseMonthlyUpdates(SAMPLE.replace('/arrival/boravak/', 'https://example.org/boravak/'), '2026-10'), /Unsupported monthly article link/);
  assert.throws(() => parseMonthlyUpdates(SAMPLE, '2026-09'), /matching month/);
  assert.throws(() => parseMonthlyUpdates(SAMPLE.replace('## 2026-10-15', '## 2026-11-15'), '2026-10'), /outside month/);
  assert.throws(() => parseMonthlyUpdates(SAMPLE.replace('https:\/\/rslive.ru\/en\/guide/', '//evil.example/en/guide/'), '2026-10'), /Unsupported monthly article link/);
});

test('Russian counted forms do not produce broken month summaries', () => {
  const source = parseMonthlyUpdates(SAMPLE, '2026-10');
  const make = (pages, entries, days) => ({
    ...source,
    entries,
    days,
    pages: Array.from({ length: pages }, (_, i) => ({
      title: 'Страница ' + i,
      route: '/map/example-' + i + '/',
      section: 'travel',
      updates: [{ summary: 'Добавили проверенную информацию' }],
    })),
  });
  const a = renderMonthlyBlog(make(101, 222, 21), '2026-11-05');
  assert(a.includes('101 обновлённая страница и 222 записи'));
  assert(a.includes('зафиксировано 222 изменения на 101 странице за 21 день'));
  const b = renderMonthlyBlog(make(153, 126, 30), '2026-11-05');
  assert(b.includes('153 обновлённые страницы и 126 записей'));
  assert(b.includes('зафиксировано 126 изменений на 153 страницах за 30 дней'));
  const c = renderMonthlyBlog(make(17, 17, 1), '2026-11-05');
  assert(c.includes('17 обновлённых страниц и 17 записей'));
  assert(c.includes('за 1 день.'));
});
