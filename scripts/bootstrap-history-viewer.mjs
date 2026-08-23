import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const mid = '1kjRg87uMqwqNh0re4t7vw9XE79DLx7w';
const bounds = [19.65, 44.68, 20.68, 45.42];
const output = path.resolve('map-data/snapshots/google-mymaps');
const headers = { accept: '*/*', 'user-agent': 'Mozilla/5.0 RSLive LKG bootstrap' };

function decodeXml(value = '') {
  return String(value).replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/i, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'").replace(/&#39;/g, "'").replace(/&amp;/g, '&').trim();
}
function stripMarkup(value = '') {
  return decodeXml(value).replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ').replace(/\n\s*/g, '\n').trim();
}
function tagValue(block, tagName) {
  const match = block.match(new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return match ? decodeXml(match[1]) : '';
}
async function fetchBytes(url) {
  const response = await fetch(url, { redirect: 'follow', headers });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!bytes.byteLength) throw new Error(`${url}: empty response`);
  return { bytes, text: new TextDecoder().decode(bytes).replace(/^\uFEFF/, ''), contentType: response.headers.get('content-type') || null };
}

const exportUrl = `https://www.google.com/maps/d/kml?mid=${encodeURIComponent(mid)}&forcekml=1`;
const viewerUrl = `https://www.google.com/maps/d/viewer?mid=${encodeURIComponent(mid)}`;
const [kmlResponse, viewerResponse] = await Promise.all([fetchBytes(exportUrl), fetchBytes(viewerUrl)]);
if (!/<kml\b/i.test(kmlResponse.text)) throw new Error('History export is not KML.');
const placemarks = kmlResponse.text.match(/<Placemark\b[\s\S]*?<\/Placemark>/gi) || [];
if (!placemarks.length) throw new Error('History KML contains no Placemark.');

const viewer = viewerResponse.text.replace(/\\"/g, '"');
const markerPattern = /\[\[null,\[(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)\]\],"0",null,"[^"]+",\[[^\]]+\],\[0,0\],"[^"]+"\],\[\["([^"]+)"\]\]\]/g;
const coordinatesByName = new Map();
for (const match of viewer.matchAll(markerPattern)) {
  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  const name = match[3];
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !name) continue;
  if (coordinatesByName.has(name)) throw new Error(`Duplicate viewer marker name: ${name}`);
  coordinatesByName.set(name, [longitude, latitude]);
}
if (coordinatesByName.size !== placemarks.length) throw new Error(`Viewer/KML feature count mismatch: viewer=${coordinatesByName.size}, KML=${placemarks.length}`);

const features = placemarks.map((placemark) => {
  const name = stripMarkup(tagValue(placemark, 'name'));
  const description = stripMarkup(tagValue(placemark, 'description'));
  const address = stripMarkup(tagValue(placemark, 'address'));
  const coordinates = coordinatesByName.get(name);
  if (!name || !coordinates) throw new Error(`No viewer coordinates for KML placemark: ${name || '(unnamed)'}`);
  return { type: 'Feature', geometry: { type: 'Point', coordinates }, properties: { name, description, ...(address ? { address } : {}) } };
});

const snapshotAt = new Date().toISOString();
const sourceId = `google-mymaps:${mid}`;
const geojson = {
  type: 'FeatureCollection',
  properties: { sourceKind: 'google-mymaps', sourceId, upstreamUrl: `https://www.google.com/maps/d/viewer?mid=${mid}`, acquisition: 'google-kml-plus-viewer-coordinates', snapshotAt, sourceFeatureCount: features.length, bounds },
  features,
};
const metadata = {
  schema: 1, sourceKind: 'google-mymaps', sourceId, upstreamId: mid,
  upstreamUrl: `https://www.google.com/maps/d/viewer?mid=${mid}`,
  acquisition: 'google-kml-plus-viewer-coordinates', exportUrl, viewerUrl, snapshotAt,
  contentType: kmlResponse.contentType, bytes: kmlResponse.bytes.byteLength,
  sha256: createHash('sha256').update(kmlResponse.bytes).digest('hex'),
  counts: { placemarks: placemarks.length, folders: (kmlResponse.text.match(/<Folder\b/gi) || []).length, points: 0, lineStrings: 0, polygons: 0, multiGeometries: 0, geometries: features.length, viewerPoints: coordinatesByName.size },
  dataFile: `${mid}.kml`,
};
await mkdir(output, { recursive: true });
await writeFile(path.join(output, `${mid}.kml`), kmlResponse.bytes);
await writeFile(path.join(output, `${mid}.geojson`), `${JSON.stringify(geojson)}\n`);
await writeFile(path.join(output, `${mid}.json`), `${JSON.stringify(metadata, null, 2)}\n`);
console.log(`[maps] history LKG: ${features.length} point(s), ${kmlResponse.bytes.byteLength} KML bytes.`);
