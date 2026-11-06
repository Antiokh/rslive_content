# Картографические данные RSLive

Этот каталог хранит first-party snapshots карт для `rslive.ru`.

По умолчанию OSM и вручную полученные KML/GeoJSON snapshots обновляются только после проверки человеком. Для изменяемых provider-managed источников действуют два отдельных scheduled LKG-процесса: **Yandex Constructor** (Blacklist Serbia, GitHub Actions) и **пилот Google My Maps** (Supabase Cron/HTTP/Edge, сейчас включён только MID «Ковчега»). Оба используют fail-closed проверки и сохраняют предыдущий рабочий snapshot при ошибке. Старый Google KML importer при Astro build пока работает независимо и не отключён.

## Главное правило

`map-data/**` — last-known-good source data. Не заменяйте рабочий snapshot неполной или непроверенной выгрузкой.

Для runtime-карт допускаются два представления:

- `*.geojson` — обязательный читаемый source of truth;
- `*.geojson.gz` — необязательный заранее сжатый transport/cache artifact.

Gzip **не генерируется в GitHub Actions, content-sync или production build**. Карты меняются редко, поэтому при необходимости сожмите конкретный файл один раз вручную и закоммитьте sibling `.geojson.gz` вместе с обновлённым GeoJSON. Если gzip отсутствует, runtime использует raw GeoJSON.

Ручной helper находится в этом репозитории:

```bash
node scripts/build-map-data.mjs --only=belgrade
node scripts/build-map-data.mjs --only=belgrade --check
```

Без `--only` helper обрабатывает весь runtime-набор. Это локальная команда; автоматические workflow её не вызывают.

Основная проверка перед публикацией:

```bash
node scripts/check-map-data.mjs
```

Если рядом с source уже лежит `.geojson.gz`, validator дополнительно проверит, что он распаковывается байт-в-байт в исходный GeoJSON и действительно меньше source.

## Что здесь хранится

Штатные runtime source-файлы:

```text
map-data/
  core/
    serbia-overview.geojson
    serbia-regions.geojson

  packs/
    cities/
      belgrade.geojson
      belgrade-ext.geojson
      novi-sad.geojson
      nis.geojson
      subotica.geojson

  basemaps/
    belgrade-lite.geojson

  snapshots/
    google-mymaps/
      <mid>.kml
      <mid>.geojson
      <mid>.json

    yandex-constructor/
      <constructor-id>.geojson
      <constructor-id>.json
```

В каталоге могут быть и вспомогательные acquisition/reference datasets. Само наличие GeoJSON не делает его runtime layer: публикация задаётся явным allowlist в `.github/workflows/notify-rslive-ru.yml` и registry в `Antiokh/rslive.ru`.

`serbia-regions.geojson` — build-only административная геометрия для точного country filter; content-sync зеркалит её в `astro/data/map-boundaries/`, а не как selectable runtime layer в `/maps/**`.

## MapEmbed contract

У `MapEmbed` два селектора:

```text
regions    -> региональные/городские паки
SerbiaMap  -> карта Сербии
```

Допустимые target regions:

```text
belgrade
belgrade-ext
novi-sad
nis
subotica
```

`belgrade` — обычная городская карта Белграда.

`belgrade-ext` — расширенная Белградская зона: широкий Белград с пригородами и внешними муниципалитетами; Обреновац — один из примеров покрытия, а не единственная территория файла. Это отдельный target region, который можно явно указать в `regions`.

`serbia-overview` — историческое имя source-файла, а не публичный id компонента. Карта страны включается только через `SerbiaMap`.

Product default:

```mdx
<MapEmbed src="…" />
```

→ Serbia + Belgrade.

Явный регион отключает автоматическую Serbia:

```mdx
<MapEmbed src="…" regions={['belgrade-ext']} />
```

→ расширенный Белград без country layer.

```mdx
<MapEmbed src="…" regions={['nis']} SerbiaMap />
```

→ Serbia + Niš.

Если указано несколько регионов, общий movement boundary — Сербия.

