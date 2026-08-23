import { createHash } from 'node:crypto';
import { access, readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { isSha256, normalizedYandexSnapshotSha256 } from './yandex-lkg-utils.mjs';

const root = process.cwd();
const mapRoot = path.join(root, 'map-data');
const requiredGoogleMids = Object.freeze([
  '1mxkFBhCULwjecdQUWUIfE1BAQahFG6I',
  '12l4BVYg_FV0d9CMeEWEtnJDQioL9804',
  '1qkPRUNRiCqA-uFugbcuVy9INXgw',
  '1GobqFwJp0QiRJcMYpBKIusIVxUI43kE',
  '1qkp5VjmSJBjdaRRnxEtv0gZEaL2Dpk4',
  '1kjRg87uMqwqNh0re4t7vw9XE79DLx7w',
]);

function fail(message) {
  throw new Error(`[map-data] ${message}`);
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function requireNonEmpty(file, label) {
  let info;
  try {
    info = await stat(file);
  } catch {
    fail(`${label} отсутствует: ${path.relative(root, file)}`);
  }
  if (!info.isFile() || info.size <= 0) fail(`${label} пуст: ${path.relative(root, file)}`);
  return info.size;
}

async function readJson(file, label) {
  await requireNonEmpty(file, label);
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    fail(`${label} не является валидным JSON: ${error?.message || error}`);
  }
}

async function checkOptionalGzip(sourceFile, label) {
  const gzipFile = `${sourceFile}.gz`;
  if (!(await exists(gzipFile))) return { present: false };

  const [source, compressed] = await Promise.all([
    readFile(sourceFile),
    readFile(gzipFile),
  ]);
  let roundTrip;
  try {
    roundTrip = gunzipSync(compressed);
  } catch (error) {
    fail(`${label}: ${path.basename(gzipFile)} не является валидным gzip: ${error?.message || error}`);
  }
  if (!roundTrip.equals(source)) fail(`${label}: gzip устарел относительно source GeoJSON`);
  if (compressed.byteLength >= source.byteLength) {
    fail(`${label}: gzip не уменьшает source: source=${source.byteLength}, gzip=${compressed.byteLength}`);
  }
  return {
    present: true,
    sourceBytes: source.byteLength,
    gzipBytes: compressed.byteLength,
    savedPercent: Number(((1 - compressed.byteLength / source.byteLength) * 100).toFixed(1)),
  };
}

function checkFeatureCollection(document, label) {
  if (document?.type !== 'FeatureCollection' || !Array.isArray(document.features)) {
    fail(`${label} должен быть GeoJSON FeatureCollection`);
  }
  if (document.features.length === 0) fail(`${label} не должен быть пустым`);
}

function categoryCount(document, predicate) {
  return document.features.filter((feature) => predicate(String(feature?.properties?.category || ''))).length;
}

async function checkSerbia() {
  const file = path.join(mapRoot, 'core/serbia-overview.geojson');
  const document = await readJson(file, 'Карта Сербии');
  checkFeatureCollection(document, 'Карта Сербии');
  const regionId = document.properties?.regionId;
  if (!['serbia', 'serbia-overview'].includes(regionId)) {
    fail(`Карта Сербии имеет неожиданный regionId: ${regionId || 'нет'}`);
  }
  const roads = categoryCount(document, (value) => value === 'road');
  const rivers = categoryCount(document, (value) => value === 'water-line');
  const labels = categoryCount(document, (value) => value === 'label');
  if (roads < 50 || rivers < 2 || labels < 8) {
    fail(`Карта Сербии выглядит неполной: roads=${roads}, rivers=${rivers}, labels=${labels}`);
  }
  return {
    features: document.features.length,
    roads,
    rivers,
    labels,
    gzip: await checkOptionalGzip(file, 'Карта Сербии'),
  };
}

function checkBoundaryRing(ring, label) {
  if (!Array.isArray(ring) || ring.length < 4) fail(`${label}: boundary ring должен содержать минимум 4 координаты`);
  for (const [index, coordinate] of ring.entries()) {
    if (!Array.isArray(coordinate) || coordinate.length < 2) fail(`${label}: coordinate ${index} не является [lon, lat]`);
    const longitude = Number(coordinate[0]);
    const latitude = Number(coordinate[1]);
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180 || !Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      fail(`${label}: coordinate ${index} выходит за пределы WGS84`);
    }
  }
}

