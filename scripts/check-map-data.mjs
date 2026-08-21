import { createHash } from 'node:crypto';
import { access, readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

const root = process.cwd();
const mapRoot = path.join(root, 'map-data');
const pilotMid = '1mxkFBhCULwjecdQUWUIfE1BAQahFG6I';

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

await checkAllGoogleSidecars();
const result = {
  serbia: await checkSerbia(),
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
  googlePilot: await checkGoogleSet(pilotMid),
};

console.log(`[map-data] snapshots verified: ${JSON.stringify(result)}`);