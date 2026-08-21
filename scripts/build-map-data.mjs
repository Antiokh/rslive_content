import { access, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { gunzipSync, gzipSync } from 'node:zlib';

const root = process.cwd();
const checkOnly = process.argv.includes('--check');
const onlyArg = process.argv.find((arg) => arg.startsWith('--only='));
const onlyId = onlyArg ? onlyArg.slice('--only='.length).trim().toLowerCase() : '';

// Manual helper only. GitHub Actions and production builds must not generate map gzip payloads.
// Run it locally after a rare map refresh, then decide whether to commit the resulting sibling .gz.
const runtimeGeoJson = [
  { id: 'serbia', path: 'map-data/core/serbia-overview.geojson', required: true },
  { id: 'belgrade', path: 'map-data/packs/cities/belgrade.geojson', required: true },
  { id: 'belgrade-ext', path: 'map-data/packs/cities/belgrade-ext.geojson', required: true },
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

  try {
    JSON.parse(source.toString('utf8'));
  } catch (error) {
    fail(`${entry.path} не является валидным JSON: ${error?.message || error}`);
  }

  if (checkOnly) {
    if (!(await exists(gzipPath))) fail(`gzip отсутствует: ${entry.path}.gz`);
    const committed = await readFile(gzipPath);
    let roundTrip;
    try {
      roundTrip = gunzipSync(committed);
    } catch (error) {
      fail(`${entry.path}.gz не является валидным gzip: ${error?.message || error}`);
    }
    if (!roundTrip.equals(source)) fail(`${entry.path}.gz устарел относительно source GeoJSON`);
    if (committed.byteLength >= source.byteLength) {
      fail(`gzip не уменьшает ${entry.path}: source=${source.byteLength}, gzip=${committed.byteLength}`);
    }
  } else {
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

const selected = onlyId
  ? runtimeGeoJson.filter((entry) => entry.id === onlyId)
  : runtimeGeoJson;
if (onlyId && selected.length === 0) {
  fail(`неизвестный --only=${onlyId}; допустимо: ${runtimeGeoJson.map((entry) => entry.id).join(', ')}`);
}

const results = [];
for (const entry of selected) results.push(await buildOne(entry));

console.log(`[map-data:gzip] ${checkOnly ? 'verified' : 'built'}: ${JSON.stringify(results)}`);