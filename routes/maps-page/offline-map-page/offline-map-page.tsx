import { useEffect, useState } from 'react';
import Mapbox from '@rnmapbox/maps';
import { StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Button, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { listSavedOfflineMaps } from '@U/offline-map-library';
import { MAPS_PAGE_COPY } from '../const';
import MapRegionDownloader from '../offline-maps-tab/map-region-downloader/map-region-downloader';
import { getOfflineMapBoundsCenter, parseOfflineMapPackBounds } from '../offline-maps-tab/utils';
import type { OfflineBounds } from '../const';

export default function OfflineMapPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const mapId = Array.isArray(id) ? id[0] : id;
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = MAPS_PAGE_COPY[language === LANGUAGES.english ? LANGUAGES.english : LANGUAGES.russian];
  const [map, setMap] = useState<{
    title: string;
    bounds: OfflineBounds;
    centerCoordinate: [number, number];
    isSatellite: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadMap() {
      if (!mapId) {
        setHasError(true);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setHasError(false);
      try {
        const [pack, savedMaps] = await Promise.all([Mapbox.offlineManager.getPack(mapId), listSavedOfflineMaps()]);
        const bounds = parseOfflineMapPackBounds(pack?.bounds);
        if (!pack || !bounds) throw new Error(copy.mapOpenFailed);
        const metadata: unknown = pack.metadata;
        const isSatellite =
          typeof metadata === 'object' && metadata !== null && 'style' in metadata && metadata.style === 'satellite';
        const savedMap = savedMaps.find(({ id: savedMapId }) => savedMapId === mapId);
        const metadataTitle =
          typeof metadata === 'object' && metadata !== null && 'title' in metadata && typeof metadata.title === 'string'
            ? metadata.title
            : null;
        if (isCancelled) return;
        setMap({
          title: savedMap?.title ?? metadataTitle ?? mapId,
          bounds,
          centerCoordinate: getOfflineMapBoundsCenter(bounds),
          isSatellite,
        });
      } catch (error) {
        if (isCancelled) return;
        setHasError(true);
        errorToast(copy.mapOpenFailed, error);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    void loadMap();
    return () => {
      isCancelled = true;
    };
  }, [copy.mapOpenFailed, mapId]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {map ? (
        <MapRegionDownloader
          centerCoordinate={map.centerCoordinate}
          copy={copy}
          initialIsSatellite={map.isSatellite}
          initialVisibleBounds={map.bounds}
          onClose={() => router.back()}
          previewOnly
          previewTitle={map.title}
        />
      ) : (
        <View style={[styles.fallback, { backgroundColor: colors.background }]}>
          {isLoading ? (
            <ActivityIndicator size="large" />
          ) : hasError ? (
            <>
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
                {copy.mapOpenFailed}
              </Text>
              <Button mode="contained" onPress={() => router.back()}>
                {copy.back}
              </Button>
            </>
          ) : null}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', flex: 1, gap: 16, justifyContent: 'center', padding: 24 },
});
