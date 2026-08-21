# Картографические данные RSLive

Этот каталог хранит first-party snapshots карт для `rslive.ru`.

Карты **не обновляются автоматически**. Это редко меняющиеся данные: новый snapshot делают вручную только тогда, когда есть практическая причина обновить покрытие, исправить ошибку или заменить источник.

## Главное правило

`map-data/**` — last-known-good source data. Не заменяйте рабочий snapshot неполной или непроверенной выгрузкой.

Региональный runtime использует два представления:

- `*.geojson` — читаемый и коммитящийся **source of truth**;
- `*.geojson.gz` — производный transport/cache artifact.

`.geojson.gz` **не коммитится в `rslive_content`**. Content-sync генерирует gzip из проверенного GeoJSON непосредственно перед зеркалированием в `rslive.ru`. Поэтому человеку при обычном обновлении карты надо коммитить только source GeoJSON.

Локальная проверка после изменения карты:

```bash
node scripts/check-map-data.mjs
node scripts/build-map-data.mjs
node scripts/build-map-data.mjs --check
```

`build-map-data.mjs` создаёт временные `.geojson.gz` рядом с source. После проверки их можно удалить локально; они не являются редакционным source.

PR workflow `Map data quality` делает те же три шага на чистом checkout. Publish workflow повторяет их **до** destructive sync и только затем копирует source + сгенерированные gzip в private engine.

## Что здесь хранится

Штатные source-файлы runtime:

```text
map-data/
  core/
    serbia-overview.geojson

  packs/
    cities/
      belgrade.geojson
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
```

В каталоге могут быть вспомогательные acquisition/reference datasets. Само наличие GeoJSON **не делает его runtime map layer**. Публикация задаётся явным allowlist в `.github/workflows/notify-rslive-ru.yml` и registry в `Antiokh/rslive.ru`.

## `belgrade-ext.geojson`

`map-data/packs/cities/belgrade-ext.geojson` — **вспомогательная расширенная Белградская зона**: широкий Белград с пригородами и внешними муниципалитетами, которые технически относятся к Белграду. Обреновац — один из примеров покрытия, а не единственная территория этого файла.

Сейчас это не публичный `MapEmbed` region:

- `belgrade-ext` нельзя указывать в `regions`;
- для него не генерируется production gzip;
- content-sync не зеркалирует его в runtime city directory;
- engine manifest его не публикует.

Если расширенная зона понадобится как пользовательский слой, сначала явно меняются engine registry, component contract, tests и sync allowlist. Только после этого dataset становится runtime.

## MapEmbed contract

У `MapEmbed` два селектора:

```text
regions    -> городские паки
SerbiaMap  -> карта Сербии
```

В `regions` разрешены только:

```text
belgrade
novi-sad
nis
subotica
```

`serbia-overview` — историческое имя source-файла, а не публичный id компонента.

Product default:

```mdx
<MapEmbed src="…" />
```

→ Serbia + Belgrade.

Явный город отключает автоматическую Serbia:

```mdx
<MapEmbed src="…" regions={['nis']} />
```

→ Niš only.

```mdx
<MapEmbed src="…" regions={['nis']} SerbiaMap />
```

→ Serbia + Niš.

Если указано несколько городов, пользователь может перемещаться между ними; общий `maxBounds` — Сербия.

Важно: слово «optional» относится к **загрузке конкретному пользователю**. Source-набор не optional: поддерживаем Serbia + все четыре city GeoJSON.

## Что зеркалируется в engine

Runtime allowlist:

```text
map-data/core/serbia-overview.geojson
map-data/core/serbia-overview.geojson.gz        # generated during sync

map-data/packs/cities/belgrade.geojson
map-data/packs/cities/belgrade.geojson.gz       # generated during sync
map-data/packs/cities/novi-sad.geojson
map-data/packs/cities/novi-sad.geojson.gz       # generated during sync
map-data/packs/cities/nis.geojson
map-data/packs/cities/nis.geojson.gz            # generated during sync
map-data/packs/cities/subotica.geojson
map-data/packs/cities/subotica.geojson.gz       # generated during sync
```

