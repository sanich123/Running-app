import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { MAPS_PAGE_COPY } from '../const';
import MapRegionDownloader from '../offline-maps-tab/map-region-downloader/map-region-downloader';

const DEFAULT_MAP_CENTER: [number, number] = [37.6173, 55.7558];

export default function CreateOfflineMapPage() {
  const router = useRouter();
  const { centerLatitude, centerLongitude } = useLocalSearchParams<{
    centerLatitude?: string;
    centerLongitude?: string;
  }>();
  const { language } = useAppSelector(({ settings }) => settings);
  const { lastPosition, initialLocation } = useAppSelector(({ location }) => location);
  const copy = MAPS_PAGE_COPY[language === LANGUAGES.english ? LANGUAGES.english : LANGUAGES.russian];
  const center = lastPosition ?? initialLocation;
  const routeLatitude = Number(centerLatitude);
  const routeLongitude = Number(centerLongitude);
  const hasValidRouteCenter =
    Number.isFinite(routeLatitude) &&
    Math.abs(routeLatitude) <= 90 &&
    Number.isFinite(routeLongitude) &&
    Math.abs(routeLongitude) <= 180;
  const centerCoordinate: [number, number] = hasValidRouteCenter
    ? [routeLongitude, routeLatitude]
    : center
      ? [center.coords.longitude, center.coords.latitude]
      : DEFAULT_MAP_CENTER;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerTransparent: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: 'transparent' },
        }}
      />
      <MapRegionDownloader centerCoordinate={centerCoordinate} copy={copy} onDownloaded={async () => router.back()} />
    </>
  );
}
