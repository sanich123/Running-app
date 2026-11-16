import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { Platform } from 'react-native';
import { DEFAULT_IMAGE_TRANSITION, cachedImageUris } from './const';
import {
  getInitialCacheStatus,
  getProductionBucketFallbackUri,
  normalizeImagePlaceholder,
  shouldCheckDiskCache,
} from './utils';
import type { CacheStatus, CustomImageProps } from './types';

export default function CustomImage({
  style,
  source,
  contentFit,
  testID,
  placeholder,
  placeholderContentFit,
  priority,
  cachePolicy,
  recyclingKey,
  transition,
  blurRadius,
  onLoad,
  onError,
}: CustomImageProps) {
  const sourceUri = source.uri || '';
  const [fallbackSource, setFallbackSource] = useState<{ sourceUri: string; fallbackUri: string } | null>(null);
  const imageUri = fallbackSource?.sourceUri === sourceUri ? fallbackSource.fallbackUri : sourceUri;
  const shouldCheckCache = shouldCheckDiskCache(imageUri, cachePolicy, transition !== undefined);
  const [cacheProbe, setCacheProbe] = useState<{ uri: string; status: CacheStatus }>(() => ({
    uri: imageUri,
    status: getInitialCacheStatus(imageUri, shouldCheckCache),
  }));
  const cacheStatus =
    cacheProbe.uri === imageUri && shouldCheckCache
      ? cacheProbe.status
      : getInitialCacheStatus(imageUri, shouldCheckCache);

  useEffect(() => {
    if (!shouldCheckCache || cachedImageUris.has(imageUri)) {
      return;
    }

    let isMounted = true;

    Image.getCachePathAsync(imageUri)
      .then((cachePath) => {
        if (!isMounted) {
          return;
        }

        if (cachePath) {
          cachedImageUris.add(imageUri);
        }
        setCacheProbe({ uri: imageUri, status: cachePath ? 'cached' : 'uncached' });
      })
      .catch(() => {
        if (isMounted) {
          setCacheProbe({ uri: imageUri, status: 'uncached' });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [imageUri, shouldCheckCache]);

  const resolvedTransition = transition ?? (cacheStatus === 'cached' ? 0 : DEFAULT_IMAGE_TRANSITION);

  return (
    <Image
      style={style}
      source={{ uri: imageUri }}
      contentFit={contentFit}
      testID={Platform.OS !== 'web' ? testID : undefined}
      placeholder={normalizeImagePlaceholder(placeholder)}
      placeholderContentFit={placeholderContentFit ?? contentFit}
      priority={priority}
      cachePolicy={cachePolicy}
      recyclingKey={Platform.OS !== 'web' ? recyclingKey : undefined}
      transition={resolvedTransition}
      blurRadius={blurRadius}
      onLoad={(event) => {
        if (imageUri && cachePolicy !== 'none') {
          cachedImageUris.add(imageUri);
        }
        onLoad?.(event);
      }}
      onError={() => {
        if (imageUri === sourceUri) {
          const fallbackUri = getProductionBucketFallbackUri(sourceUri);
          if (fallbackUri) {
            setFallbackSource({ sourceUri, fallbackUri });
            return;
          }
        }
        onError?.();
      }}
    />
  );
}