async function checkSerbiaRegions() {
  const file = path.join(mapRoot, 'core/serbia-regions.geojson');
  const document = await readJson(file, 'Границы регионов Сербии');
  checkFeatureCollection(document, 'Границы регионов Сербии');
  if (document.features.length < 20) {
    fail(`Границы регионов Сербии выглядят неполными: features=${document.features.length}, ожидается минимум 20`);
  }

  let polygons = 0;
  for (const [featureIndex, feature] of document.features.entries()) {
    const geometry = feature?.geometry;
    if (feature?.type !== 'Feature' || !['Polygon', 'MultiPolygon'].includes(geometry?.type)) {
      fail(`Границы регионов Сербии: feature ${featureIndex} должен быть Polygon или MultiPolygon`);
    }
    const polygonSet = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
    if (!Array.isArray(polygonSet) || polygonSet.length === 0) fail(`Границы регионов Сербии: feature ${featureIndex} не содержит polygon`);
    for (const [polygonIndex, polygon] of polygonSet.entries()) {
      if (!Array.isArray(polygon) || polygon.length === 0) fail(`Границы регионов Сербии: feature ${featureIndex}, polygon ${polygonIndex} не содержит rings`);
      polygons += 1;
      for (const [ringIndex, ring] of polygon.entries()) {
        checkBoundaryRing(ring, `Границы регионов Сербии: feature ${featureIndex}, polygon ${polygonIndex}, ring ${ringIndex}`);
      }
    }
  }

  return { features: document.features.length, polygons };
}

async function checkCity(id, { acceptedRegionIds = [id], requireOptionalPack = true } = {}) {
  const file = path.join(mapRoot, `packs/cities/${id}.geojson`);
  if (!(await exists(file))) fail(`Обязательный городской snapshot отсутствует: map-data/packs/cities/${id}.geojson`);
  const document = await readJson(file, `Городской snapshot ${id}`);
  checkFeatureCollection(document, `Городской snapshot ${id}`);
  if (!acceptedRegionIds.includes(document.properties?.regionId)) {
    fail(`${id}: неожиданный regionId ${document.properties?.regionId || 'нет'}; ожидается ${acceptedRegionIds.join(' или ')}`);
  }
  if (requireOptionalPack && document.properties?.optionalPack !== true) fail(`${id}: optionalPack должен быть true`);
  const roads = categoryCount(document, (value) => value === 'road');
  const water = categoryCount(document, (value) => value.startsWith('water'));
  if (roads < 20 || water < 2) fail(`${id} выглядит неполным: roads=${roads}, water=${water}`);
  return {
    present: true,
    features: document.features.length,
    roads,
    water,
    gzip: await checkOptionalGzip(file, `Городской snapshot ${id}`),
  };
}

async function checkLegacyBelgradeLite() {
  const file = path.join(mapRoot, 'basemaps/belgrade-lite.geojson');
  const document = await readJson(file, 'Belgrade Lite');
  checkFeatureCollection(document, 'Belgrade Lite');
  const roads = categoryCount(document, (value) => value === 'road');
  const water = categoryCount(document, (value) => value.startsWith('water'));
  if (roads < 20 || water < 2) fail(`Belgrade Lite выглядит неполным: roads=${roads}, water=${water}`);
  return { features: document.features.length, roads, water };
}

