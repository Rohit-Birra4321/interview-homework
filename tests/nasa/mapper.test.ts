import fs from 'fs';
import path from 'path';
import { mapFeed, mapNearEarthObject } from '../../src/schema/nasa/mapper';

describe('mapNearEarthObject', () => {
  test('maps all expected fields from a full NEO record', () => {
    const raw = {
      id: '2465633',
      name: '465633 (2009 JR5)',
      is_potentially_hazardous_asteroid: true,
      estimated_diameter: {
        kilometers: {
          estimated_diameter_min: 0.21,
          estimated_diameter_max: 0.48,
        },
      },
      close_approach_data: [
        {
          close_approach_date: '2015-09-08',
          relative_velocity: { kilometers_per_hour: '65260.57' },
          miss_distance: { kilometers: '45290298.22' },
        },
      ],
    };

    expect(mapNearEarthObject(raw)).toEqual({
      id: '2465633',
      name: '465633 (2009 JR5)',
      isPotentiallyHazardousAsteroid: true,
      estimatedDiameterMinKm: 0.21,
      estimatedDiameterMaxKm: 0.48,
      closeApproachDate: '2015-09-08',
      relativeVelocityKph: '65260.57',
      missDistanceKm: '45290298.22',
    });
  });

  test('returns sane defaults when nested fields are missing', () => {
    const result = mapNearEarthObject({ id: 'x', name: 'y' });
    expect(result.estimatedDiameterMinKm).toBe(0);
    expect(result.estimatedDiameterMaxKm).toBe(0);
    expect(result.closeApproachDate).toBe('');
    expect(result.relativeVelocityKph).toBe('');
    expect(result.missDistanceKm).toBe('');
    expect(result.isPotentiallyHazardousAsteroid).toBe(false);
  });
});

describe('mapFeed', () => {
  test('flattens date keyed objects into a single array', () => {
    const raw = {
      element_count: 3,
      near_earth_objects: {
        '2015-09-07': [{ id: 'a', name: 'A' }],
        '2015-09-08': [{ id: 'b', name: 'B' }, { id: 'c', name: 'C' }],
      },
    };

    const result = mapFeed(raw);
    expect(result.elementCount).toBe(3);
    expect(result.objects).toHaveLength(3);
    expect(result.objects.map((o) => o.id).sort()).toEqual(['a', 'b', 'c']);
  });

  test('returns empty objects array when input is missing', () => {
    expect(mapFeed({}).objects).toEqual([]);
    expect(mapFeed({}).elementCount).toBe(0);
  });

  test('handles the real NASA sample response', () => {
    const samplePath = path.join(__dirname, '../../samples/nasa-neo-sample.json');
    const sample = JSON.parse(fs.readFileSync(samplePath, 'utf-8'));
    const result = mapFeed(sample);

    expect(result.elementCount).toBe(21);
    expect(result.objects.length).toBe(21);
    const first = result.objects[0];
    expect(typeof first.id).toBe('string');
    expect(typeof first.name).toBe('string');
    expect(typeof first.isPotentiallyHazardousAsteroid).toBe('boolean');
  });
});
