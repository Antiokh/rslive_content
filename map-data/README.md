# Картографические данные RSLive

Этот каталог хранит публикуемые first-party snapshots карт для `rslive.ru`.

Карты **не обновляются автоматически**. Это редко меняющиеся данные: новый snapshot делается вручную только тогда, когда есть практическая причина обновить покрытие, исправить ошибку или заменить источник.

## Главное правило

`map-data/**` — last-known-good данные. Не заменяйте рабочий snapshot неполной или непроверенной выгрузкой.

Перед публикацией всегда запускайте:

```bash
node scripts/check-map-data.mjs
```

Тот же validator запускается в content-sync workflow **до** любого `rsync --delete`. Если обязательный snapshot или sidecar отсутствует, синхронизация останавливается и рабочее зеркало в `rslive.ru` не удаляется.

## Что здесь хранится

```text
map-data/
  core/
    serbia-overview.geojson
  basemaps/
    belgrade-lite.geojson
  packs/
    cities/
      belgrade.geojson
      novi-sad.geojson
      nis.geojson
      subotica.geojson
  snapshots/
    google-mymaps/
      <mid>.kml
      <mid>.geojson
      <mid>.json
```

`novi-sad.geojson`, `nis.geojson` и `subotica.geojson` могут отсутствовать до первой реальной выгрузки. Пустые GeoJSON-заглушки не создавайте.

`basemaps/belgrade-lite.geojson` — legacy pilot artifact. Новые городские карты добавляются в `packs/cities/`.

## Что означает MapEmbed

Engine contract находится в `Antiokh/rslive.ru`.

У `MapEmbed` два независимых селектора:

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

Продуктовый дефолт: если ни один город не выбран, MapEmbed использует:

```text
Belgrade + SerbiaMap
```

Если город указан явно, например `regions={['nis']}`, страна автоматически не добавляется. Для неё нужен `SerbiaMap`.

Наличие файла в `map-data/**` само по себе не означает, что браузер скачает его.

## Что зеркалируется в engine

Публикуются только четыре content-owned subtree:

```text
map-data/core/      -> rslive.ru/astro/public/maps/core/
map-data/basemaps/  -> rslive.ru/astro/public/maps/basemaps/
map-data/packs/     -> rslive.ru/astro/public/maps/packs/
map-data/snapshots/ -> rslive.ru/astro/public/maps/snapshots/
```

`map-data/README.md` и другие root-level файлы в `astro/public/maps/` не копируются.

## Безопасный рабочий цикл

1. Обновите `main` и создайте отдельную ветку.
2. Запустите baseline-проверку:

   ```bash
   node scripts/check-map-data.mjs
   ```

3. Получите новый raw export во временный каталог **вне** `map-data/`.
4. Визуально проверьте охват территории и состав объектов.
5. Нормализуйте raw export в RSLive GeoJSON contract.
6. Замените только целевой snapshot/sidecar set.
7. Повторно запустите validator.
8. Сравните размер и количество объектов с предыдущей версией:

   ```bash
   git diff --stat
   git diff -- map-data/
   ```

9. Если размер резко уменьшился, перепроверьте выгрузку до коммита.
10. Откройте PR. Не обновляйте карты напрямую в `main` без необходимости.
11. После merge content-sync сначала повторно валидирует map-data, затем зеркалирует их в private engine.

При любой ошибке источника оставляйте предыдущий last-known-good.

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

Validator временно принимает старое `regionId: "serbia-overview"`, чтобы существующий snapshot не требовал бессмысленной перегенерации только ради имени.

### Уровень детализации

Country layer должен оставаться лёгким. Включаем только:

- `motorway`, `trunk`, `primary` с `ref`;
- именованные реки;
- подписи `city` и `town`.

Не включаем:

- здания;
- адреса;
- магазины/рестораны/POI;
- secondary/tertiary/residential/service дороги;
- автобусные остановки;
- маршрутизацию;
- тайлы, terrain, 3D;
- подробные квартальные подписи.

### Overpass Turbo

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

1. Откройте https://overpass-turbo.eu/.
2. Вставьте запрос и выполните его.
3. Визуально проверьте, что выборка покрывает Сербию целиком.
4. `Export` → `GeoJSON`.
5. Сохраните raw export вне `map-data/`.
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

8. Не увеличивайте число подписей без необходимости: country overview не должен превращаться в подробную карту.

Минимальный validator threshold:

```text
roads >= 50
rivers >= 2
labels >= 8
```

## Городские паки

Поддерживаются четыре города:

| Город | regionId | renderer bbox |
| --- | --- | --- |
| Белград | `belgrade` | `[20.18, 44.68, 20.68, 44.97]` |
| Нови-Сад | `novi-sad` | `[19.65, 45.15, 20.1, 45.42]` |
| Ниш | `nis` | `[21.75, 43.2, 22.15, 43.42]` |
| Суботица | `subotica` | `[19.5, 45.98, 19.86, 46.23]` |

`bbox` — renderer constraint. **Не используйте его как границу OSM acquisition.**

### Граница выгрузки

Городскую карту получайте по административной области через `geocodeArea`.

Обязательно визуально проверьте найденную область: Nominatim/Overpass может подобрать одноимённую сущность не того уровня.

Используйте названия:

```text
Belgrade, Serbia
Novi Sad, Serbia
Niš, Serbia
Subotica, Serbia
```

### Уровень детализации

Для каждого города включаем:

- дороги: `motorway|trunk|primary|secondary|tertiary`;
- водные линии: `river|canal`;
- водные площади: `natural=water`;
- зелёные территории: `leisure=park`, `landuse=forest|recreation_ground`;
- подписи: `city|town|suburb|quarter`.

