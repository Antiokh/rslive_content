# `MapEmbed`: подробная инструкция для авторов контента

Эта инструкция описывает **как использовать `MapEmbed` в статьях `rslive_content`**. Реализация компонента, renderer, provider normalization, PWA/offline lifecycle и допустимые props находятся в `Antiokh/rslive.ru` и имеют приоритет при расхождении с этим документом.

Перед изменением синтаксиса компонента сверяйте актуальный `main` движка:

- `astro/src/components/MapEmbed.astro` — публичный MDX API и выбор renderer;
- `astro/config/map-renderers.config.mjs` — `auto | maplibre | embed` и staged rollout policy;
- `astro/config/maps.config.mjs` — Google / PlanPlus / Yandex normalization и registry first-party sources;
- `astro/config/map-points.config.mjs` — first-party point contract и консервативное извлечение координат;
- `astro/config/map-marker-icons.config.mjs` — допустимые semantic marker icons;
- `astro/config/map-regions.config.mjs` — допустимые `regions` и `SerbiaMap`;
- `astro/docs/components/map-embed.md` — внутренняя архитектура и lifecycle renderer.

`MapEmbed` автоимпортируется. Локальный `import` в обычной статье не нужен.

## Когда использовать `MapEmbed`

Используйте `MapEmbed`, если в статье нужно показать:

- внешнюю карту Google, PlanPlus или Yandex;
- зарегистрированную тематическую карту, для которой движок уже имеет first-party snapshot;
- одну достоверно известную точку через first-party MapLibre;
- карту с выбранными региональными offline packs.

Не используйте обычный `<iframe>` для карты. `EmbedFrame` предназначен для других iframe, а `MapEmbed` добавляет карту-специфичный lifecycle, offline fallback, renderer selection и direct-open link.

Карта должна **дополнять текстовый адрес или описание места**, а не заменять их.

## Быстрый выбор варианта

Ориентируйтесь на данные, которыми располагает статья:

```text
Есть только provider URL
  -> <MapEmbed src="..." />

Есть точные longitude/latitude
  -> <MapEmbed point={{ ... }} />

Есть provider URL и точные координаты
  -> <MapEmbed src="..." point={{ ... }} />
     src остаётся direct-open provider link
     point используется как first-party geometry

Нужно обязательно показать provider iframe
  -> renderer="embed"

Нужно обязательно использовать существующий first-party renderer
  -> renderer="maplibre"
```

Не превращайте provider ID, адресную строку или центр viewport в координаты объекта без достоверного источника.

## Публичный API

Текущий контракт:

```text
src?: string
point?: {
  longitude: number
  latitude: number
  title?: string
  description?: string
  markerColor?: "#RRGGBB"
  markerIcon?: "place" | "office" | "home" | "food" | "culture" | "warning"
  provenanceUrl?: string
}
title?: string = "Карта"
caption?: string
aspect?: string = "16 / 10"
height?: string
renderer?: "auto" | "maplibre" | "embed" = "auto"
offlineSrc?: string
regions?: string[]
SerbiaMap?: boolean
debug?: boolean = false
debugState?: "auto" | "online" | "offline-loaded" | "offline-cold" | "offline-map"
```

Нужен хотя бы один источник данных:

- `src`; или
- `point`.

`renderer="embed"` требует настоящий `src`: first-party point без внешнего provider нельзя принудительно превратить в external iframe.

## `src`: внешний provider/source

`src` — canonical URL внешней карты или её embed-версии. Provider и renderer — разные вещи: `src` описывает происхождение данных, а `renderer` — как карта будет показана.

Обычный пример:

```mdx
<MapEmbed
  src="https://www.google.com/maps/d/u/0/embed?mid=1mxkFBhCULwjecdQUWUIfE1BAQahFG6I&ehbc=2E312F"
  title="Танцевальные залы"
  caption="Пользовательская карта танцевальных залов"
/>
```

Реальный пример находится в `src/content/docs/map/dance/index.mdx`.

### Какие providers распознаёт движок

Текущий normalizer различает:

- Google My Maps;
- обычные Google Maps embed URL;
- Google Street View embed;
- PlanPlus object map URL;
- Yandex Maps frame URL;
- Yandex `map-widget/v1` / constructor URL;
- прочие URL как generic external source.

Сам факт, что provider распознан, **не означает наличие first-party geometry или offline companion**.

Для allowlisted Google My Maps движок может иметь `offlineMapRegistry` entry и first-party thematic snapshot. Для PlanPlus, обычного Google embed и Yandex provider identity сама по себе не создаёт координаты.

