import { NearEarthObjectFeed } from './types';

type CacheEntry = {
  value: NearEarthObjectFeed;
  expiresAt: number;
};

const TTL_MS = 60 * 60 * 1000;
const store = new Map<string, CacheEntry>();

export const getCached = (key: string): NearEarthObjectFeed | null => {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
};

export const setCached = (key: string, value: NearEarthObjectFeed): void => {
  store.set(key, { value, expiresAt: Date.now() + TTL_MS });
};

export const clearCache = (): void => {
  store.clear();
};
