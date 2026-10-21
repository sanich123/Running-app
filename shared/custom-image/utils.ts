import { Image } from 'expo-image';
import { cachedImageUris } from './const';
import type { CacheStatus } from './types';
import type { ImageProps } from 'expo-image';

const PRODUCTION_CDN_ORIGIN = 'https://q0tsp3wn9v.cdn.twcstorage.ru';
const PRODUCTION_BUCKET_URL = 'https://s3.twcstorage.ru/runich-production';

export function normalizeImagePlaceholder(placeholder?: string | null) {
  if (!placeholder) {
    return undefined;
  }

  if (
    placeholder.startsWith('blurhash:/') ||
    placeholder.startsWith('thumbhash:/') ||
    /^(?:https?|file|data):/.test(placeholder)
  ) {
    return placeholder;
  }

  return `blurhash:/${placeholder}`;
}

export function shouldCheckDiskCache(
  uri: string,
  cachePolicy: ImageProps['cachePolicy'],
  hasExplicitTransition: boolean,
) {
  return (
    !hasExplicitTransition &&
    uri.startsWith('http') &&
    cachePolicy !== 'none' &&
    cachePolicy !== 'memory' &&
    typeof Image.getCachePathAsync === 'function'
  );
}

export function getInitialCacheStatus(uri: string, shouldCheckCache: boolean): CacheStatus {
  if (!shouldCheckCache) {
    return 'uncached';
  }

  return cachedImageUris.has(uri) ? 'cached' : 'checking';
}

export function getProductionBucketFallbackUri(uri: string) {
  try {
    const sourceUrl = new URL(uri);
    if (
      sourceUrl.origin !== PRODUCTION_CDN_ORIGIN ||
      sourceUrl.pathname === '/' ||
      sourceUrl.username ||
      sourceUrl.password
    ) {
      return null;
    }

    return `${PRODUCTION_BUCKET_URL}${sourceUrl.pathname}${sourceUrl.search}${sourceUrl.hash}`;
  } catch {
    return null;
  }
}