Слово «optional» относится к **загрузке конкретному пользователю**, а не к наличию source. Поддерживаемый source-набор включает Serbia и все пять target region GeoJSON.

## Что зеркалируется в engine

Runtime allowlist:

```text
map-data/core/serbia-overview.geojson
map-data/core/serbia-overview.geojson.gz        # только если закоммичен вручную

map-data/packs/cities/belgrade.geojson
map-data/packs/cities/belgrade.geojson.gz       # optional
map-data/packs/cities/belgrade-ext.geojson
map-data/packs/cities/belgrade-ext.geojson.gz   # optional
map-data/packs/cities/novi-sad.geojson
map-data/packs/cities/novi-sad.geojson.gz       # optional
map-data/packs/cities/nis.geojson
map-data/packs/cities/nis.geojson.gz             # optional
map-data/packs/cities/subotica.geojson
map-data/packs/cities/subotica.geojson.gz       # optional
```

Legacy `basemaps/` и `snapshots/` синхронизируются отдельно. Поэтому validated Yandex LKG из `map-data/snapshots/yandex-constructor/` после обычного content-sync становится engine snapshot fallback.

`serbia-regions.geojson` и другие reference/acquisition datasets не должны попадать в runtime автоматически.

## Безопасный рабочий цикл

Для вручную обслуживаемых OSM/Google snapshots:

1. Обновите `main` и создайте отдельную ветку.
2. Запустите baseline-проверку:

   ```bash
   node scripts/check-map-data.mjs
   ```

3. Получите новый raw export во временный каталог, а не поверх LKG.
4. Визуально проверьте выбранную территорию и состав объектов.
5. Нормализуйте raw export в RSLive GeoJSON contract.
6. Замените только целевой source `*.geojson`.
7. Повторно запустите `node scripts/check-map-data.mjs`.
8. Сравните source с предыдущей версией:

   ```bash
   git diff --stat
   git diff -- map-data/
   ```

9. Если source резко уменьшился, перепроверьте acquisition: это может быть частичный ответ Overpass.
10. Если нужен gzip, сожмите только изменённый region:

   ```bash
   node scripts/build-map-data.mjs --only=<region>
   node scripts/build-map-data.mjs --only=<region> --check
   ```

11. Закоммитьте GeoJSON и, при наличии, соответствующий `.geojson.gz` одним PR.
12. После merge content-sync валидирует source и зеркалирует allowlist. Он не запускает acquisition и не расходует Actions-время на сжатие карт.

При любой ошибке источника сохраняйте предыдущий LKG.

## Карта Сербии

Источник — OpenStreetMap через Overpass Turbo.

Source:

```text
map-data/core/serbia-overview.geojson
```

Публичный компонент включает его через `SerbiaMap`. Новые root metadata должны использовать:

```text
regionId: "serbia"
```

Validator временно принимает старое `regionId: "serbia-overview"` для существующего snapshot.

### Детализация SerbiaMap

Включаем только:

- `motorway`, `trunk`, `primary` с `ref`;
- именованные реки;
- подписи `city` и `town`.

Не включаем buildings, addresses, POI, secondary/tertiary/residential/service roads, public transport graph, routing graph, tiles, terrain и 3D.

### Overpass Turbo: Serbia

```overpass
[out:json][timeout:60];
area["ISO3166-1"="RS"]["admin_level"="2"]->.country;
(
  way["highway"~"motorway|trunk|primary"]["ref"](area.country);
  way["waterway"="river"]["name"](area.country);
  node["place"~"city|town"](area.country);
);
out geom;
```

Порядок:

1. Выполните запрос в Overpass Turbo.
2. Визуально проверьте покрытие всей Сербии.
3. `Export` → `GeoJSON`.
4. Сохраните raw export вне runtime source path.
5. Нормализуйте:
   - road → `category: "road"`, `class` из `highway`, `name`, `ref`;
   - river → `category: "water-line"`, `class: "river"`, `name`;
   - city/town → `category: "label"`, `class` из `place`, `name`, при наличии `population`.
