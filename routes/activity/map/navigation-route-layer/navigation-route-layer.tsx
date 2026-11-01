import { useEffect, useMemo, type RefObject } from 'react';
import MapRouteLine from '@S/display-activity-map/map-route-line/map-route-line';
import { useActivityNavigationContext } from '../../navigation-context';
import { getNavigationRouteBounds } from '../navigation/utils';
import type { Camera } from '@rnmapbox/maps';

export default function NavigationRouteLayer({
  cameraRef,
  canRenderMap,
  hasMapLoaded,
}: {
  cameraRef: RefObject<Camera | null>;
  canRenderMap: boolean;
  hasMapLoaded: boolean;
}) {
  const navigation = useActivityNavigationContext();
  const navigationBounds = useMemo(
    () => getNavigationRouteBounds(navigation?.navigationRoute ?? null),
    [navigation?.navigationRoute],
  );
  const isRouteVisible = navigation?.isNavigationRouteVisible ?? true;

  useEffect(() => {
    if (!canRenderMap || !hasMapLoaded || !isRouteVisible || !navigationBounds || navigationBounds.pointCount < 2) {
      return;
    }
    cameraRef.current?.fitBounds(
      [navigationBounds.east, navigationBounds.north],
      [navigationBounds.west, navigationBounds.south],
      [56, 56, 56, 56],
      500,
    );
  }, [cameraRef, canRenderMap, hasMapLoaded, isRouteVisible, navigationBounds]);

  return navigation?.navigationRoute?.length && isRouteVisible ? (
    <MapRouteLine locations={navigation.navigationRoute} variant="navigation" />
  ) : null;
}
