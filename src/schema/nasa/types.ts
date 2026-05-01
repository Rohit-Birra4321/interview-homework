export type NearEarthObject = {
  id: string;
  name: string;
  isPotentiallyHazardousAsteroid: boolean;
  estimatedDiameterMinKm: number;
  estimatedDiameterMaxKm: number;
  closeApproachDate: string;
  relativeVelocityKph: string;
  missDistanceKm: string;
};

export type NearEarthObjectFeed = {
  elementCount: number;
  objects: NearEarthObject[];
};

export type NearEarthObjectsArgs = {
  startDate: string;
  endDate: string;
};