6. Root `properties`:

   ```json
   {
     "regionId": "serbia",
     "regionTitle": "Сербия",
     "kind": "country",
     "bbox": [18.75, 42.2, 23.05, 46.2],
     "attribution": "© OpenStreetMap contributors · ODbL",
     "snapshotAt": "YYYY-MM-DD"
   }
   ```

Минимальный threshold:

```text
roads >= 50
rivers >= 2
labels >= 8
```

## Городские и региональные паки

Штатно поддерживаем:

| Регион | regionId | renderer bbox |
| --- | --- | --- |
| Белград | `belgrade` | `[20.18, 44.68, 20.68, 44.97]` |
| Белград и пригороды | `belgrade-ext` | `[19.8, 44.35, 21.0, 45.15]` |
| Нови-Сад | `novi-sad` | `[19.65, 45.15, 20.1, 45.42]` |
| Ниш | `nis` | `[21.75, 43.2, 22.15, 43.42]` |
| Суботица | `subotica` | `[19.5, 45.98, 19.86, 46.23]` |

`bbox` — только renderer/view constraint. **Не используйте его как границу OSM acquisition.** Для `belgrade-ext` прямоугольник намеренно широкий: он нужен, чтобы не запирать пользователя в центральном Белграде, и не является утверждением об административной границе.

### Граница выгрузки

Обычные city snapshots получайте по административной области через `geocodeArea`.

```text
Belgrade, Serbia
Novi Sad, Serbia
Niš, Serbia
Subotica, Serbia
```

После выполнения обязательно визуально проверьте выбранную административную область: Nominatim/Overpass может подобрать одноимённую сущность другого уровня.

`belgrade-ext` — отдельный широкий snapshot. Его текущий LKG сохраняется как самостоятельный target region; при следующем обновлении сначала зафиксируйте и визуально проверьте правило расширенного покрытия, затем нормализуйте новый export под `regionId: "belgrade-ext"`.

### Детализация региона

Включаем:

- `highway=motorway|trunk|primary|secondary|tertiary`;
- `waterway=river|canal`;
- `natural=water`;
- `leisure=park`;
- `landuse=forest|recreation_ground`;
- `place=city|town|suburb|quarter`.

Не включаем residential/living_street/service/track/path/footway/cycleway, buildings, addresses, POI, public transport graph, parking, indoor и routing graph.

Карта нужна для географического контекста, а не как офлайн-навигация.

### Overpass Turbo: city template

Для обычного Белграда:

```overpass
[out:json][timeout:90];
{{geocodeArea:Belgrade, Serbia}}->.city;
(
  way["waterway"~"river|canal"](area.city);
  way["natural"="water"](area.city);
  way["leisure"="park"](area.city);
  way["landuse"~"forest|recreation_ground"](area.city);
  way["highway"~"motorway|trunk|primary|secondary|tertiary"](area.city);
  node["place"~"city|town|suburb|quarter"](area.city);
);
out geom;
```

Для остальных обычных городов меняется только `geocodeArea`.

### Нормализация GeoJSON

Mapping:

```text
highway                          -> category="road", class=<highway>
waterway=river|canal             -> category="water-line", class=<waterway>
natural=water                    -> category="water-area"
leisure=park                     -> category="green", class="park"
landuse=forest                   -> category="green", class="forest"
landuse=recreation_ground        -> category="green", class="recreation_ground"
place=city|town|suburb|quarter   -> category="label", class=<place>
```

Сохраняйте `name`, `ref`, `population`, когда они есть.

Для нового/обновлённого region source root metadata должны соответствовать target id, например:

```json
{
  "regionId": "belgrade-ext",
  "regionTitle": "Белград и пригороды",
  "kind": "city",
  "country": "serbia",
  "bbox": [19.8, 44.35, 21.0, 45.15],
  "optionalPack": true,
  "attribution": "© OpenStreetMap contributors · ODbL",
  "snapshotAt": "YYYY-MM-DD"
}
```