## `point`: first-party одиночная точка

Если координаты объекта известны достоверно, предпочтителен явный first-party point contract.

```mdx
<MapEmbed
  point={{
    longitude: 20.4117708,
    latitude: 44.8225635,
    title: 'Uprava za strance Beograd',
    description: 'Omladinskih brigada 1',
    markerColor: '#e05252',
    markerIcon: 'office',
  }}
  title="Uprava za strance Beograd"
/>
```

Point проходит build-time validation:

- `longitude`: от `-180` до `180`;
- `latitude`: от `-90` до `90`;
- `title`: строка до 160 символов;
- `description`: строка до 1200 символов;
- `markerColor`: только `#RRGGBB`;
- `markerIcon`: только key из локального registry;
- `provenanceUrl`: абсолютный `http://` или `https://` URL.

Не передавайте `lat/lng` строкой одного поля и не меняйте порядок: публичный object использует отдельные `longitude` и `latitude`.

Если point находится не в Белграде, обычно явно задайте подходящий `regions`, иначе сработает продуктовый default Belgrade + Serbia.

### Point + внешний источник

Если у объекта есть внешний provider URL, передайте `src` вместе с `point`:

```mdx
<MapEmbed
  src="https://www.planplus.rs/mapa/objekat/4760/15"
  point={{
    longitude: 20.4117708,
    latitude: 44.8225635,
    title: 'Uprava za strance Beograd',
    description: 'Omladinskih brigada 1',
    markerIcon: 'office',
  }}
  title="Uprava za strance Beograd"
/>
```

В этом случае first-party point рисуется тем же MapLibre renderer, а внешний `src` остаётся direct-open provider URL у `MapEmbed`.

Для popup внутри first-party renderer действует отдельная provenance-ссылка: если `point.provenanceUrl` задан явно, используется он; если не задан, при наличии `src` компонент подставляет `src` как provenance автоматически. Если `src` отсутствует, direct-open ведёт на `point.provenanceUrl`, а при отсутствии и его — на same-origin renderer.

Это предпочтительнее попытки извлечь координаты из opaque provider ID.

## Автоматическое извлечение координат из URL

Extractor намеренно консервативен.

Автоматически поддерживается только Google URL, где `q=` или `query=` **целиком содержит точную пару `lat,lng`**. Например:

```text
https://www.google.com/maps?q=44.8225635,20.4117708&output=embed
https://www.google.com/maps/search/?api=1&query=44.8225635,20.4117708
```

Не извлекаются автоматически:

- Google text address;
- Google `pb` embed payload;
- Google Street View panorama payload;
- PlanPlus object ID;
- Yandex `ll` — это центр viewport, а не доказанная точка объекта;
- Yandex frame / constructor opaque ID.

Если координаты известны из надёжного источника, передайте `point` явно. Не расширяйте URL parser в статье и не угадывайте координаты.

## `renderer`: `auto`, `maplibre`, `embed`

### `renderer="auto"` — обычный выбор

Это default. В большинстве статей prop вообще не указывайте.

Текущая staged policy различает два случая.

**Доверенный first-party point:**

```text
auto -> MapLibre online и offline
```

**Registry-backed external source, например allowlisted Google My Maps:**

```text
online                         -> provider embed
offline после online-загрузки  -> уже загруженный provider iframe сохраняется
cold offline                   -> first-party MapLibre v2 companion
```

Глобальный `auto -> MapLibre` для registry-backed external sources пока выключен release guard в движке (`MAP_RENDERER_AUTO_POLICY.registryFirstParty = false`) до отдельной browser/mobile QA. Автор статьи не должен обходить этот guard вручную без причины.

Для внешнего source без first-party companion уже загруженный provider iframe также не уничтожается только из-за события `offline`; при cold offline компонент показывает штатную локальную заглушку.

### `renderer="maplibre"`

Используйте, когда first-party data contract уже существует и именно MapLibre нужен как presentation online/offline.

```mdx
<MapEmbed
  src="https://www.google.com/maps/d/u/0/embed?mid=1mxkFBhCULwjecdQUWUIfE1BAQahFG6I&ehbc=2E312F"
  renderer="maplibre"
  title="Танцевальные залы"
/>
```

Если движок не может получить trustworthy same-origin first-party renderer/data contract, такой вызов должен завершиться ошибкой конфигурации, а не угадыванием данных.

