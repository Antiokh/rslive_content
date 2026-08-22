import { createHash } from 'node:crypto';

function finiteNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`[yandex-lkg] ${label} должен быть конечным числом`);
  return number;
}

function canonicalPointFeature(feature, index) {
  if (feature?.type !== 'Feature' || feature?.geometry?.type !== 'Point') {
    throw new Error(`[yandex-lkg] feature ${index} должен быть GeoJSON Point`);
  }
  const coordinates = feature.geometry.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    throw new Error(`[yandex-lkg] feature ${index} не содержит [lon, lat]`);
  }
  const longitude = finiteNumber(coordinates[0], `feature ${index} longitude`);
  const latitude = finiteNumber(coordinates[1], `feature ${index} latitude`);
  if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
    throw new Error(`[yandex-lkg] feature ${index} выходит за пределы WGS84`);
  }

  const properties = feature.properties && typeof feature.properties === 'object'
    ? feature.properties
    : {};
  const canonicalProperties = {};
  for (const key of ['name', 'description', 'caption']) {
    const value = properties[key];
    if (typeof value === 'string' && value) canonicalProperties[key] = value;
  }

  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [longitude, latitude] },
    properties: canonicalProperties,
  };
}

function featureSortKey(feature) {
  const [longitude, latitude] = feature.geometry.coordinates;
  const properties = feature.properties || {};
  return JSON.stringify([
    longitude,
    latitude,
    properties.name || '',
    properties.description || '',
    properties.caption || '',
  ]);
}

export function normalizedYandexSnapshot(document) {
  if (document?.type !== 'FeatureCollection' || !Array.isArray(document.features) || document.features.length === 0) {
    throw new Error('[yandex-lkg] snapshot должен быть непустым GeoJSON FeatureCollection');
  }
  const sourceId = String(document.properties?.sourceId || '').trim();
  if (!/^yandex-constructor:[A-Za-z0-9_-]+$/.test(sourceId)) {
    throw new Error(`[yandex-lkg] неожиданный sourceId: ${sourceId || 'нет'}`);
  }

  const features = document.features
    .map(canonicalPointFeature)
    .sort((left, right) => featureSortKey(left).localeCompare(featureSortKey(right), 'en'));

  return { sourceId, features };
}

export function normalizedYandexSnapshotSha256(document) {
  return createHash('sha256')
    .update(JSON.stringify(normalizedYandexSnapshot(document)))
    .digest('hex');
}

export function isSha256(value) {
  return /^[0-9a-f]{64}$/i.test(String(value || ''));
}