Текущий `belgrade-ext` может сохранять старый `regionId: "belgrade"` до следующего ручного refresh; validators временно принимают оба значения, чтобы не переписывать resource только ради metadata.

Минимальный threshold каждого target pack:

```text
roads >= 20
water features >= 2
```

## Gzip transport/cache

Gzip — необязательная ручная оптимизация.

```bash
node scripts/build-map-data.mjs --only=belgrade-ext
node scripts/build-map-data.mjs --only=belgrade-ext --check
```

Инварианты:

- gzip level 9;
- `gunzip(.gz)` должен дать source bytes exactly;
- gzip должен быть меньше source;
- source и его `.gz` обновляются вместе;
- если `.gz` отсутствует, runtime использует raw GeoJSON.

Engine manifest публикует gzip transport только когда sibling-файл реально синхронизирован. Клиент предпочитает gzip при поддержке `DecompressionStream('gzip')`, иначе загружает raw source.

## Google My Maps snapshots

Один логический snapshot состоит из трёх source-файлов:

```text
<MID>.kml
<MID>.geojson
<MID>.json
```

Нельзя обновлять только один из трёх.

Best-effort KML URL:

```text
https://www.google.com/maps/d/kml?mid=<MID>&forcekml=1
```

Это не гарантированный публичный API. При 403/CORS/ошибке/аномально маленьком ответе оставляйте предыдущий LKG.

После ручного обновления:

1. проверьте `<kml>` и реальные `<Placemark>`;
2. пересоберите GeoJSON по существующему contract;
3. сохраните `sourceId: google-mymaps:<MID>`;
4. обновите metadata: `sourceKind`, `sourceId`, `upstreamId`, `dataFile`, `snapshotAt`, `bytes`, `sha256`, `counts.placemarks`;
5. выполните `node scripts/check-map-data.mjs`.

Pilot MID:

```text
1mxkFBhCULwjecdQUWUIfE1BAQahFG6I
```

### Google My Maps LKG через Supabase (пилот)