Для явного `point` `renderer="maplibre"` обычно избыточен: `auto` уже выбирает MapLibre.

### `renderer="embed"`

Используйте как escape hatch, если принципиально нужен UI внешнего provider:

```mdx
<MapEmbed
  src="https://www.planplus.rs/mapa/objekat/4760/15"
  renderer="embed"
  title="Uprava za strance Beograd — PlanPlus"
/>
```

Если у этого `src` есть first-party companion, он всё ещё может использоваться как cold-offline fallback. Online presentation при этом остаётся provider iframe.

## OpenFreeMap и offline: что должен знать автор

First-party renderer `/map-renderer-v2/` использует один MapLibre runtime:

```text
online  -> OpenFreeMap Bright / Fiord как optional basemap enhancement
offline -> first-party local geography из сохранённых regional packs
```

OpenFreeMap не является обязательной cold-offline dependency. При external style error/timeout renderer возвращается к local style.

Автор статьи **не указывает OpenFreeMap URL**, не вызывает `map.setStyle()` и не управляет basemap style напрямую. Это ответственность движка.

## `regions` и `SerbiaMap`

`regions` выбирает городские geographic packs. Допустимы только:

```text
belgrade
belgrade-ext
novi-sad
nis
subotica
```

`SerbiaMap` отдельно включает country-level карту Сербии. `serbia` и `serbia-overview` не являются значениями `regions`.

### Product default

Если `regions` не указан или пуст:

```text
regions = ['belgrade']
SerbiaMap = true
```

То есть обычный вызов подготавливает Белград + обзор Сербии.

### Только один регион

```mdx
<MapEmbed
  src="https://example.com/map"
  title="Объекты в Нише"
  regions={['nis']}
/>
```

При явном `regions` автоматический country layer выключается.

### Регион + SerbiaMap

```mdx
<MapEmbed
  src="https://example.com/map"
  title="Объекты в Нише"
  regions={['nis']}
  SerbiaMap
/>
```

### Белград и пригороды

`belgrade-ext` — отдельный target, а не alias `belgrade`:

```mdx
<MapEmbed
  src="https://example.com/map"
  title="Объекты в Белграде и пригородах"
  regions={['belgrade-ext']}
/>
```

### Несколько регионов

```mdx
<MapEmbed
  src="https://example.com/map"
  title="Объекты в Белграде и Нови-Саде"
  regions={['belgrade', 'novi-sad']}
/>
```

При нескольких регионах renderer использует Serbia movement boundary, чтобы пользователь мог перемещаться между ними.

Не придумывайте region id. Unknown id должен ломать сборку.

## Semantic marker icons

`markerIcon` задаётся **внутри `point`**, не как top-level prop `MapEmbed`.

Текущий allowlist:

| key | назначение |
| --- | --- |
| `place` | место |
| `office` | учреждение |
| `home` | жильё |
| `food` | еда и заведения |
| `culture` | культура |
| `warning` | предупреждение |

Пример:

```mdx
<MapEmbed
  point={{
    longitude: 20.46,
    latitude: 44.81,
    title: 'Пример учреждения',
    markerIcon: 'office',
    markerColor: '#3366cc',
  }}
/>
```

Иконка — semantic key локального first-party SVG registry. Не передавайте URL картинки, имя произвольного SVG, Font Awesome class или remote icon URL.

`markerColor` и `markerIcon` независимы: цвет не выбирает semantic icon автоматически.

## Yandex и PlanPlus

Yandex и PlanPlus можно использовать как обычный `src`, если нужен внешний provider embed.

Пример PlanPlus из текущего контента:

```mdx
<MapEmbed
  src="https://www.planplus.rs/mapa/objekat/4760/15"
  title="Uprava za strance Beograd — PlanPlus"
  caption="Карта объекта на PlanPlus"
/>
```

Для Yandex движок распознаёт штатные frame / map-widget / constructor формы, но opaque Yandex ID не считается geometry contract. Если нужна first-party point-карта, передайте проверенные координаты через `point`.

То же правило действует для PlanPlus object ID: стабильный provider ID полезен для provenance, но не заменяет longitude/latitude.

## `offlineSrc`: только исключение

Обычно `offlineSrc` **не нужен**.

Для зарегистрированных external sources renderer URL создаёт engine registry. Для first-party point `/map-renderer-v2/?point=...` строится автоматически.

Используйте `offlineSrc` только когда:

- same-origin renderer/data route уже реально существует в движке;
- его назначение и параметры проверены по текущему коду;
- автоматический registry/point contract по объективной причине не подходит.

