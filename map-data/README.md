# Картографические данные RSLive

Этот каталог хранит first-party snapshots карт для `rslive.ru`.

Карты **не обновляются автоматически**. Это редко меняющиеся данные: новый snapshot делают вручную только тогда, когда есть практическая причина обновить покрытие, исправить ошибку или заменить источник.

## Главное правило

`map-data/**` — last-known-good данные. Не заменяйте рабочий snapshot неполной или непроверенной выгрузкой.

Для runtime-карт есть два уровня файлов:

- `*.geojson` — читаемый **source of truth**;
- `*.geojson.gz` — производный transport/cache artifact, который генерируется из соответствующего GeoJSON и вручную не редактируется.

После изменения runtime GeoJSON выполняйте:

```bash
node scripts/check-map-data.mjs
node scripts/build-map-data.mjs
node scripts/build-map-data.mjs --check
```

`build-map-data.mjs --check` проверяет, что каждый gzip существует, распаковывается **байт-в-байт** в исходный GeoJSON и реально меньше него.

Content-sync повторяет проверки **до** любого destructive `rsync --delete`. При отсутствии обязательного source/gzip или при устаревшем gzip публикация останавливается, а рабочее зеркало в `rslive.ru` не удаляется.

## Структура

Основные runtime datasets:

```text
map-data/
  core/
    serbia-overview.geojson
    serbia-overview.geojson.gz

  packs/
    cities/
      belgrade.geojson
      belgrade.geojson.gz
      novi-sad.geojson
      novi-sad.geojson.gz
      nis.geojson
      nis.geojson.gz
      subotica.geojson
      subotica.geojson.gz

  basemaps/
    belgrade-lite.geojson

  snapshots/
    google-mymaps/
      <mid>.kml
      <mid>.geojson
      <mid>.json
```

В `map-data/**` могут находиться и вспомогательные acquisition/reference datasets. Само наличие GeoJSON рядом с runtime-файлами **не делает его публикуемым слоем**. Runtime-набор задаётся allowlist в content-sync и registry в `Antiokh/rslive.ru`.

### `belgrade-ext.geojson`

`map-data/packs/cities/belgrade-ext.geojson` — **вспомогательная расширенная Белградская зона**: более широкая территория Белграда с пригородами и внешними муниципалитетами, относящимися к широкому Белграду. Обреновац — один из примеров такого покрытия, а не единственная причина существования файла.

Это не текущий публичный `MapEmbed` region id и не runtime city pack:

- не добавляйте `belgrade-ext` в `regions`;
- не генерируйте для него production `.geojson.gz` только из-за наличия файла;
- content-sync не должен зеркалировать его в `astro/public/maps/packs/cities/`;
- engine manifest не должен публиковать его автоматически.

Если расширенная зона когда-нибудь понадобится как отдельный пользовательский слой, сначала явно измените engine registry/props/tests/документацию, и только после этого включайте её в runtime allowlist и gzip pipeline.

`map-data/basemaps/belgrade-lite.geojson` — legacy pilot artifact. Новые пользовательские городские данные живут в `packs/cities/`.

## Что означает MapEmbed

Engine contract находится в `Antiokh/rslive.ru`.

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

`serbia-overview` не является публичным id компонента. Country layer включается prop `SerbiaMap`.

Продуктовый дефолт: если ни один город не выбран, `MapEmbed` использует:

```text
Belgrade + SerbiaMap
```

Если город указан явно, например:

```mdx
<MapEmbed src="…" regions={['nis']} />
```

страна автоматически не добавляется. Для неё нужен `SerbiaMap`:

```mdx
<MapEmbed src="…" regions={['nis']} SerbiaMap />
```

Если указано два и более города, пользователь не должен быть заперт в одном городе: максимальная область перемещения — Сербия.

Важно: слово «optional» здесь относится к **загрузке конкретному пользователю**, а не к наличию source-файла в content. Штатный набор данных содержит все четыре городских GeoJSON и карту Сербии; браузер скачивает только те слои, которые нужны конкретному `MapEmbed`.

## Что публикуется в engine

Content-sync зеркалирует только разрешённые runtime artifacts и связанные snapshots.

Runtime allowlist:

```text
map-data/core/serbia-overview.geojson
map-data/core/serbia-overview.geojson.gz

map-data/packs/cities/belgrade.geojson
map-data/packs/cities/belgrade.geojson.gz
map-data/packs/cities/novi-sad.geojson
map-data/packs/cities/novi-sad.geojson.gz
map-data/packs/cities/nis.geojson
map-data/packs/cities/nis.geojson.gz
map-data/packs/cities/subotica.geojson
map-data/packs/cities/subotica.geojson.gz
```

