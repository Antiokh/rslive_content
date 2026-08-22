import assert from 'node:assert/strict';
import { normalizedYandexSnapshotSha256 } from './yandex-lkg-utils.mjs';

const sourceId = 'yandex-constructor:test-source';
const point = (name, longitude, latitude, description = '') => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [longitude, latitude] },
  properties: {
    name,
    ...(description ? { description } : {}),
  },
});

const base = {
  type: 'FeatureCollection',
  properties: {
    sourceId,
    snapshotAt: '2026-08-22T10:00:00.000Z',
    sourceLastUpdated: 1,
  },
  features: [
    point('Белград', 20.44, 44.81, 'Первый отзыв'),
    point('Нови-Сад', 19.83, 45.25, 'Второй отзыв'),
  ],
};

const baseHash = normalizedYandexSnapshotSha256(base);
assert.match(baseHash, /^[0-9a-f]{64}$/);

const reordered = structuredClone(base);
reordered.features.reverse();
reordered.properties.snapshotAt = '2026-08-23T10:00:00.000Z';
reordered.properties.sourceLastUpdated = 2;
assert.equal(
  normalizedYandexSnapshotSha256(reordered),
  baseHash,
  'feature order and volatile acquisition metadata must not change the normalized hash',
);

const changedText = structuredClone(base);
changedText.features[0].properties.description = 'Изменённый отзыв';
assert.notEqual(
  normalizedYandexSnapshotSha256(changedText),
  baseHash,
  'reader-visible text changes must change the normalized hash',
);

const changedCoordinate = structuredClone(base);
changedCoordinate.features[0].geometry.coordinates = [20.45, 44.82];
assert.notEqual(
  normalizedYandexSnapshotSha256(changedCoordinate),
  baseHash,
  'coordinate changes must change the normalized hash',
);

const invalidGeometry = structuredClone(base);
invalidGeometry.features[0].geometry.type = 'LineString';
assert.throws(
  () => normalizedYandexSnapshotSha256(invalidGeometry),
  /должен быть GeoJSON Point/,
);

console.log('[yandex-lkg] normalized snapshot hash checks passed.');
