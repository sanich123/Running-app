import { Image } from 'expo-image';
import { cachedImageUris } from './const';
import type { CacheStatus } from './types';
import type { ImageProps } from 'expo-image';

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