Кроме этого синхронизируются отдельные legacy/snapshot subtree по workflow.

`map-data/README.md`, `belgrade-ext.geojson`, другие acquisition/reference GeoJSON и будущие root-level файлы не должны попадать в runtime только потому, что лежат в `map-data/**`.

## Безопасный рабочий цикл

1. Обновите `main` и создайте отдельную ветку.
2. Убедитесь, что текущий набор валиден:

   ```bash
   node scripts/check-map-data.mjs
   node scripts/build-map-data.mjs --check
   ```

3. Получите новый raw export во временный каталог **вне** runtime-путей `map-data/core/` и `map-data/packs/cities/`.
4. Визуально проверьте территорию и состав объектов.
5. Нормализуйте raw export в RSLive GeoJSON contract.
6. Замените только целевой `*.geojson`.
7. Проверьте семантику:

   ```bash
   node scripts/check-map-data.mjs
   ```

8. Перегенерируйте производные gzip:

   ```bash
   node scripts/build-map-data.mjs
   ```

9. Проверьте round-trip и актуальность gzip:

   ```bash
   node scripts/build-map-data.mjs --check
   ```

10. Сравните diff и размеры:

   ```bash
   git diff --stat
   git diff -- map-data/
   ```

11. Если исходный GeoJSON резко уменьшился, перепроверьте acquisition до коммита. Маленький файл может означать частичный ответ Overpass.
12. Коммитьте source GeoJSON и соответствующий `.geojson.gz` вместе.
13. Откройте отдельный PR. Не обновляйте карты по расписанию и не заменяйте LKG при ошибке источника.
14. После merge content-sync снова запускает validators и только затем зеркалирует allowlist в private engine.

## Карта Сербии

Источник — OpenStreetMap через Overpass Turbo.

Публичный компонент использует prop `SerbiaMap`. Файл пока сохраняет историческое имя:

```text
map-data/core/serbia-overview.geojson
```

Новые metadata должны использовать:

```text
regionId: "serbia"
```

Validator временно принимает старое `regionId: "serbia-overview"` для существующего LKG.

### Уровень детализации SerbiaMap

Включаем только:

- `motorway`, `trunk`, `primary` с `ref`;
- именованные реки;
- подписи `city` и `town`.

Не включаем:

- здания;
- адреса;
- POI;
- secondary/tertiary/residential/service дороги;
- остановки;
- routing graph;
- tiles, terrain, 3D;
- подробные квартальные подписи.

### Overpass Turbo для Сербии

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
5. Сохраните raw export вне runtime-путей.
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

8. Не увеличивайте число подписей без продуктовой необходимости.
9. После замены source запустите semantic validator и gzip generator/check.

Минимальный threshold:

```text
roads >= 50
rivers >= 2
labels >= 8
```

## Городские паки

Штатно храним четыре города:

| Город | regionId | renderer bbox |
| --- | --- | --- |
| Белград | `belgrade` | `[20.18, 44.68, 20.68, 44.97]` |
| Нови-Сад | `novi-sad` | `[19.65, 45.15, 20.1, 45.42]` |
| Ниш | `nis` | `[21.75, 43.2, 22.15, 43.42]` |
| Суботица | `subotica` | `[19.5, 45.98, 19.86, 46.23]` |

`bbox` — renderer constraint. **Не используйте его как границу OSM acquisition.**

### Граница выгрузки

Городскую карту получайте по административной области через `geocodeArea`.

После выполнения запроса визуально проверьте найденную область: Nominatim/Overpass может подобрать одноимённую сущность не того уровня.

Используйте:

```text
Belgrade, Serbia
Novi Sad, Serbia
Niš, Serbia
Subotica, Serbia
```

### Уровень детализации города

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
- остановки и полный public-transport graph;
- parking;
- indoor;
- routing graph;
- внешние OSM tiles/sprites/glyphs.

Это карта географического контекста, а не офлайн-навигация.

### Шаблон Overpass

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

Сырой экспорт Overpass Turbo **не коммитьте вместо готового файла**.

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

Root `properties` для города:

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

Для остальных городов замените `regionId`, `regionTitle` и `bbox` по таблице.

Не упрощайте геометрию дополнительно без отдельного измерения и решения по общему контракту.

Минимальная проверка каждого city pack:

```text
roads >= 20
water features >= 2
```