Не пишите вручную предполагаемые `/map-renderer-v2/?source=...` URL и не придумывайте `sourceId` в статье. Если источник должен стать registry-backed, сначала добавьте и проверьте registry/data contract в `Antiokh/rslive.ru` и при необходимости snapshot в `map-data/**`.

Внешний `offlineSrc` не является допустимым fallback: offline renderer должен быть same-origin.

## `title`, `caption`, `aspect`, `height`

Всегда задавайте осмысленный `title`, даже если технически есть default. Он нужен для accessibility iframe и используется renderer в fullscreen UI.

`caption` поясняет источник или назначение карты. Не дублируйте в нём весь окружающий абзац.

`aspect` и `height` меняйте только при реальной layout-причине. Обычный default:

```text
aspect = "16 / 10"
```

## `debug` и `debugState`

`debug` и `debugState` предназначены для диагностических страниц движка и воспроизводимых renderer-тестов.

Не используйте их в обычных опубликованных статьях.

Поддерживаемые debug states:

```text
auto
online
offline-loaded
offline-cold
offline-map
```

Если редакционная задача требует диагностировать lifecycle, делайте это в `Antiokh/rslive.ru` на debug route, а не оставляйте debug UI в статье.

## Реальные паттерны в текущем контенте

Перед новым вызовом полезно свериться с существующими страницами:

- `src/content/docs/map/dance/index.mdx` — registry-backed Google My Maps;
- `src/content/docs/map/blacklist/index.mdx` — ещё одна registry-backed Google My Maps;
- `src/content/docs/map/upravazastrance/index.mdx` — PlanPlus и Google Street View provider embeds рядом с текстовыми адресами.

Эти примеры показывают синтаксис существующего контента, но не заменяют текущий component contract: если старый вызов отличается от актуальной инструкции, ориентируйтесь на код движка и этот документ.

## Когда нужны изменения в `map-data/**`

`MapEmbed` usage и map data acquisition — разные задачи.

Если статья только использует существующий provider или existing point contract, `map-data/**` менять не нужно.

Если нужен новый или обновлённый first-party regional/thematic snapshot, следуйте `map-data/README.md`:

- сохраняйте last-known-good;
- не запускайте Overpass из production build или браузера;
- обновляйте snapshot вручную;
- проверяйте `node scripts/check-map-data.mjs`;
- не считайте наличие файла автоматическим включением в renderer registry/PWA.

## Что не делать

Не делайте следующие вещи:

- не добавляйте локальный `import MapEmbed`;
- не вставляйте обычный `<iframe>` вместо `MapEmbed`;
- не пишите `renderer="google"`, `renderer="yandex"` или `renderer="planplus"`;
- не передавайте `markerIcon` как URL;
- не передавайте `markerColor` top-level prop;
- не используйте `serbia` в `regions`;
- не угадывайте координаты из адреса, PlanPlus ID, Yandex `ll`, frame ID или Google `pb` payload;
- не придумывайте `offlineSrc`, `sourceId`, renderer route или region id;
- не включайте `debug` в обычную статью;
- не удаляйте текстовый адрес только потому, что появилась карта.

## Checklist перед PR

Перед публикацией вызова `MapEmbed` проверьте:

- [ ] `title` описывает содержимое карты;
- [ ] есть `src`, `point` или оба;
- [ ] если используется `point`, longitude/latitude подтверждены источником и не угаданы;
- [ ] `markerColor` имеет формат `#RRGGBB`;
- [ ] `markerIcon` входит в текущий allowlist;
- [ ] `regions` содержит только существующие ids;
- [ ] `SerbiaMap` используется отдельно от `regions`;
- [ ] `renderer="maplibre"` выбран только при существующем first-party contract;
- [ ] `renderer="embed"` имеет provider `src`;
- [ ] `offlineSrc` не придуман вручную;
- [ ] в обычной статье нет `debug`/`debugState`;
- [ ] рядом с картой остаётся текстовая информация, необходимая читателю без JS/iframe;
- [ ] при новом snapshot отдельно выполнены проверки из `map-data/README.md`.

## Связанные документы

- `docs/MDX_COMPONENTS.md` — краткая справка по всем MDX-компонентам;
- `map-data/README.md` — ручное обновление first-party картографических snapshots;
- `PROJECT_CONTEXT.md` — разделение ответственности content/engine;
- `Antiokh/rslive.ru: astro/docs/components/map-embed.md` — внутренняя архитектура renderer и regression contract.