Для изменяемых сторонних Google My Maps предусмотрен отдельный механизм в `Antiokh/rslive.ru`. **Текущее состояние production (6 ноября 2026):** установлены первые четыре миграции и Edge v6; порог роста 35% ещё действует, а KML без `<Point>` откладываются и не публикуются. **Ниже описано целевое поведение draft engine PR [#349](https://github.com/Antiokh/rslive.ru/pull/349), пока не развёрнутое в production.** Оно станет доступно только после установки пятой SQL-миграции, выпуска соответствующей Edge Function и проверки pipeline. Пять последовательных миграций `supabase/migrations/20261105183721_google_mymaps_supabase_pipeline.sql`, `supabase/migrations/20261105211500_map_ingest_revision_fencing.sql`, `supabase/migrations/20261105224600_map_ingest_geometry_semantic_signature.sql`, `supabase/migrations/20261106001000_map_ingest_reject_unsupported_geometry.sql` и `supabase/migrations/20261106090000_map_ingest_address_geocoding.sql`, а также Edge Function `supabase/functions/map-snapshot-publish/`.

- `pg_cron` раз в сутки в 05:37 UTC вызывает `map_ingest.poll_sources()`.
- PostgreSQL через `extensions.http_get` получает KML **только для заранее разрешённых MID**, извлекает `Placemark` через XML/XPath, рассчитывает SHA-256 нормализованных имени, описания и **типизированной структуры геометрии** (для address-only записей в новой миграции вместо отсутствующей геометрии хэшируется также нормализованный адрес) (`Point`, `LineString`, `Polygon` с внешним и внутренними кольцами, вложенные `MultiGeometry`). Даже при одинаковых координатах смена типа геометрии меняет хэш. Общий хэш строится из отсортированных хэшей записей, без зависимости от порядка Placemarks и времени выгрузки.
- Изменения направляются в приватную очередь с возрастающей версией по каждому MID: старые задания снимаются, параллельные публикации ограничены lease-токеном, а перед записью проверяются версия в PostgreSQL и версия в GitHub metadata. `pg_net` вызывает Edge Function с секретом из Supabase Vault. Edge читает существующие GeoJSON/metadata по pinned Git Trees/Blobs (в том числе при размере GeoJSON больше 1 МБ), повторно проверяет геометрию и количество точек, отвергает незамкнутые Polygon rings и неподдерживаемые дочерние геометрии внутри `MultiGeometry` (например, `Point` вместе с `Model` или `gx:Track`), не допуская частичной публикации, и публикует **все три файла одним Git-коммитом** — или не делает коммит, если объекты не изменились.
- Пороги считаются от **исторического максимума принятого количества объектов** (`baseline_features`, high-water-mark), а не от последнего меньшего снимка: допускается сокращение 100→80, но следующее 80→69 отклоняется (69 меньше 70% от 100). При сокращении больше 30% от high-water-mark, пустой карте, ошибке HTTP или неправильных координатах сохраняется прежний LKG. **В целевой версии PR #349 верхний порог роста 35% удалён:** новые валидные объекты принимаются независимо от их количества. После развёртывания PR #349 два адресных источника будут обрабатываться через сохранённые координаты и очередь геокодирования, без публикации неполной карты.
- Для адресных KML **«Маршрут памяти»** (`1kjRg87uMqwqNh0re4t7vw9XE79DLx7w`, 32 объекта) и **«СУДСКИ ТУМАЧИ ЗА РУСКИ ЈЕЗИК»** (`1qkp5VjmSJBjdaRRnxEtv0gZEaL2Dpk4`, 35 объектов) источник KML содержит `<address>`, но не содержит `<Point>`. Ранее сохранённые GeoJSON уже содержат координаты всех 67 объектов, полученные из Google My Maps Viewer. Новая Edge версия сначала сопоставляет адрес и название с pinned LKG, затем использует приватный кеш проверенных геокодов. Незнакомые адреса сохраняются в `map_ingest.address_geocodes` и ждут Nominatim/ручной проверки. Отложенное задание остаётся в состоянии `pending` и повторяется не ранее чем через 30 минут; после подтверждения координат оно снова обработает тот же KML, даже если содержимое источника не менялось. При хотя бы одном адресе без подтверждённой точки **весь новый snapshot не публикуется**, предыдущая карта продолжает отображаться.
- Nominatim обрабатывает не более **одного неизвестного адреса в минуту** на одной SQL-машине; очередь хранит запросы и результаты. Автоматически принимаются только однозначные совпадения адреса с улицей и номером дома в пределах Сербии, остальные требуют ручной проверки. В новой базе геокодер отключён по умолчанию, а публичный сервис Nominatim имеет [ограничения использования](https://operations.osmfoundation.org/policies/nominatim/). Нужна атрибуция OpenStreetMap contributors для координат, полученных этим способом.
- Для карты «Ковчег Бизнес» добавляются только новые кандидаты в `data_russian_business_source_candidates` со статусом `pending`. Имеющиеся редакционные решения, `matched` и публичные бизнес-карточки не переписываются.
- Публикация использует `GITHUB_TOKEN` **только из Edge Secrets**. Endpoint Edge настраивается отдельно для каждого проекта Supabase в приватной `map_ingest.runtime_config.edge_url`; при отсутствии настройки отправка прекращается. Источники `map_ingest.sources` **выключены по умолчанию**; `enabled=false` отменяет ожидающие и обрабатываемые задания этого MID и отзывает активную lease. Активация допускается после проверки прав ключа, Edge и полученного снимка.
- Код `astro/scripts/refresh-map-snapshots.mjs` остаётся в сборке: с `RSLIVE_SKIP_MAP_REFRESH=1` он очищает generated-каталоги и заново заполняет их из committed LKG, без сетевого обновления. В Cloudflare Pages Production и Preview уже установлен `RSLIVE_SKIP_MAP_REFRESH=1`, поэтому сетевые обращения к Google My Maps во время build отключены. Локальные сборки без этого флага по-прежнему могут выполнять прямой fetch.

Первый production smoke test (2026-11-05): Supabase успешно получил 112 KML Placemark «Ковчега», рассчитал row hashes и обработал задание в Edge. GitHub сообщил о доступе на запись, но объекты не изменились — новый коммит не потребовался. На тот момент был включён только MID «Ковчега» (остальные шесть выключены); основной движок позднее объединён в `main` через PR #348.


Повторный runtime smoke test (2026-11-05): Edge v2 обработала идемпотентное задание «Ковчега» (generation 2) с первой попытки; новый GitHub-коммит не потребовался. Устаревшие и отменённые задания проверены в откатываемом SQL-тесте, включая A→B→retry A. Позже выполнен отдельный полный Edge→GitHub тест с изменёнными данными и независимая сборка Astro (см. ниже).


Результат приёмки (2026-11-05): первые две Supabase-миграции зарегистрированы в production history после проверки фактически установленных функций; третья миграция типизированного геометрического хэша и четвёртая миграция fail-closed для неподдерживаемых геометрий **установлены и зарегистрированы** в production; clean-DB SQL CI для всех четырёх версий завершился успешно ([workflow](https://github.com/Antiokh/rslive.ru/actions/runs/42124721119)). Edge в изолированном тесте опубликовал **изменённый KML, GeoJSON и JSON metadata одним Git-коммитом** в отдельную ветку ([коммит](https://github.com/Antiokh/rslive_content/commit/616cd7086f73c6af96c77cb1c82ff54247f68e81)); [валидатор map-data](https://github.com/Antiokh/rslive_content/actions/runs/42117857265) прошёл. Штатная Edge Function восстановлена, временные тестовые строки из Supabase удалены, production `main` не тронут. Полная Astro-сборка через GitHub Actions прошла, а Cloudflare Pages после синхронизации engine PR с `main` **успешно собрал и опубликовал preview** ([deployment `33b0a282`](https://dash.cloudflare.com/?to=/fa47bc5cf310af4bde847f7cf6445a1d/pages/view/rslive/33b0a282-7cbe-4bf0-b1e7-0a9ccae410fa), коммит `87821d1`). Старые неудачные проверки Cloudflare больше не являются блокером; последующие HEAD PR проверяются отдельно.


В production 6 ноября включены **все семь MID**: три новых источника успешно опубликовались (либо признаны семантически неизменными), две адресные карты помечены как `deferred`, а карта танцевальных школ с 199 Placemarks была заблокирована старым верхним порогом роста. Edge v6 сохраняет проверку mixed `MultiGeometry`; новый адресный механизм находится в отдельном draft PR и не считается развёрнутым, пока не пройдёт release-проверки.

Известное расхождение на 6 ноября: KML карты «Танцевальные школы и залы» (`1mxkFBhCULwjecdQUWUIfE1BAQahFG6I`) содержит 199 Placemarks, сохранённый GeoJSON — 111. После установки пятой миграции и новой Edge версии верхний порог роста перестанет блокировать корректную выгрузку; низовой порог и структурные проверки останутся.

## Yandex Constructor LKG

Yandex Constructor используется как provider-managed thematic source: владельцы Blacklist Serbia могут менять точки независимо от репозитория. Поэтому для явно allowlisted Constructor действует controlled daily LKG refresh.

Source of truth для acquisition/parser/filter contract остаётся в engine `Antiokh/rslive.ru`:

```text
astro/config/maps.config.mjs
astro/scripts/lib/yandex-constructor-snapshot.mjs
```

Content workflow не копирует parser. `.github/workflows/refresh-yandex-map-lkg.yml` checkout'ит текущий engine `main` и запускает `scripts/refresh-yandex-lkg.mjs`, который использует engine allowlist и parser непосредственно.

Текущий LKG хранится парой:

```text
map-data/snapshots/yandex-constructor/<constructor-id>.geojson
map-data/snapshots/yandex-constructor/<constructor-id>.json
```

Инварианты scheduled refresh:

- provider HTML загружается только в GitHub Actions/build/maintenance, не в браузере пользователя;
- Constructor ID обязан совпасть с allowlist и в request, и в response;
- карта должна оставаться public;
- принимаются только placemark с валидными WGS84 coordinates;
- `SERBIA_BOUNDS` — только быстрый prefilter;
- окончательное решение принимает point-in-polygon по `map-data/core/serbia-regions.geojson`;
- source не должен упасть ниже engine `minSourceFeatures`;
- после country filter должно остаться не меньше 50% source features;
- при существующем LKG новый source/output не должен без ручного вмешательства схлопнуться более чем на 30%;
- любой network/parser/filter/validation failure завершает workflow с ошибкой **до записи LKG**;
- старый LKG при ошибке не удаляется и не заменяется;
- feature order, `snapshotAt` и другое acquisition metadata не создают новый commit сами по себе;
- изменение координаты, названия или текста отзыва меняет normalized SHA-256 и считается содержательным изменением snapshot.

Перед commit workflow запускает:

```bash
node scripts/check-yandex-lkg-utils.mjs
node scripts/check-map-data.mjs
```

Если normalized snapshot не изменился, commit не создаётся. Если изменился, workflow коммитит только `map-data/snapshots/yandex-constructor/**`; push через repository PAT запускает обычный `notify-rslive-ru.yml`, который повторно валидирует весь map-data и зеркалит LKG в engine.

Scheduled refresh — исключение только для явно allowlisted volatile provider-managed thematic sources. Он не разрешает автоматический Overpass refresh, массовый scraper произвольных Yandex карт или scheduled rebuild обычных OSM/Google snapshots.

## Как добавить новый runtime-region

Наличие нового GeoJSON недостаточно.

1. Подтвердите product need.
2. Добавьте config в `Antiokh/rslive.ru/astro/config/map-regions.config.mjs`.
3. Задайте renderer bbox/zoom.
4. Обновите engine tests/manifest contract.
5. Добавьте target в `scripts/check-map-data.mjs`.
6. При необходимости добавьте target в ручной `scripts/build-map-data.mjs`.
7. Добавьте source и optional gzip в content-sync allowlist.
8. Обновите эту инструкцию и component docs.
9. Только затем публикуйте новый source.

## Как удалить runtime-карту

Удаление source — изменение contract. Сначала уберите использование и registry в engine, validators, manual gzip list и sync allowlist. Только затем удаляйте source.

Не оставляйте runtime entry без source и не создавайте пустые GeoJSON placeholders.

## Атрибуция

OSM-derived GeoJSON должен сохранять:

```text
© OpenStreetMap contributors · ODbL
```

Google My Maps snapshot сохраняет происхождение в metadata. Это не даёт права кэшировать Google tiles, Street View или другие remote resources как first-party data.

Yandex Constructor snapshot также сохраняет provider/source provenance в metadata. Это разрешение относится только к нормализованным данным явно allowlisted пользовательской карты и не превращает Yandex tiles, assets или другие provider resources в first-party data.

## Чего не делать

- не добавлять scheduled map refresh для OSM/Google или произвольных provider sources; исключение допускается только для явно allowlisted volatile thematic LKG с отдельным fail-closed contract;
- не выполнять Overpass-запросы в production build или браузере пользователя;
- не сжимать карты в GitHub Actions или production build;
- не обновлять вручную обслуживаемые OSM/Google snapshots только потому, что прошёл календарный период;
- не использовать renderer bbox вместо administrative acquisition area;
- не добавлять buildings/POI/residential/service roads без отдельного решения;
- не коммить raw Overpass export как готовый RSLive GeoJSON;
- не заменять LKG при ошибке или подозрительно маленькой выгрузке;
- не кэшировать third-party Google/OpenStreetMap/Yandex tile responses;
- не менять GeoJSON/gzip contract без синхронного изменения validators, sync и engine.