Legacy `basemaps/` и `snapshots/` синхронизируются отдельно.

`map-data/README.md`, `belgrade-ext.geojson`, `serbia-regions.geojson` и другие auxiliary/reference datasets не должны попадать в runtime автоматически.

## Безопасный рабочий цикл

1. Обновите `main` и создайте отдельную ветку.
2. Проверьте текущий source-набор:

   ```bash
   node scripts/check-map-data.mjs
   ```

3. Получите новый raw export во временный каталог, а не поверх LKG.
4. Визуально проверьте выбранную территорию и состав объектов.
5. Нормализуйте raw export в RSLive GeoJSON contract.
6. Замените только целевой source `*.geojson`.
7. Запустите:

   ```bash
   node scripts/check-map-data.mjs
   node scripts/build-map-data.mjs
   node scripts/build-map-data.mjs --check
   ```

8. Сравните source с предыдущей версией:

   ```bash
   git diff --stat
   git diff -- map-data/
   ```

9. Если source резко уменьшился, перепроверьте acquisition: это может быть частичный ответ Overpass.
10. **Не добавляйте generated `.geojson.gz` в commit.** Коммитьте source GeoJSON и изменённую документацию/metadata.
11. Откройте PR и дождитесь зелёного `Map data quality`.
12. После merge publish workflow снова проверит source, сгенерирует gzip в рабочем checkout и зеркалирует runtime allowlist в private engine.

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

Не включаем:

- buildings;
- addresses;
- POI;
- secondary/tertiary/residential/service roads;
- stops/public transport graph;
- routing graph;
- tiles/terrain/3D;
- подробные квартальные подписи.

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

1. Откройте Overpass Turbo.
2. Вставьте запрос и выполните его.
3. Визуально проверьте покрытие всей Сербии.
4. `Export` → `GeoJSON`.
5. Сохраните raw export вне runtime source path.
6. Нормализуйте:
   - road → `category: "road"`, `class` из `highway`, `name`, `ref`;
   - river → `category: "water-line"`, `class: "river"`, `name`;
   - city/town → `category: "label"`, `class` из `place`, `name`, при наличии `population`.
7. Root `properties`:

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

8. Не увеличивайте число labels без продуктовой необходимости.

Минимальный threshold:

```text
roads >= 50
rivers >= 2
labels >= 8
```

## Городские паки

Штатно поддерживаем:

| Город | regionId | renderer bbox |
| --- | --- | --- |
| Белград | `belgrade` | `[20.18, 44.68, 20.68, 44.97]` |
| Нови-Сад | `novi-sad` | `[19.65, 45.15, 20.1, 45.42]` |
| Ниш | `nis` | `[21.75, 43.2, 22.15, 43.42]` |
| Суботица | `subotica` | `[19.5, 45.98, 19.86, 46.23]` |

`bbox` — renderer constraint. **Не используйте его как границу OSM acquisition.**

### Граница выгрузки

Городскую карту получайте по административной области через `geocodeArea`.

Используйте:

```text
Belgrade, Serbia
Novi Sad, Serbia
Niš, Serbia
Subotica, Serbia
```

После выполнения обязательно визуально проверьте выбранную административную область: Nominatim/Overpass может подобрать одноимённую сущность другого уровня.

### Детализация города

Включаем:

- `highway=motorway|trunk|primary|secondary|tertiary`;
- `waterway=river|canal`;
- `natural=water`;
- `leisure=park`;
- `landuse=forest|recreation_ground`;
- `place=city|town|suburb|quarter`.

Не включаем:

- `residential`, `living_street`, `service`, `track`, `path`, `footway`, `cycleway`;
- buildings;
- address points;
- shops, amenity, tourism, craft и другие POI;
- stops/public transport graph;
- parking;
- indoor;
- routing graph;
- external OSM tiles/sprites/glyphs.

