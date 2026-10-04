import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const sourcePath = new URL('../map-data/packs/poi/belgrade-world-restaurants.geojson', import.meta.url);
const localizationPath = new URL('../map-data/packs/poi/belgrade-world-restaurants.i18n.json', import.meta.url);

const source = JSON.parse(await readFile(sourcePath, 'utf8'));
const localization = JSON.parse(await readFile(localizationPath, 'utf8'));

assert.equal(source?.type, 'FeatureCollection', 'restaurant map source must be a GeoJSON FeatureCollection');
assert.equal(localization?.schema, 1, 'restaurant localization schema must be 1');
assert.equal(localization?.datasetId, source?.properties?.datasetId, 'localization datasetId must match the source');
assert.equal(localization?.sourceSnapshotAt, source?.properties?.snapshotAt, 'localization snapshot must match the source snapshot');
assert.deepEqual(localization?.languages, ['en', 'sr'], 'restaurant localization languages must be EN/SR');
assert(localization?.descriptions && typeof localization.descriptions === 'object' && !Array.isArray(localization.descriptions));

const sourceIds = source.features.map((feature, index) => {
  const id = String(feature?.properties?.id || '').trim();
  assert(id, `restaurant feature ${index + 1} must have an id`);
  return id;
});
assert.equal(new Set(sourceIds).size, sourceIds.length, 'restaurant feature ids must be unique');

const localizationIds = Object.keys(localization.descriptions).sort();
assert.deepEqual(localizationIds, [...sourceIds].sort(), 'every restaurant feature must have exactly one localization entry');

for (const id of sourceIds) {
  const entry = localization.descriptions[id];
  for (const language of ['en', 'sr']) {
    assert.equal(typeof entry?.[language], 'string', `${id}.${language} must be a string`);
    assert(entry[language].trim(), `${id}.${language} must not be empty`);
  }
}

console.log(`[map localizations] ${sourceIds.length} national-cuisine restaurant descriptions have EN/SR translations`);
