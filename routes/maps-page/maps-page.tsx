import { useRef, useState } from 'react';
import { Camera, MapView, UserLocation } from '@rnmapbox/maps';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Text, useTheme } from 'react-native-paper';
import { LANGUAGES, ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { ACTIVITY_ROUTE_REPLAY_MAP_STYLES } from '@S/activity-route-replay/const';
import { errorToast } from '@S/error-toast/error-toast';
import { parseImportedRoute } from '@U/activity-track/route-import';
import { saveActivityTrack } from '@U/activity-track/track-library';
import { MAPS_PAGE_COPY, type MapTab } from './const';
import MapActions from './map-actions/map-actions';
import MapControls from './map-controls/map-controls';
import MapLibraryPanel from './map-library-panel/map-library-panel';
import MapSearchPanel from './map-search-panel/map-search-panel';

const DEFAULT_MAP_CENTER: [number, number] = [37.6173, 55.7558];

export default function MapsPage() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const { lastPosition, initialLocation } = useAppSelector(({ location }) => location);
  const copy = MAPS_PAGE_COPY[language === LANGUAGES.english ? LANGUAGES.english : LANGUAGES.russian];
  const cameraRef = useRef<Camera>(null);
  const [isSatellite, setIsSatellite] = useState(true);
  const [is3d, setIs3d] = useState(true);
  const [libraryTab, setLibraryTab] = useState<MapTab | null>(null);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const center = lastPosition ?? initialLocation;
  const centerCoordinate: [number, number] = center
    ? [center.coords.longitude, center.coords.latitude]
    : DEFAULT_MAP_CENTER;

  async function importRoute() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: ['application/gpx+xml', 'application/vnd.google-earth.kml+xml', 'application/xml', 'text/xml'],
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;
      if (!/\.(gpx|kml)$/i.test(asset.name)) {
        errorToast(copy.unsupportedRoute);
        return;
      }
      const imported = parseImportedRoute(asset.name, await new File(asset.uri).text());
      await saveActivityTrack({
        activityId: `import-${Date.now()}`,
        title: imported.title,
        date: new Date().toISOString(),
        sport: 'running',
        locations: imported.locations,
      });
      setLibraryTab('tracks');
    } catch (error) {
      errorToast(copy.importFailed, error);
    }
  }

  return (
    <View style={styles.page}>
      <Stack.Screen options={{ headerShown: false, title: copy.title }} />
      <MapView
        scaleBarEnabled={false}
        style={StyleSheet.absoluteFill}
        styleURL={isSatellite ? ACTIVITY_ROUTE_REPLAY_MAP_STYLES.satellite : ACTIVITY_ROUTE_REPLAY_MAP_STYLES.map}
        testID="maps-page-map">
        <UserLocation visible />
        <Camera
          ref={cameraRef}
          defaultSettings={{ centerCoordinate, zoomLevel: 12.5, pitch: is3d ? 58 : 0 }}
          followUserLocation={false}
        />
      </MapView>
      <View pointerEvents="box-none" style={styles.overlay}>
        <View
          pointerEvents="none"
          style={[styles.titlePill, { backgroundColor: colors.elevation.level3, top: insets.top + 8 }]}>
          <Text variant="titleMedium" style={{ color: colors.onSurface }}>
            {copy.title}
          </Text>
        </View>
        <View style={[styles.mapControls, { left: 16, top: insets.top + 8 }]}>
          <MapControls
            copy={copy}
            isSatellite={isSatellite}
            is3d={is3d}
            onToggleMapStyle={() => setIsSatellite((current) => !current)}
            onTogglePitch={() => {
              setIs3d((current) => {
                const nextValue = !current;
                cameraRef.current?.setCamera({ pitch: nextValue ? 58 : 0, animationDuration: 350 });
                return nextValue;
              });
            }}
            onLocate={() => cameraRef.current?.setCamera({ centerCoordinate, zoomLevel: 15, animationDuration: 650 })}
            onSearch={() => setIsSearchVisible(true)}
          />
        </View>
        <View style={[styles.mapActions, { bottom: Math.max(insets.bottom + 12, 20) }]}>
          <MapActions
            copy={copy}
            onImportRoute={() => void importRoute()}
            onDownloadOfflineMaps={() => setLibraryTab('maps')}
            onShowSavedTracks={() => setLibraryTab('tracks')}
            onShowFavoriteActivities={() => router.push(`/${ROUTES.favoriteActivities}` as never)}
          />
        </View>
      </View>
      {libraryTab ? (
        <MapLibraryPanel
          visible
          tab={libraryTab}
          copy={copy}
          onTabChange={setLibraryTab}
          onDismiss={() => setLibraryTab(null)}
        />
      ) : null}
      <MapSearchPanel
        visible={isSearchVisible}
        copy={copy}
        onDismiss={() => setIsSearchVisible(false)}
        onSelectLocation={(coordinate) =>
          cameraRef.current?.setCamera({ centerCoordinate: coordinate, zoomLevel: 15, animationDuration: 650 })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFill },
  titlePill: {
    alignSelf: 'center',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: 'absolute',
  },
  mapControls: { position: 'absolute' },
  mapActions: { left: 16, position: 'absolute', right: 16 },
});
