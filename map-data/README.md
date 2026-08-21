# Картографические данные RSLive

Этот каталог хранит публикуемые first-party снимки карт для `rslive.ru`.

Карты **не обновляются автоматически**. Это редко меняющиеся данные: новый snapshot делается вручную только тогда, когда есть практическая причина обновить покрытие или источник.

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
  snapshots/
    google-mymaps/
      <mid>.kml
      <mid>.geojson
      <mid>.json
```

После публикации эти данные зеркалируются движком в `astro/public/maps/**`. Реализация renderer, PWA, Cache Storage и MapLibre находится в `Antiokh/rslive.ru`.

## Общее правило обновления

1. Не обновляйте карту «по расписанию».
2. Сначала сохраните текущий файл как last-known-good в Git.
3. Получите новую выгрузку вручную из исходного источника.
4. Проверьте, что выгрузка покрывает нужную территорию и содержит ожидаемые классы объектов.
5. Сохраните RSLive metadata и структуру свойств существующего файла. Сырой экспорт Overpass Turbo нельзя просто подменить вместо готового RSLive GeoJSON, если у него нет нужных `category`, `regionId`, `bbox` и других полей контракта.
6. После замены сравните размер и количество объектов с предыдущей версией. Резкое уменьшение обычно означает неполную выгрузку.
7. Закоммитьте изменение отдельным PR. При ошибке источника оставьте предыдущий snapshot.

## Serbia Overview

Источник — OpenStreetMap. Для ручной выгрузки удобно использовать [Overpass Turbo](https://overpass-turbo.eu/).

Текущий обзор содержит:

- дороги `motorway`, `trunk`, `primary` с `ref`;
- именованные реки;
- подписи населённых пунктов `city` и `town`.

Можно использовать такой запрос:

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
2. Вставьте запрос и запустите его.
3. Проверьте, что результат покрывает Сербию целиком.
4. Выберите `Export` → `GeoJSON` и сохраните выгрузку локально.
5. Нормализуйте её под текущий `map-data/core/serbia-overview.geojson`:
   - дороги: `category: "road"`, `class` из `highway`, `name`, `ref`;
   - реки: `category: "water-line"`, `class: "river"`, `name`;
   - города: `category: "label"`, `class` из `place`, `name`, при наличии `population`;
   - в корневых `properties` сохраните `regionId: "serbia-overview"`, `core: true`, `bbox`, attribution и дату ручного обновления.
6. Оставьте только разумное количество подписей городов/посёлков, как в текущем snapshot, чтобы overview не превращался в детальную карту.

Минимальная проверка текущего engine-контракта: не менее 50 дорог, 2 рек и 8 подписей.

## Belgrade Lite

Границы пилотного покрытия:

```text
south: 44.68
west:  20.18
north: 44.97
east:  20.68
```

Запрос для Overpass Turbo:

```overpass
[out:json][timeout:70];
(
  way["waterway"~"river|canal"](44.68,20.18,44.97,20.68);
  way["natural"="water"](44.68,20.18,44.97,20.68);
  way["leisure"="park"](44.68,20.18,44.97,20.68);
  way["landuse"~"forest|recreation_ground"](44.68,20.18,44.97,20.68);
  way["highway"~"motorway|trunk|primary|secondary|tertiary"](44.68,20.18,44.97,20.68);
  node["place"~"city|town|suburb|quarter"](44.68,20.18,44.97,20.68);
);
out geom;
```

Экспортируйте результат как GeoJSON и нормализуйте свойства по существующему `map-data/basemaps/belgrade-lite.geojson`:

- дороги → `category: "road"`;
- river/canal → `category: "water-line"`;
- `natural=water` → `category: "water-area"`;
- park/forest/recreation_ground → `category: "green"`;
- place nodes → `category: "label"`.

Минимальная проверка: не менее 20 дорожных объектов и 2 водных объектов.

`map-data/packs/cities/belgrade.geojson` использует те же features, но дополнительно содержит региональные metadata (`regionId: "belgrade"`, bounds, `optionalPack: true`). После обновления Belgrade Lite обновите и этот pack, сохранив его текущий контракт.

## Google My Maps snapshots

Для Google My Maps хранится исходный KML, производный GeoJSON и metadata sidecar.

Для карты с `mid=<MID>` исходный KML можно получить вручную из My Maps либо через best-effort export URL:

```text
https://www.google.com/maps/d/kml?mid=<MID>&forcekml=1
```

Этот URL не является гарантированным публичным API, поэтому при любой ошибке не заменяйте рабочий snapshot.

После ручного обновления:

1. сохраните новый `<MID>.kml`;
2. убедитесь, что он содержит ожидаемые `Placemark` и геометрию;
3. пересоберите соответствующий `<MID>.geojson` по тому же контракту, что у существующего файла;
4. обновите `<MID>.json`: `snapshotAt`, размер, SHA-256 и счётчики;
5. проверьте, что `sourceId` остаётся `google-mymaps:<MID>`.

Pilot MID:

```text
1mxkFBhCULwjecdQUWUIfE1BAQahFG6I
```

## Что не делать

- не добавлять scheduled refresh;
- не выполнять Overpass-запросы в production build;
- не выполнять Overpass-запросы у конечного пользователя;
- не заменять last-known-good при неудачной или подозрительно маленькой выгрузке;
- не кэшировать сторонние Google/OpenStreetMap tile responses как first-party данные;
- не менять формат GeoJSON без синхронного изменения и проверки engine-контракта в `Antiokh/rslive.ru`.
