import { access, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { gunzipSync, gzipSync } from 'node:zlib';

const root = process.cwd();
const checkOnly = process.argv.includes('--check');

// Only product/runtime layers belong here. Auxiliary/acquisition GeoJSON may live next to
// map-data sources but must not gain a production gzip payload merely because it exists.
// In particular, belgrade-ext.geojson is the wider Belgrade-area reference dataset and is
// intentionally not a MapEmbed region or a mirrored runtime payload.
const runtimeGeoJson = [
  { id: 'serbia', path: 'map-data/core/serbia-overview.geojson', required: true },
  { id: 'belgrade', path: 'map-data/packs/cities/belgrade.geojson', required: true },
  { id: 'novi-sad', path: 'map-data/packs/cities/novi-sad.geojson', required: true },
  { id: 'nis', path: 'map-data/packs/cities/nis.geojson', required: true },
  { id: 'subotica', path: 'map-data/packs/cities/subotica.geojson', required: true },
];

function fail(message) {
  throw new Error(`[map-data:gzip] ${message}`);
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function buildOne(entry) {
  const sourcePath = path.join(root, entry.path);
  const gzipPath = `${sourcePath}.gz`;

  if (!(await exists(sourcePath))) {
    if (entry.required) fail(`обязательный source отсутствует: ${entry.path}`);
    if (await exists(gzipPath)) fail(`есть orphan gzip без source: ${entry.path}.gz`);
    return { id: entry.id, present: false };
  }

  const source = await readFile(sourcePath);
  if (source.byteLength === 0) fail(`source пуст: ${entry.path}`);

  // Semantic GeoJSON validation lives in check-map-data.mjs. Here we only refuse to derive
  // compressed bytes from malformed JSON.
  try {
    JSON.parse(source.toString('utf8'));
  } catch (error) {
    fail(`${entry.path} не является валидным JSON: ${error?.message || error}`);
  }

  if (checkOnly) {
    if (!(await exists(gzipPath))) fail(`derived gzip отсутствует: ${entry.path}.gz`);
    const committed = await readFile(gzipPath);
    let committedRoundTrip;
    try {
      committedRoundTrip = gunzipSync(committed);
    } catch (error) {
      fail(`${entry.path}.gz не является валидным gzip: ${error?.message || error}`);
    }
    if (!committedRoundTrip.equals(source)) fail(`${entry.path}.gz устарел относительно source GeoJSON`);
    if (committed.byteLength >= source.byteLength) {
      fail(`gzip не уменьшает ${entry.path}: source=${source.byteLength}, gzip=${committed.byteLength}`);
    }
  } else {
    // gzip level 9 is deliberately boring and widely supported. We validate by round-trip rather
    // than exact compressed bytes so a harmless zlib-version change cannot break CI.
    const compressed = gzipSync(source, { level: 9 });
    const roundTrip = gunzipSync(compressed);
    if (!roundTrip.equals(source)) fail(`gzip round-trip изменяет байты source: ${entry.path}`);
    if (compressed.byteLength >= source.byteLength) {
      fail(`gzip не уменьшает ${entry.path}: source=${source.byteLength}, gzip=${compressed.byteLength}`);
    }
    await writeFile(gzipPath, compressed);
  }

  const gzipBytes = (await stat(gzipPath)).size;
  return {
    id: entry.id,
    present: true,
    sourceBytes: source.byteLength,
    gzipBytes,
    ratio: Number((gzipBytes / source.byteLength).toFixed(4)),
    savedPercent: Number(((1 - gzipBytes / source.byteLength) * 100).toFixed(1)),
  };
}

const results = [];
for (const entry of runtimeGeoJson) results.push(await buildOne(entry));

console.log(`[map-data:gzip] ${checkOnly ? 'verified' : 'built'}: ${JSON.stringify(results)}`);