async function checkGoogleSet(mid) {
  const dir = path.join(mapRoot, 'snapshots/google-mymaps');
  const kmlFile = path.join(dir, `${mid}.kml`);
  const geojsonFile = path.join(dir, `${mid}.geojson`);
  const metadataFile = path.join(dir, `${mid}.json`);

  const kmlBytes = await requireNonEmpty(kmlFile, `Google My Maps KML ${mid}`);
  const kml = await readFile(kmlFile);
  const kmlText = kml.toString('utf8');
  if (!/<kml\b/i.test(kmlText) || !/<Placemark\b/i.test(kmlText)) fail(`${mid}: KML не содержит ожидаемые kml/Placemark`);

  const geojson = await readJson(geojsonFile, `Google My Maps GeoJSON ${mid}`);
  checkFeatureCollection(geojson, `Google My Maps GeoJSON ${mid}`);
  const sourceId = `google-mymaps:${mid}`;
  if (geojson.properties?.sourceId !== sourceId) fail(`${mid}: GeoJSON sourceId должен быть ${sourceId}`);

  const metadata = await readJson(metadataFile, `Google My Maps metadata ${mid}`);
  if (metadata?.sourceKind !== 'google-mymaps') fail(`${mid}: sourceKind должен быть google-mymaps`);
  if (metadata?.sourceId !== sourceId) fail(`${mid}: metadata sourceId должен быть ${sourceId}`);
  if (metadata?.upstreamId !== mid) fail(`${mid}: upstreamId должен быть ${mid}`);
  if (metadata?.dataFile !== `${mid}.kml`) fail(`${mid}: dataFile должен ссылаться на ${mid}.kml`);
  if (metadata?.bytes !== kmlBytes) fail(`${mid}: metadata.bytes=${metadata?.bytes}, фактически ${kmlBytes}`);
  const sha256 = createHash('sha256').update(kml).digest('hex');
  if (metadata?.sha256 !== sha256) fail(`${mid}: SHA-256 metadata не совпадает с KML`);
  if (!(Number(metadata?.counts?.placemarks) > 0)) fail(`${mid}: metadata.counts.placemarks должен быть > 0`);

  return { kmlBytes, geojsonFeatures: geojson.features.length, placemarks: metadata.counts.placemarks };
}

async function checkAllGoogleSidecars() {
  const dir = path.join(mapRoot, 'snapshots/google-mymaps');
  const files = await readdir(dir).catch(() => []);
  const mids = new Set(files.map((name) => name.replace(/\.(?:kml|geojson|json)$/i, '')).filter(Boolean));
  for (const mid of mids) {
    const expected = [`${mid}.kml`, `${mid}.geojson`, `${mid}.json`];
    for (const filename of expected) {
      if (!files.includes(filename)) fail(`${mid}: snapshot-набор неполный, отсутствует ${filename}`);
    }
  }
}

