import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const OUTPUT = path.resolve('map-data/snapshots/google-mymaps');
const MAX_BYTES = 5 * 1024 * 1024;
const TIMEOUT_MS = 10_000;
const BELGRADE_BOUNDS = [20.18, 44.68, 20.68, 44.97];
const SERBIA_BOUNDS = [18.75, 42.2, 23.05, 46.2];
const BELGRADE_NOVI_SAD_BOUNDS = [19.65, 44.68, 20.68, 45.42];
const candidates = [
  { mid: '12l4BVYg_FV0d9CMeEWEtnJDQioL9804', bounds: BELGRADE_BOUNDS },
  { mid: '1qkPRUNRiCqA-uFugbcuVy9INXgw', bounds: BELGRADE_BOUNDS },
  { mid: '19YcKmasJpwHsfB9kvpoSmRA_qD22yhw', bounds: SERBIA_BOUNDS },
  { mid: '1GobqFwJp0QiRJcMYpBKIusIVxUI43kE', bounds: SERBIA_BOUNDS },
  { mid: '1qkp5VjmSJBjdaRRnxEtv0gZEaL2Dpk4', bounds: SERBIA_BOUNDS },
  { mid: '1kjRg87uMqwqNh0re4t7vw9XE79DLx7w', bounds: BELGRADE_NOVI_SAD_BOUNDS },
];

