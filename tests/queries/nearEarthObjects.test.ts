import { parse } from 'graphql';
import { clearCache } from '../../src/schema/nasa/cache';

const mockFetch = jest.fn();
jest.mock('@whatwg-node/fetch', () => {
  const actual = jest.requireActual('@whatwg-node/fetch');
  return {
    ...actual,
    fetch: (...args: any[]) => mockFetch(...args),
  };
});

import { executor } from '../exectuor';

const clientHeader = { headers: { client: 'test-client' } };

const query = `
  query Neo($start: String!, $end: String!) {
    nearEarthObjects(startDate: $start, endDate: $end) {
      elementCount
      objects {
        id
        name
        closeApproachDate
      }
    }
  }
`;

const sampleResponse = {
  element_count: 2,
  near_earth_objects: {
    '2015-09-07': [
      {
        id: 'a1',
        name: 'Asteroid A',
        is_potentially_hazardous_asteroid: false,
        estimated_diameter: { kilometers: { estimated_diameter_min: 0.1, estimated_diameter_max: 0.2 } },
        close_approach_data: [
          {
            close_approach_date: '2015-09-07',
            relative_velocity: { kilometers_per_hour: '12345.67' },
            miss_distance: { kilometers: '7654321' },
          },
        ],
      },
    ],
    '2015-09-08': [
      {
        id: 'b1',
        name: 'Asteroid B',
        is_potentially_hazardous_asteroid: true,
        estimated_diameter: { kilometers: { estimated_diameter_min: 0.3, estimated_diameter_max: 0.4 } },
        close_approach_data: [
          {
            close_approach_date: '2015-09-08',
            relative_velocity: { kilometers_per_hour: '54321.12' },
            miss_distance: { kilometers: '1234567' },
          },
        ],
      },
    ],
  },
};

describe('nearEarthObjects', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    clearCache();
  });

  test('returns flattened objects across both dates', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => sampleResponse,
    });

    const result: any = await executor({
      document: parse(query),
      variables: { start: '2015-09-07', end: '2015-09-08' },
      extensions: clientHeader,
    });

    expect(result.data.nearEarthObjects.elementCount).toBe(2);
    expect(result.data.nearEarthObjects.objects).toHaveLength(2);
    expect(result.data.nearEarthObjects.objects.map((o: any) => o.id).sort()).toEqual(['a1', 'b1']);
  });

  test('returns cached value on the second call', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => sampleResponse,
    });

    await executor({
      document: parse(query),
      variables: { start: '2015-09-07', end: '2015-09-08' },
      extensions: clientHeader,
    });

    await executor({
      document: parse(query),
      variables: { start: '2015-09-07', end: '2015-09-08' },
      extensions: clientHeader,
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test('throws an error when NASA returns a non ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({}),
    });

    const result: any = await executor({
      document: parse(query),
      variables: { start: '2026-04-25', end: '2026-04-26' },
      extensions: clientHeader,
    });

    expect(result.errors).toBeDefined();
    expect(result.errors[0].message).toContain('429');
  });
});
