import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { Platform } from 'react-native';
import { DEFAULT_IMAGE_TRANSITION, cachedImageUris } from './const';
import { normalizeImagePlaceholder, shouldCheckDiskCache, getInitialCacheStatus } from './utils';
import type { CacheStatus } from './types';
import type { ImageContentFit, ImageProps } from 'expo-image';

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
  onLoad,
  onError,
}: {
  style?: ImageProps['style'];
  source: { uri: string | null | undefined };
  contentFit?: ImageContentFit;
  testID?: string;
  placeholder?: string | null;
  placeholderContentFit?: ImageContentFit;
  priority?: ImageProps['priority'];
  cachePolicy?: ImageProps['cachePolicy'];
  recyclingKey?: string | null;
  transition?: ImageProps['transition'];
  onLoad?: ImageProps['onLoad'];
  onError?: () => void;
}) {
  const sourceUri = source.uri || '';
  const shouldCheckCache = shouldCheckDiskCache(sourceUri, cachePolicy, transition !== undefined);
  const [cacheProbe, setCacheProbe] = useState<{ uri: string; status: CacheStatus }>(() => ({
    uri: sourceUri,
    status: getInitialCacheStatus(sourceUri, shouldCheckCache),
  }));
  const cacheStatus =
    cacheProbe.uri === sourceUri && shouldCheckCache
      ? cacheProbe.status
      : getInitialCacheStatus(sourceUri, shouldCheckCache);

  useEffect(() => {
    if (!shouldCheckCache || cachedImageUris.has(sourceUri)) {
      return;
    }

    let isMounted = true;

    Image.getCachePathAsync(sourceUri)
      .then((cachePath) => {
        if (!isMounted) {
          return;
        }

        if (cachePath) {
          cachedImageUris.add(sourceUri);
        }
        setCacheProbe({ uri: sourceUri, status: cachePath ? 'cached' : 'uncached' });
      })
      .catch(() => {
        if (isMounted) {
          setCacheProbe({ uri: sourceUri, status: 'uncached' });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [shouldCheckCache, sourceUri]);

  const resolvedTransition = transition ?? (cacheStatus === 'cached' ? 0 : DEFAULT_IMAGE_TRANSITION);

  return (
    <Image
      style={style}
      source={{ uri: sourceUri }}
      contentFit={contentFit}
      testID={Platform.OS !== 'web' ? testID : undefined}
      placeholder={normalizeImagePlaceholder(placeholder)}
      placeholderContentFit={placeholderContentFit ?? contentFit}
      priority={priority}
      cachePolicy={cachePolicy}
      recyclingKey={Platform.OS !== 'web' ? recyclingKey : undefined}
      transition={resolvedTransition}
      onLoad={(event) => {
        if (sourceUri && cachePolicy !== 'none') {
          cachedImageUris.add(sourceUri);
        }
        onLoad?.(event);
      }}
      onError={onError}
    />
  );
}
