import { fetch } from '@whatwg-node/fetch';
import { GraphQLError } from 'graphql';
import { mapFeed } from './mapper';
import { getCached, setCached } from './cache';
import { NearEarthObjectFeed, NearEarthObjectsArgs } from './types';

const NASA_BASE_URL = 'https://api.nasa.gov';
const API_KEY = 'DEMO_KEY';

export const getNearEarthObjects = async (
  _: any,
  args: NearEarthObjectsArgs,
  context: any
): Promise<NearEarthObjectFeed> => {
  context.logger.info('nearEarthObjects', { message: 'Enter resolver' });

  const cacheKey = `${args.startDate}_${args.endDate}`;
  const cached = getCached(cacheKey);
  if (cached) {
    context.logger.info('nearEarthObjects', { message: 'Cache hit' });
    return cached;
  }

  const url = `${NASA_BASE_URL}/neo/rest/v1/feed?start_date=${args.startDate}&end_date=${args.endDate}&api_key=${API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    context.logger.error('nearEarthObjects', {
      message: `NASA returned ${response.status}`,
    });
    throw new GraphQLError(`NASA API request failed with status ${response.status}`);
  }

  const raw = await response.json();
  const feed = mapFeed(raw);
  setCached(cacheKey, feed);

  context.logger.info('nearEarthObjects', {
    message: `Returning ${feed.objects.length} objects`,
  });
  return feed;
};
