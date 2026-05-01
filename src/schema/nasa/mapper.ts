import { NearEarthObject, NearEarthObjectFeed } from './types';

type RawNeo = {
  id?: string;
  name?: string;
  is_potentially_hazardous_asteroid?: boolean;
  estimated_diameter?: {
    kilometers?: {
      estimated_diameter_min?: number;
      estimated_diameter_max?: number;
    };
  };
  close_approach_data?: Array<{
    close_approach_date?: string;
    relative_velocity?: { kilometers_per_hour?: string };
    miss_distance?: { kilometers?: string };
  }>;
};

type RawFeed = {
  element_count?: number;
  near_earth_objects?: Record<string, RawNeo[]>;
};

export const mapNearEarthObject = (raw: RawNeo): NearEarthObject => {
  const firstApproach = raw.close_approach_data?.[0];
  return {
    id: raw.id ?? '',
    name: raw.name ?? '',
    isPotentiallyHazardousAsteroid: raw.is_potentially_hazardous_asteroid ?? false,
    estimatedDiameterMinKm: raw.estimated_diameter?.kilometers?.estimated_diameter_min ?? 0,
    estimatedDiameterMaxKm: raw.estimated_diameter?.kilometers?.estimated_diameter_max ?? 0,
    closeApproachDate: firstApproach?.close_approach_date ?? '',
    relativeVelocityKph: firstApproach?.relative_velocity?.kilometers_per_hour ?? '',
    missDistanceKm: firstApproach?.miss_distance?.kilometers ?? '',
  };
};

export const mapFeed = (raw: RawFeed): NearEarthObjectFeed => {
  const byDate = raw.near_earth_objects ?? {};
  const objects = Object.values(byDate).flat().map(mapNearEarthObject);
  return {
    elementCount: raw.element_count ?? 0,
    objects,
  };
};
