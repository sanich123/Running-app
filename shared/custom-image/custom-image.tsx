import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { Platform } from 'react-native';
import { getProductionBucketFallbackUri } from './utils';
import type { ImageContentFit, ImageProps } from 'expo-image';

const DEFAULT_IMAGE_TRANSITION = { duration: 180, timing: 'ease-out' as const };
const cachedImageUris = new Set<string>();

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

type CacheStatus = 'checking' | 'cached' | 'uncached';

function shouldCheckDiskCache(uri: string, cachePolicy: ImageProps['cachePolicy'], hasExplicitTransition: boolean) {
  return (
    !hasExplicitTransition &&
    uri.startsWith('http') &&
    cachePolicy !== 'none' &&
    cachePolicy !== 'memory' &&
    typeof Image.getCachePathAsync === 'function'
  );
}

function getInitialCacheStatus(uri: string, shouldCheckCache: boolean): CacheStatus {
  if (!shouldCheckCache) {
    return 'uncached';
  }

  return cachedImageUris.has(uri) ? 'cached' : 'checking';
}

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
  style: any;
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

  const handleLoad: NonNullable<ImageProps['onLoad']> = (event) => {
    if (imageUri && cachePolicy !== 'none') {
      cachedImageUris.add(imageUri);
    }
    onLoad?.(event);
  };
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
      onLoad={handleLoad}
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
