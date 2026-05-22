# RSLive content

This repository is the public content mirror for `Antiokh/rslive.ru`.

The files here are synchronized with:

```text
Antiokh/rslive.ru: astro/src/content/docs
Antiokh/rslive_content: src/content/docs
```

Edit content in either repository. The sync workflows copy content both ways.

## File layout

Each page usually lives in a folder with an `index.mdx` file:

```text
src/content/docs/arrival/boravak/index.mdx       -> https://rslive.ru/arrival/boravak/
src/content/docs/move/visa/index.mdx             -> https://rslive.ru/move/visa/
src/content/docs/integration/euprava/index.mdx   -> https://rslive.ru/integration/euprava/
```

Section landing pages are also `index.mdx`:

```text
src/content/docs/move/index.mdx -> https://rslive.ru/move/
```

## Frontmatter

Every article needs frontmatter at the top. `title` is required; `description` is strongly recommended.

```mdx
---
title: "Визы и документы"
description: "Краткое описание страницы для SEO и превью."
keywords: ["виза в Сербию", "ВНЖ Сербия", "документы Сербия"]
---
```

Use `sidebar` when you need a custom label or order in the side menu:

```mdx
---
title: "Контентные компоненты"
description: "Примеры MDX-компонентов для статей."
sidebar:
  label: "Компоненты"
  order: 60
---
```

## Markdown and links

Use normal Markdown/MDX:

```mdx
## Раздел
### Подраздел

Текст со [ссылкой](/arrival/boravak/).

- Пункт списка
- Ещё пункт

[^1]: Источник: https://example.com
```

Internal links should be absolute site-root paths:

```mdx
[боравак](/arrival/boravak/)
```

Avoid Markdown autolinks in angle brackets, because MDX can parse them as JSX:

```mdx
<!-- Bad -->
<http://onelink.to/q9p3q2>

<!-- Good -->
[http://onelink.to/q9p3q2](http://onelink.to/q9p3q2)
```

## Components available in MDX

The main Astro project auto-imports common components. Do not add local imports for these in articles.

Starlight components:

```text
Aside, Badge, Card, CardGrid, FileTree, Icon, LinkButton, LinkCard, Steps, Tabs, TabItem
```

RSLive components:

```text
Accordion, AccordionItem, ContentInclude, Countdown, DiasporaChart, EmbedFrame,
MapEmbed, MermaidGraph, SanityTable, SmartTable, Spoiler, StructTable,
SupabaseTable, UplatnicaGenerator, YouTube
```

Examples:

```mdx
<Aside type="tip" title="Совет">
  Текст подсказки.
</Aside>

<Steps>
1. Первый шаг.
2. Второй шаг.
</Steps>

<YouTube id="NHkCfZjIEV4" title="Название видео" />

<MapEmbed
  src="https://www.google.com/maps/d/embed?mid=..."
  title="Карта"
  caption="Описание карты"
/>

<Spoiler title="Показать подробности">
  Скрытый текст.
</Spoiler>

<Accordion title="Частые вопросы">
  <AccordionItem title="Вопрос">
    Ответ.
  </AccordionItem>
</Accordion>
```

## Tables

Small tables can be normal Markdown:

```mdx
| Город | Адрес | Очередь |
| --- | --- | ---: |
| Белград | Bulevar Zorana Djindjica 64a | 18 |
| Нови-Сад | Bulevar oslobodjenja 56a | 7 |
```

For filtering, sorting, long text, links, and icons, use `SmartTable`:

```mdx
<SmartTable
  id="branches-demo"
  title="Подразделения"
  stretchColumn="address"
  columns={[
    { key: 'name', label: 'Название' },
    { key: 'address', label: 'Адрес', stretch: true },
    { key: 'city', label: 'Город' },
    { key: 'queue', label: 'Очередь', numeric: true },
    { key: 'website', label: 'Сайт', icon: 'website', iconOnly: true },
  ]}
  rows={[
    { name: 'GTC', address: 'Bulevar Zorana Djindjica 64a', city: 'Beograd', queue: 18, website: 'https://example.com' },
  ]}
/>
```

Supported `icon` values:

```text
telegram | whatsapp | website | facebook | email | link
```

For managed data tables, use:

```mdx
<SanityTable tableId="banks_raiffeisen" title="Список подразделений Raiffeisen" limit={100} pageSize={25} />

<SupabaseTable
  table="data_banks_raiffeisen"
  title="Supabase: Raiffeisen"
  select="rid,name,address,city,website"
  order="rid"
  limit={100}
  pageSize={25}
/>

<StructTable schema="banks_raiffeisen" pageSize={25} />
```

## DokuWiki syntax to remove

MDX is stricter than DokuWiki. Replace old syntax before publishing:

```text
[[page:name|Текст]]
{{section>page#anchor}}
+++ Спойлер|
<barcode ... />
<do ...>
<autott>...</autott>
```

Use Markdown or components instead:

```mdx
[Текст](/page/name/)

<Spoiler title="Спойлер">
  Текст.
</Spoiler>
```

## Build check

The site is built from the main repository, not from this content repository:

```powershell
cd D:\Git\rslive.ru\astro
npm run build
```

Cloudflare Pages settings in the main repository:

```text
root directory: astro/
build command: npm run build
build output directory: dist
```

## Sync notes

Only `src/content/docs` is mirrored with the private repository. Repository-level files such as `README.md`, `LICENSE`, `.gitignore`, and `.github/` stay at the root of `rslive_content`.

Sync commits include `[skip content-sync]`. This prevents the two repositories from triggering each other endlessly.