async function checkYandexSet(id) {
  const dir = path.join(mapRoot, 'snapshots/yandex-constructor');
  const geojsonFile = path.join(dir, `${id}.geojson`);
  const metadataFile = path.join(dir, `${id}.json`);
  const sourceId = `yandex-constructor:${id}`;

  const geojson = await readJson(geojsonFile, `Yandex Constructor GeoJSON ${id}`);
  checkFeatureCollection(geojson, `Yandex Constructor GeoJSON ${id}`);
  if (geojson.properties?.sourceKind !== 'yandex-embed') fail(`${id}: GeoJSON sourceKind должен быть yandex-embed`);
  if (geojson.properties?.sourceId !== sourceId) fail(`${id}: GeoJSON sourceId должен быть ${sourceId}`);
  if (geojson.properties?.filter !== 'serbia-regions') fail(`${id}: GeoJSON filter должен быть serbia-regions`);
  const normalizedSha256 = normalizedYandexSnapshotSha256(geojson);

  const metadata = await readJson(metadataFile, `Yandex Constructor metadata ${id}`);
  if (metadata?.sourceKind !== 'yandex-embed') fail(`${id}: metadata sourceKind должен быть yandex-embed`);
  if (metadata?.sourceId !== sourceId) fail(`${id}: metadata sourceId должен быть ${sourceId}`);
  if (metadata?.upstreamId !== id) fail(`${id}: upstreamId должен быть ${id}`);
  if (metadata?.dataFile !== `${id}.geojson`) fail(`${id}: dataFile должен ссылаться на ${id}.geojson`);
  if (metadata?.filter !== 'serbia-regions') fail(`${id}: metadata filter должен быть serbia-regions`);
  if (metadata?.boundaryFile !== 'map-data/core/serbia-regions.geojson') fail(`${id}: metadata boundaryFile должен ссылаться на serbia-regions.geojson`);
  if (!isSha256(metadata?.htmlSha256)) fail(`${id}: metadata.htmlSha256 должен быть SHA-256`);
  if (!isSha256(metadata?.normalizedSha256)) fail(`${id}: metadata.normalizedSha256 должен быть SHA-256`);
  if (metadata.normalizedSha256 !== normalizedSha256) fail(`${id}: normalizedSha256 не совпадает с GeoJSON`);

  const sourceFeatureCount = Number(metadata?.sourceFeatureCount);
  const geojsonFeatures = Number(metadata?.geojsonFeatures);
  const excludedOutsideSerbia = Number(metadata?.excludedOutsideSerbia);
  if (!Number.isInteger(sourceFeatureCount) || sourceFeatureCount <= 0) fail(`${id}: sourceFeatureCount должен быть > 0`);
  if (!Number.isInteger(geojsonFeatures) || geojsonFeatures !== geojson.features.length) fail(`${id}: geojsonFeatures не совпадает с GeoJSON`);
  if (!Number.isInteger(excludedOutsideSerbia) || excludedOutsideSerbia !== sourceFeatureCount - geojsonFeatures) {
    fail(`${id}: excludedOutsideSerbia не совпадает с sourceFeatureCount - geojsonFeatures`);
  }
  if (Number(geojson.properties?.sourceFeatureCount) !== sourceFeatureCount) fail(`${id}: sourceFeatureCount metadata/GeoJSON расходятся`);
  if (Number(geojson.properties?.includedFeatureCount) !== geojsonFeatures) fail(`${id}: includedFeatureCount metadata/GeoJSON расходятся`);
  if (Number(geojson.properties?.excludedOutsideSerbia) !== excludedOutsideSerbia) fail(`${id}: excludedOutsideSerbia metadata/GeoJSON расходятся`);

  return { sourceFeatureCount, geojsonFeatures, excludedOutsideSerbia, normalizedSha256 };
}

async function checkAllYandexSidecars() {
  const dir = path.join(mapRoot, 'snapshots/yandex-constructor');
  const files = await readdir(dir).catch(() => []);
  if (files.length === 0) return [];
  const unexpected = files.filter((name) => !/\.(?:geojson|json)$/i.test(name));
  if (unexpected.length > 0) fail(`Yandex snapshot directory содержит неожиданные файлы: ${unexpected.join(', ')}`);

  const ids = new Set(files.map((name) => name.replace(/\.(?:geojson|json)$/i, '')).filter(Boolean));
  const result = [];
  for (const id of ids) {
    for (const filename of [`${id}.geojson`, `${id}.json`]) {
      if (!files.includes(filename)) fail(`${id}: Yandex snapshot-набор неполный, отсутствует ${filename}`);
    }
    result.push({ id, ...(await checkYandexSet(id)) });
  }
  return result;
}

await checkAllGoogleSidecars();
const result = {
  serbia: await checkSerbia(),
  serbiaRegions: await checkSerbiaRegions(),
  belgradeLite: await checkLegacyBelgradeLite(),
  cities: {
    belgrade: await checkCity('belgrade'),
    'belgrade-ext': await checkCity('belgrade-ext', {
      // The current extended snapshot predates the public target id and may still carry the
      // historical Belgrade metadata. File identity is authoritative until the next manual refresh.
      acceptedRegionIds: ['belgrade-ext', 'belgrade'],
      requireOptionalPack: false,
    }),
    'novi-sad': await checkCity('novi-sad'),
    nis: await checkCity('nis'),
    subotica: await checkCity('subotica'),
  },
  google: Object.fromEntries(
    await Promise.all(requiredGoogleMids.map(async (mid) => [mid, await checkGoogleSet(mid)])),
  ),
  yandex: await checkAllYandexSidecars(),
};

console.log(`[map-data] snapshots verified: ${JSON.stringify(result)}`);