Карта нужна для географического контекста, а не как офлайн-навигация.

### Overpass Turbo: city template

Для Белграда:

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

Для остальных меняется только `geocodeArea`.

### Нормализация city GeoJSON

Сырой export Overpass Turbo не коммитьте как готовый RSLive file.

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

Сохраняйте полезные поля при наличии:

```text
name
ref
population
```

Root `properties`:

```json
{
  "regionId": "belgrade",
  "regionTitle": "Белград",
  "kind": "city",
  "country": "serbia",
  "bbox": [20.18, 44.68, 20.68, 44.97],
  "optionalPack": true,
  "attribution": "© OpenStreetMap contributors · ODbL",
  "snapshotAt": "YYYY-MM-DD"
}
```

Для остальных замените `regionId`, `regionTitle` и `bbox` по таблице.

Не упрощайте geometry дополнительно без отдельного измерения и решения по общему contract.

Минимальный threshold каждого city pack:

```text
roads >= 20
water features >= 2
```

## Gzip transport/cache

Gzip генерируется из runtime GeoJSON командой:

```bash
node scripts/build-map-data.mjs
```

Проверка:

```bash
node scripts/build-map-data.mjs --check
```

Инварианты:

- gzip level 9;
- `gunzip(.gz)` должен дать source bytes exactly;
- gzip должен быть меньше source;
- `belgrade-ext` и другие auxiliary datasets не входят в production gzip list;
- generated `.gz` не является content source и не коммитится в public repo.

Во время publish workflow generated gzip зеркалируется в `rslive.ru/astro/public/maps/**`. Engine manifest публикует raw URL и gzip download URL. Клиент предпочитает gzip, хранит compressed bytes в dedicated Cache Storage и распаковывает их при `RSLiveMapPacks.read()`; при отсутствии native gzip stream support используется raw fallback.

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

## Как добавить новый runtime-город

Наличие нового GeoJSON недостаточно.

Сначала:

1. подтвердите product need;
2. добавьте city config в `Antiokh/rslive.ru/astro/config/map-regions.config.mjs`;
3. задайте renderer bbox/zoom;
4. обновите engine tests/manifest contract;
5. добавьте город в `scripts/check-map-data.mjs`;
6. добавьте source в `scripts/build-map-data.mjs`;
7. добавьте source + generated gzip в content-sync allowlist;
8. обновите эту инструкцию;
9. только затем добавляйте новый source GeoJSON.

## Как удалить runtime-карту

Удаление source — изменение contract.

Сначала уберите/измените использование и registry в engine, validators, gzip generator list и sync allowlist. Только после этого удаляйте source.

Не оставляйте runtime entry без source и не создавайте пустые GeoJSON placeholders.

## Атрибуция

OSM-derived GeoJSON должен сохранять:

```text
© OpenStreetMap contributors · ODbL
```

Google My Maps snapshot сохраняет происхождение в metadata. Это не даёт права кэшировать Google tiles, Street View или другие remote resources как first-party data.

## Чего не делать

- не добавлять scheduled map refresh;
- не выполнять Overpass-запросы в production build или браузере пользователя;
- не обновлять карту только потому, что прошёл календарный период;
- не использовать renderer bbox вместо administrative acquisition area;
- не добавлять buildings/POI/residential/service roads без отдельного решения;
- не коммить raw Overpass export как готовый RSLive GeoJSON;
- не коммить generated `.geojson.gz` в public content repo;
- не превращать auxiliary dataset (`belgrade-ext` и подобные) в runtime из-за самого факта его наличия;
- не заменять LKG при ошибке или подозрительно маленькой выгрузке;
- не кэшировать third-party Google/OpenStreetMap tile responses;
- не менять GeoJSON/gzip contract без синхронного изменения validators, sync и engine.
