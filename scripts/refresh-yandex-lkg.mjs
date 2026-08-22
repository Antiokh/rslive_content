import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { normalizedYandexSnapshotSha256 } from './yandex-lkg-utils.mjs';

const root = process.cwd();
const engineAstro = path.resolve(process.env.RSLIVE_ENGINE_ASTRO || 'rslive-engine/astro');
const boundaryFile = path.join(root, 'map-data/core/serbia-regions.geojson');
const snapshotRoot = path.join(root, 'map-data/snapshots/yandex-constructor');
const timeoutMs = 15_000;
const maxBytes = 8 * 1024 * 1024;
const minRelativeRatio = 0.7;
const minIncludedRatio = 0.5;

function fail(message) {
  throw new Error(`[yandex-lkg] ${message}`);
}

async function importEngineModule(relativePath) {
  const file = path.join(engineAstro, relativePath);
  if (!existsSync(file)) fail(`не найден engine module: ${file}`);
  return import(pathToFileURL(file).href);
}

async function atomicWrite(filePath, content) {
  const temporaryPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  await writeFile(temporaryPath, content);
  try {
    await rename(temporaryPath, filePath);
  } finally {
    await rm(temporaryPath, { force: true }).catch(() => {});
  }
}

async function fetchConstructor(candidate) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(candidate.acquisitionUrl, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
        'accept-language': 'ru,en;q=0.8',
        'user-agent': 'RSLive scheduled map LKG refresh/1.0 (+https://rslive.ru)',
      },
    });
    if (!response.ok) fail(`Yandex Constructor ${candidate.constructorId}: HTTP ${response.status}`);

    const declared = Number(response.headers.get('content-length'));
    if (Number.isFinite(declared) && declared > maxBytes) {
      fail(`Yandex Constructor ${candidate.constructorId}: response too large (${declared} bytes)`);
    }

    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength === 0) fail(`Yandex Constructor ${candidate.constructorId}: empty response`);
    if (bytes.byteLength > maxBytes) {
      fail(`Yandex Constructor ${candidate.constructorId}: response too large (${bytes.byteLength} bytes)`);
    }

    return {
      bytes,
      text: new TextDecoder('utf-8', { fatal: false }).decode(bytes).replace(/^\uFEFF/, ''),
      contentType: response.headers.get('content-type') || null,
      finalUrl: response.url || candidate.acquisitionUrl,
    };
  } catch (error) {
    if (error?.name === 'AbortError') fail(`Yandex Constructor ${candidate.constructorId}: timeout after ${timeoutMs} ms`);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function readExisting(candidate) {
  const id = candidate.constructorId;
  const geojsonFile = path.join(snapshotRoot, `${id}.geojson`);
  const metadataFile = path.join(snapshotRoot, `${id}.json`);
  if (!existsSync(geojsonFile) && !existsSync(metadataFile)) return null;
  if (!existsSync(geojsonFile) || !existsSync(metadataFile)) {
    fail(`Yandex Constructor ${id}: existing LKG pair is incomplete`);
  }

  let geojson;
  let metadata;
  try {
    geojson = JSON.parse(await readFile(geojsonFile, 'utf8'));
    metadata = JSON.parse(await readFile(metadataFile, 'utf8'));
  } catch (error) {
    fail(`Yandex Constructor ${id}: existing LKG is invalid JSON (${error?.message || error})`);
  }

  const sourceId = `yandex-constructor:${id}`;
  if (geojson?.properties?.sourceId !== sourceId || metadata?.sourceId !== sourceId) {
    fail(`Yandex Constructor ${id}: existing LKG sourceId mismatch`);
  }

  return {
    geojson,
    metadata,
    normalizedSha256: normalizedYandexSnapshotSha256(geojson),
  };
}

function assertHealthyRefresh(candidate, geojson, existing) {
  const sourceCount = Number(geojson?.properties?.sourceFeatureCount);
  const includedCount = Number(geojson?.properties?.includedFeatureCount);
  const excludedCount = Number(geojson?.properties?.excludedOutsideSerbia);

  if (!Number.isInteger(sourceCount) || sourceCount < Number(candidate.minSourceFeatures || 1)) {
    fail(`Yandex Constructor ${candidate.constructorId}: sourceFeatureCount=${sourceCount} ниже allowlist threshold`);
  }
  if (!Number.isInteger(includedCount) || includedCount !== geojson.features.length || includedCount <= 0) {
    fail(`Yandex Constructor ${candidate.constructorId}: invalid includedFeatureCount=${includedCount}`);
  }
  if (!Number.isInteger(excludedCount) || excludedCount !== sourceCount - includedCount) {
    fail(`Yandex Constructor ${candidate.constructorId}: inconsistent Serbia filter counts`);
  }
  if (includedCount / sourceCount < minIncludedRatio) {
    fail(`Yandex Constructor ${candidate.constructorId}: only ${includedCount}/${sourceCount} features remain inside Serbia`);
  }

  if (!existing) return;
  const previousSourceCount = Number(existing.metadata?.sourceFeatureCount || existing.geojson?.properties?.sourceFeatureCount || 0);
  const previousIncludedCount = Number(existing.metadata?.geojsonFeatures || existing.geojson?.features?.length || 0);

  if (previousSourceCount > 0 && sourceCount < Math.floor(previousSourceCount * minRelativeRatio)) {
    fail(`Yandex Constructor ${candidate.constructorId}: source collapsed ${previousSourceCount} -> ${sourceCount}`);
  }
  if (previousIncludedCount > 0 && includedCount < Math.floor(previousIncludedCount * minRelativeRatio)) {
    fail(`Yandex Constructor ${candidate.constructorId}: Serbia output collapsed ${previousIncludedCount} -> ${includedCount}`);
  }
}

const [{ yandexConstructorCandidates }, { yandexConstructorHtmlToGeoJson }] = await Promise.all([
  importEngineModule('config/maps.config.mjs'),
  importEngineModule('scripts/lib/yandex-constructor-snapshot.mjs'),
]);

if (!Array.isArray(yandexConstructorCandidates) || yandexConstructorCandidates.length === 0) {
  fail('engine allowlist не содержит Yandex Constructor candidates');
}

let boundary;
try {
  boundary = JSON.parse(await readFile(boundaryFile, 'utf8'));
} catch (error) {
  fail(`не удалось прочитать map-data/core/serbia-regions.geojson: ${error?.message || error}`);
}

const pending = [];
for (const candidate of yandexConstructorCandidates) {
  if (!String(candidate.boundaryPath || '').endsWith('/serbia-regions.geojson')) {
    fail(`Yandex Constructor ${candidate.constructorId}: неизвестный boundary contract ${candidate.boundaryPath || 'нет'}`);
  }

  const existing = await readExisting(candidate);
  const acquiredAt = new Date().toISOString();
  const acquired = await fetchConstructor(candidate);
  const geojson = yandexConstructorHtmlToGeoJson(acquired.text, {
    constructorId: candidate.constructorId,
    boundary,
    bounds: candidate.bounds || null,
    upstreamUrl: candidate.acquisitionUrl,
    snapshotAt: acquiredAt,
    minSourceFeatures: candidate.minSourceFeatures || 1,
  });

  assertHealthyRefresh(candidate, geojson, existing);
  const normalizedSha256 = normalizedYandexSnapshotSha256(geojson);
  if (existing?.normalizedSha256 === normalizedSha256) {
    console.log(
      `[yandex-lkg] ${candidate.constructorId}: unchanged `
      + `(${geojson.properties.sourceFeatureCount} source -> ${geojson.features.length} Serbia, `
      + `${geojson.properties.excludedOutsideSerbia} excluded).`,
    );
    continue;
  }

  const htmlSha256 = createHash('sha256').update(acquired.bytes).digest('hex');
  const metadata = {
    schema: 1,
    sourceKind: 'yandex-embed',
    sourceId: `yandex-constructor:${candidate.constructorId}`,
    upstreamId: candidate.constructorId,
    upstreamUrl: candidate.acquisitionUrl,
    acquisition: 'scheduled-yandex-constructor-state-view',
    snapshotAt: acquiredAt,
    sourceLastUpdated: geojson.properties.sourceLastUpdated,
    contentType: acquired.contentType,
    finalUrl: acquired.finalUrl,
    htmlBytes: acquired.bytes.byteLength,
    htmlSha256,
    normalizedSha256,
    sourceFeatureCount: geojson.properties.sourceFeatureCount,
    geojsonFeatures: geojson.features.length,
    excludedOutsideSerbia: geojson.properties.excludedOutsideSerbia,
    filter: geojson.properties.filter,
    boundaryFile: 'map-data/core/serbia-regions.geojson',
    dataFile: `${candidate.constructorId}.geojson`,
  };

  pending.push({ candidate, geojson, metadata });
}

if (pending.length === 0) {
  console.log('[yandex-lkg] no normalized snapshot changes.');
  process.exit(0);
}

await mkdir(snapshotRoot, { recursive: true });
for (const { candidate, geojson, metadata } of pending) {
  const id = candidate.constructorId;
  await atomicWrite(path.join(snapshotRoot, `${id}.geojson`), `${JSON.stringify(geojson)}\n`);
  await atomicWrite(path.join(snapshotRoot, `${id}.json`), `${JSON.stringify(metadata, null, 2)}\n`);
  console.log(
    `[yandex-lkg] ${id}: updated ${metadata.sourceFeatureCount} source -> `
    + `${metadata.geojsonFeatures} Serbia, ${metadata.excludedOutsideSerbia} excluded, `
    + `normalized ${metadata.normalizedSha256}.`,
  );
}