## Gzip transport/cache contract

Gzip нужен не только для HTTP-трафика, а для фактического хранения map payload в отдельном Cache Storage.

Source остаётся обычным GeoJSON:

```text
belgrade.geojson
```

Рядом хранится его производный payload:

```text
belgrade.geojson.gz
```

Генератор:

```bash
node scripts/build-map-data.mjs
```

Проверка без изменения файлов:

```bash
node scripts/build-map-data.mjs --check
```

Правила:

- gzip level — 9;
- `.gz` должен распаковываться ровно в байты source GeoJSON;
- gzip должен быть меньше source;
- source и gzip меняются одним коммитом;
- вручную gzip не редактируется;
- `belgrade-ext` и другие вспомогательные datasets автоматически не компрессируются для production;
- Google My Maps snapshot пока живёт по отдельному source contract и не включён в этот regional gzip pipeline.

Engine manifest публикует canonical raw URL и gzip download URL. Клиент предпочитает gzip, если браузер поддерживает `DecompressionStream('gzip')`, хранит сжатые байты в `rslive-map-packs-v1` и распаковывает их только при чтении карты. Если gzip stream API недоступен или `.gz` отдан сервером уже распакованным, клиент использует обычный GeoJSON fallback.

Это позволяет экономить и сетевой трафик, и фактический размер отдельного map cache, не меняя GeoJSON как редакционный/source формат.

## Google My Maps snapshots

Один логический snapshot состоит из трёх файлов:

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

Порядок:

1. Получите KML.
2. Проверьте `<kml>` и реальные `<Placemark>`.
3. Конвертируйте в GeoJSON по текущему контракту.
4. Сохраните `sourceId: google-mymaps:<MID>`.
5. Обновите metadata:
   - `sourceKind`;
   - `sourceId`;
   - `upstreamId`;
   - `dataFile`;
   - `snapshotAt`;
   - `bytes`;
   - `sha256` KML;
   - `counts.placemarks`.
6. Выполните `node scripts/check-map-data.mjs`.

Pilot MID:

```text
1mxkFBhCULwjecdQUWUIfE1BAQahFG6I
```

Validator проверяет комплектность KML/GeoJSON/JSON sidecars и соответствие `bytes`/SHA-256 реальному KML.

## Как добавить новый runtime-город

Не кладите новый `<city>.geojson` в production allowlist автоматически.

Сначала:

1. подтвердите продуктовую необходимость;
2. добавьте city config в `Antiokh/rslive.ru/astro/config/map-regions.config.mjs`;
3. задайте renderer bbox/zoom;
4. обновите engine tests и manifest contract;
5. добавьте город в `scripts/check-map-data.mjs`;
6. добавьте source в `scripts/build-map-data.mjs`;
7. добавьте source + gzip в content-sync allowlist;
8. обновите эту инструкцию;
9. только затем подготовьте source GeoJSON и сгенерируйте `.geojson.gz`.

## Как удалить runtime-карту

Удаление — изменение контракта, а не просто удаление файла.

Для SerbiaMap или одного из четырёх штатных городов сначала удалите/измените использование и registry в engine, validators, gzip list и sync allowlist. Только после этого удаляйте source + gzip одним PR.

Не оставляйте orphan `.gz` без source и не удаляйте source при сохранённом runtime entry.

## Атрибуция

OSM-derived GeoJSON должен сохранять:

```text
© OpenStreetMap contributors · ODbL
```

Не удаляйте attribution при нормализации.

Google My Maps snapshot сохраняет происхождение в metadata. Это не даёт права кэшировать сторонние Google tiles, Street View или другие remote assets.

## Чего не делать

- не добавлять scheduled map refresh;
- не выполнять Overpass-запросы в production build;
- не выполнять Overpass-запросы у конечного пользователя;
- не обновлять карты только потому, что прошёл календарный период;
- не использовать renderer bbox вместо административной области acquisition;
- не добавлять buildings/POI/residential/service roads без отдельного решения по размеру и UX;
- не коммить raw Overpass export как готовый RSLive GeoJSON;
- не редактировать `.geojson.gz` вручную;
- не коммить source без актуального runtime gzip;
- не превращать вспомогательный dataset (`belgrade-ext` и подобные) в runtime только из-за его наличия;
- не заменять LKG при ошибке или подозрительно маленькой выгрузке;
- не кэшировать сторонние Google/OpenStreetMap tile responses как first-party data;
- не менять GeoJSON/gzip contract без синхронного изменения validators, sync и engine.
