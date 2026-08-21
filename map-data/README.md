# Картографические данные RSLive

Этот каталог хранит публикуемые first-party snapshots карт для `rslive.ru`.

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
      novi-sad.geojson
      nis.geojson
      subotica.geojson
  snapshots/
    google-mymaps/
      <mid>.kml
      <mid>.geojson
      <mid>.json
```

Файлы `novi-sad.geojson`, `nis.geojson` и `subotica.geojson` появляются здесь после отдельной ручной выгрузки. Пустые заглушки вместо реальных данных не создавайте.

После публикации данные зеркалируются движком в `astro/public/maps/**`. Реализация renderer, PWA, Cache Storage и MapLibre находится в `Antiokh/rslive.ru`.

Важно: каталог `core/` — историческое имя слоя уровня страны, а не указание на автоматическое включение в PWA. И `serbia-overview`, и все городские паки в движке являются **явно выбираемыми** данными. Наличие файла в репозитории само по себе не должно заставлять браузер его скачивать.

## Общее правило обновления

1. Не обновляйте карту «по расписанию».
2. Сначала сохраните текущий файл как last-known-good в Git.
3. Получите новую выгрузку вручную из исходного источника.
4. Проверьте, что выгрузка покрывает нужную территорию и содержит ожидаемые классы объектов.
5. Сохраните RSLive metadata и структуру свойств существующего файла. Сырой экспорт Overpass Turbo нельзя просто подменить вместо готового RSLive GeoJSON, если у него нет нужных `category`, `regionId`, `bbox` и других полей контракта.
6. После замены сравните размер и количество объектов с предыдущей версией. Резкое уменьшение обычно означает неполную выгрузку.
7. Закоммитьте изменение отдельным PR. При ошибке источника оставьте предыдущий snapshot.

## Serbia Overview

Источник — OpenStreetMap. Для ручной выгрузки используйте [Overpass Turbo](https://overpass-turbo.eu/).

Текущий обзор содержит:

- дороги `motorway`, `trunk`, `primary` с `ref`;
- именованные реки;
- подписи населённых пунктов `city` и `town`.

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
   - в корневых `properties` сохраните `regionId: "serbia-overview"`, `bbox`, attribution и дату ручного обновления.
6. Оставьте только разумное количество подписей городов/посёлков, как в текущем snapshot, чтобы overview не превращался в детальную карту.

Поле `core`, если оно осталось в metadata старого snapshot, не определяет PWA-политику и не означает автоматическое скачивание.

Минимальная проверка текущего engine-контракта: не менее 50 дорог, 2 рек и 8 подписей.

## Городские паки

Поддерживаем четыре заранее определённых городских региона:

- Белград — `belgrade`;
- Нови-Сад — `novi-sad`;
- Ниш — `nis`;
- Суботица — `subotica`.

Все четыре региона опциональны. Движок загружает только те слои, которые явно запросил конкретный `MapEmbed`. Наличие городского файла не означает фоновую загрузку и не добавляет его в обычный PWA corpus.

Городскую карту выгружайте **по административной области**, а не по прямоугольнику renderer. Overpass Turbo через `{{geocodeArea:...}}` находит административную область с помощью Nominatim и использует её как `area`. После запуска обязательно визуально проверьте, что выбрана именно нужная административная территория. Прямоугольный `bounds` в engine остаётся UI-ограничением renderer и не определяет состав исходной OSM-выгрузки.

Для всех городов используется один шаблон запроса; меняется только `geocodeArea`:

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

Подставляйте:

```text
Belgrade, Serbia
Novi Sad, Serbia
Niš, Serbia
Subotica, Serbia
```

Для каждого города:

1. запустите запрос и визуально проверьте административную область;
2. `Export` → `GeoJSON`;
3. нормализуйте свойства по текущему городскому контракту:
   - дороги → `category: "road"`;
   - river/canal → `category: "water-line"`;
   - `natural=water` → `category: "water-area"`;
   - park/forest/recreation_ground → `category: "green"`;
   - place nodes → `category: "label"`;
4. добавьте региональные metadata: `regionId`, `regionTitle`, `kind: "city"`, `parent: "serbia-overview"`, renderer `bbox`, `optionalPack: true`;
5. проверьте разумный размер и полноту данных перед заменой last-known-good.

Минимальная проверка для текущего городского слоя: не менее 20 дорожных объектов и 2 водных объектов.

Текущий `map-data/basemaps/belgrade-lite.geojson` — историческое имя pilot-базы. После стабилизации renderer отдельный `basemaps/` слой можно убрать и использовать `packs/cities/belgrade.geojson` как единственный источник городских данных.

Текущий `map-data/packs/cities/belgrade.geojson` был получен до перехода на административную выборку. Считайте его last-known-good pilot; следующая ручная выгрузка Белграда должна использовать административную область.

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
- не считать наличие файла согласием на его автоматическую загрузку;
- не заменять last-known-good при неудачной или подозрительно маленькой выгрузке;
- не кэшировать сторонние Google/OpenStreetMap tile responses как first-party данные;
- не менять формат GeoJSON без синхронного изменения и проверки engine-контракта в `Antiokh/rslive.ru`.