Не включаем:

- `residential`, `living_street`, `service`, `track`, `path`, `footway`, `cycleway`;
- здания;
- адресные точки;
- shops, amenity, tourism, craft и другие POI;
- остановки и полный public transport graph;
- parking;
- indoor;
- routing graph;
- внешние OSM tiles/sprites/glyphs.

Это сознательная детализация: карта должна давать географический контекст и основные улицы, но не пытаться стать офлайн-навигацией.

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

Для остальных меняется только первая строка `geocodeArea`.

### Нормализация city GeoJSON

Сырой экспорт Overpass Turbo **не коммитьте вместо готового файла**.

Для каждой Feature:

```text
highway                          -> category="road", class=<highway>
waterway=river|canal             -> category="water-line", class=<waterway>
natural=water                    -> category="water-area"
leisure=park                     -> category="green", class="park"
landuse=forest                   -> category="green", class="forest"
landuse=recreation_ground        -> category="green", class="recreation_ground"
place=city|town|suburb|quarter   -> category="label", class=<place>
```

Сохраняйте полезные поля, когда они есть:

```text
name
ref
population
```

OSM service metadata можно сократить до стабильного `osmId`/исходных тегов, если они нужны для диагностики. Не тащите огромные машинные payload в popup data без пользы.

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

Для остальных городов замените `regionId`, `regionTitle` и `bbox` по таблице выше.

Не упрощайте геометрию дополнительно на первом проходе. Если конкретный city file станет непрактично большим, сначала измерьте размер и только потом меняйте общий data contract.

Минимальная проверка каждого city pack:

```text
roads >= 20
water features >= 2
```

## Что сейчас надо выгрузить

Для полного текущего набора подготовьте административные snapshots:

```text
map-data/packs/cities/belgrade.geojson
map-data/packs/cities/novi-sad.geojson
map-data/packs/cities/nis.geojson
map-data/packs/cities/subotica.geojson
```

Белград тоже лучше перегрузить: текущий файл — старый rectangle-based pilot. Новая версия должна использовать административную область так же, как остальные три города.

Отдельный новый `belgrade-lite.geojson` для этой задачи не нужен.

## Google My Maps snapshots

Для Google My Maps один логический snapshot всегда состоит из **трёх файлов**:

```text
<MID>.kml
<MID>.geojson
<MID>.json
```

Нельзя обновить только один из трёх.

Best-effort KML URL:

```text
https://www.google.com/maps/d/kml?mid=<MID>&forcekml=1
```

Это не гарантированный API. При 403/CORS/ошибке/аномально маленьком ответе оставляйте предыдущий snapshot.

Порядок обновления:

1. Получите KML.
2. Проверьте наличие `<kml>` и реальных `<Placemark>`.
3. Конвертируйте в GeoJSON по текущему контракту.
4. Сохраните `sourceId: google-mymaps:<MID>`.
5. Пересчитайте metadata sidecar:
   - `sourceKind`;
   - `sourceId`;
   - `upstreamId`;
   - `dataFile`;
   - `snapshotAt`;
   - `bytes`;
   - `sha256` KML;
   - `counts.placemarks`.
6. Запустите `node scripts/check-map-data.mjs`.

Pilot MID:

```text
1mxkFBhCULwjecdQUWUIfE1BAQahFG6I
```

Validator проверяет, что KML/GeoJSON/JSON sidecars существуют комплектом и что `bytes`/SHA-256 metadata совпадают с реальным KML.

## Как добавить новый город

Не кладите произвольный `<city>.geojson` в `packs/cities/` заранее: engine finalizer отклоняет незарегистрированный файл.

Сначала:

1. решите, что city pack реально нужен продукту;
2. добавьте region config в `Antiokh/rslive.ru/astro/config/map-regions.config.mjs`;
3. задайте renderer bbox/zoom;
4. обновите engine tests/manifest contract;
5. добавьте город в `scripts/check-map-data.mjs` и эту инструкцию;
6. только затем выгрузите и закоммитьте GeoJSON.

## Как удалить карту

Удаление файла — тоже изменение контракта.

Не удаляйте обязательные `serbia-overview.geojson`, `belgrade.geojson`, Belgrade Lite или Google pilot sidecars без синхронного изменения validator/engine. Иначе sync специально завершится ошибкой до destructive mirror.

Для optional city pack сначала убедитесь, что engine допускает `unavailable`, затем удаляйте файл отдельным PR.

## Атрибуция

OSM-derived GeoJSON должен сохранять:

```text
© OpenStreetMap contributors · ODbL
```

Не удаляйте attribution при нормализации.

Google My Maps snapshot сохраняет происхождение в metadata и не даёт права кэшировать сторонние Google tiles, Street View или другие remote assets.

## Чего не делать

- не добавлять scheduled refresh;
- не выполнять Overpass-запросы в production build;
- не выполнять Overpass-запросы у конечного пользователя;
- не обновлять карты «просто потому что прошёл месяц»;
- не использовать renderer bbox вместо административной области acquisition;
- не добавлять buildings/POI/residential/service roads без отдельного решения по размеру и UX;
- не коммить сырой Overpass export как готовый RSLive GeoJSON;
- не создавать пустые city placeholders;
- не заменять last-known-good при ошибке или подозрительно маленькой выгрузке;
- не кэшировать сторонние Google/OpenStreetMap tile responses как first-party data;
- не менять GeoJSON contract без синхронного изменения validators и engine.