function decodeXml(value = '') {
  return String(value)
    .replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/i, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'").replace(/&#39;/g, "'").replace(/&amp;/g, '&').trim();
}
function stripMarkup(value = '') {
  return decodeXml(value).replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
function tagValue(block, tagName) {
  const match = block.match(new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return match ? decodeXml(match[1]) : '';
}
function cleanDescription(value = '') {
  const text = stripMarkup(value);
  if (!text) return '';
  const lower = text.toLowerCase();
  const machineKeys = ['place_id:', 'tags:', 'search_url:', 'map_url:', 'main_category:', 'image_url:', 'additional:', 'website:', 'parent_place:', 'additional_urls:'];
  if (machineKeys.filter((key) => lower.includes(key)).length >= 3) return '';
  return text.length > 500 ? `${text.slice(0, 497)}…` : text;
}
function parseCoordinateTuple(value) {
  const [lonRaw, latRaw] = String(value || '').trim().split(',');
  const lon = Number(lonRaw); const lat = Number(latRaw);
  return Number.isFinite(lon) && Number.isFinite(lat) ? [lon, lat] : null;
}
function parseCoordinateList(value) {
  return String(value || '').trim().split(/\s+/).map(parseCoordinateTuple).filter(Boolean);
}
function collectMatches(text, pattern, mapper) {
  const output = [];
  for (const match of text.matchAll(pattern)) { const value = mapper(match); if (value) output.push(value); }
  return output;
}
function geometriesFromPlacemark(placemark) {
  const geometries = [];
  geometries.push(...collectMatches(placemark, /<Point\b[\s\S]*?<coordinates(?:\s[^>]*)?>([\s\S]*?)<\/coordinates>[\s\S]*?<\/Point>/gi, (match) => {
    const coordinates = parseCoordinateList(match[1]); return coordinates.length ? { type: 'Point', coordinates: coordinates[0] } : null;
  }));
  geometries.push(...collectMatches(placemark, /<LineString\b[\s\S]*?<coordinates(?:\s[^>]*)?>([\s\S]*?)<\/coordinates>[\s\S]*?<\/LineString>/gi, (match) => {
    const coordinates = parseCoordinateList(match[1]); return coordinates.length >= 2 ? { type: 'LineString', coordinates } : null;
  }));
  geometries.push(...collectMatches(placemark, /<Polygon\b[\s\S]*?<\/Polygon>/gi, (match) => {
    const polygon = match[0];
    const outer = polygon.match(/<outerBoundaryIs\b[\s\S]*?<coordinates(?:\s[^>]*)?>([\s\S]*?)<\/coordinates>[\s\S]*?<\/outerBoundaryIs>/i);
    if (!outer) return null;
    const outerRing = parseCoordinateList(outer[1]); if (outerRing.length < 4) return null;
    const rings = [outerRing];
    for (const inner of polygon.matchAll(/<innerBoundaryIs\b[\s\S]*?<coordinates(?:\s[^>]*)?>([\s\S]*?)<\/coordinates>[\s\S]*?<\/innerBoundaryIs>/gi)) {
      const ring = parseCoordinateList(inner[1]); if (ring.length >= 4) rings.push(ring);
    }
    return { type: 'Polygon', coordinates: rings };
  }));
  return geometries;
}
function countTag(text, tagName) { return (text.match(new RegExp(`<${tagName}\\b`, 'gi')) || []).length; }
function countsFor(text) {
  const counts = { placemarks: countTag(text, 'Placemark'), folders: countTag(text, 'Folder'), points: countTag(text, 'Point'), lineStrings: countTag(text, 'LineString'), polygons: countTag(text, 'Polygon'), multiGeometries: countTag(text, 'MultiGeometry') };
  if (!/<kml(?:\s|>)/i.test(text) || counts.placemarks === 0) throw new Error('invalid/empty KML');
  return { ...counts, geometries: counts.points + counts.lineStrings + counts.polygons + counts.multiGeometries };
}
function toGeoJson(kmlText, candidate, snapshotAt) {
  const features = [];
  for (const placemark of kmlText.match(/<Placemark\b[\s\S]*?<\/Placemark>/gi) || []) {
    const name = stripMarkup(tagValue(placemark, 'name')) || 'Объект на карте';
    const description = cleanDescription(tagValue(placemark, 'description'));
    for (const geometry of geometriesFromPlacemark(placemark)) features.push({ type: 'Feature', geometry, properties: { name, description } });
  }
  if (!features.length) throw new Error('KML has no supported geometry');
  return { type: 'FeatureCollection', properties: { sourceKind: 'google-mymaps', sourceId: `google-mymaps:${candidate.mid}`, upstreamUrl: `https://www.google.com/maps/d/viewer?mid=${candidate.mid}`, acquisition: 'google-direct-kml', snapshotAt, sourceFeatureCount: features.length, bounds: candidate.bounds }, features };
}
async function fetchKml(mid) {
  const url = new URL('https://www.google.com/maps/d/kml'); url.searchParams.set('mid', mid); url.searchParams.set('forcekml', '1');
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { redirect: 'follow', signal: controller.signal, headers: { accept: 'application/vnd.google-earth.kml+xml,application/xml,text/xml,*/*;q=0.5', 'user-agent': 'RSLive LKG bootstrap/1.0 (+https://rslive.ru)' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!bytes.byteLength || bytes.byteLength > MAX_BYTES) throw new Error(`invalid size ${bytes.byteLength}`);
    const text = new TextDecoder().decode(bytes).replace(/^\uFEFF/, '');
    if (/<!doctype html|<html/i.test(text.slice(0, 4096))) throw new Error('HTML instead of KML');
    return { url: url.href, bytes, text, contentType: response.headers.get('content-type') || null };
  } finally { clearTimeout(timer); }
}

await mkdir(OUTPUT, { recursive: true });
const summary = [];
for (const candidate of candidates) {
  const acquired = await fetchKml(candidate.mid);
  const counts = countsFor(acquired.text);
  const snapshotAt = new Date().toISOString();
  const geojson = toGeoJson(acquired.text, candidate, snapshotAt);
  const sha256 = createHash('sha256').update(acquired.bytes).digest('hex');
  const metadata = { schema: 1, sourceKind: 'google-mymaps', sourceId: `google-mymaps:${candidate.mid}`, upstreamId: candidate.mid, upstreamUrl: `https://www.google.com/maps/d/viewer?mid=${candidate.mid}`, acquisition: 'google-direct-kml', exportUrl: acquired.url, snapshotAt, contentType: acquired.contentType, bytes: acquired.bytes.byteLength, sha256, counts, dataFile: `${candidate.mid}.kml` };
  await writeFile(path.join(OUTPUT, `${candidate.mid}.kml`), acquired.bytes);
  await writeFile(path.join(OUTPUT, `${candidate.mid}.geojson`), `${JSON.stringify(geojson)}\n`);
  await writeFile(path.join(OUTPUT, `${candidate.mid}.json`), `${JSON.stringify(metadata, null, 2)}\n`);
  summary.push({ mid: candidate.mid, bytes: acquired.bytes.byteLength, placemarks: counts.placemarks, features: geojson.features.length, sha256 });
  console.log(JSON.stringify(summary.at(-1)));
}
await writeFile('/tmp/google-lkg-summary.json', `${JSON.stringify(summary, null, 2)}\n`);
