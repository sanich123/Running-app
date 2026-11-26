import { useCallback, useEffect, useRef, useState } from 'react';
import Mapbox from '@rnmapbox/maps';
import { ACTIVITY_ROUTE_REPLAY_MAP_STYLES } from '@S/activity-route-replay/const';
import { errorToast, getErrorMessageFromError } from '@S/error-toast/error-toast';
import { successToast } from '@S/success-toast/success-toast';
import { removeOfflineMap, saveOfflineMap } from '@U/offline-map-library';
import { isMapboxTileLimitError } from '../utils';
import { MAP_REGION_MAX_ZOOM, MAP_REGION_MIN_ZOOM } from './const';
import type { MapsPageCopy, OfflineBounds } from '../../const';
import type { OfflineDownloadProgress } from './types';

interface UseMapRegionDownloadOptions {
  copy: MapsPageCopy;
  isSatellite: boolean;
  onDownloaded?: () => Promise<void>;
}

export default function useMapRegionDownload({ copy, isSatellite, onDownloaded }: UseMapRegionDownloadOptions) {
  const pendingDownloadRef = useRef<{ id: string; created: Promise<void>; cancel: () => void } | null>(null);
  const lastProgressRef = useRef<OfflineDownloadProgress>({});
  const [downloadingMapId, setDownloadingMapId] = useState<string | null>(null);
  const [downloadPercent, setDownloadPercent] = useState(0);

  useEffect(
    () => () => {
      const pendingDownload = pendingDownloadRef.current;
      if (!pendingDownload) return;
      pendingDownload.cancel();
      void pendingDownload.created
        .then(() => Mapbox.offlineManager.deletePack(pendingDownload.id))
        .catch(() => undefined);
    },
    [],
  );

  const downloadRegion = useCallback(
    async (regionName: string, visibleBounds: OfflineBounds | null) => {
      const title = regionName.trim();
      if (!visibleBounds || !title || downloadingMapId) return;
      const [northEast, southWest] = visibleBounds;
      const longitudeSpanDegrees = (northEast[0] - southWest[0] + 360) % 360;
      const latitudeSpanDegrees = northEast[1] - southWest[1];
      const boundsValues = [...northEast, ...southWest];
      const boundsValuesAreValid =
        boundsValues.every(Number.isFinite) &&
        northEast[0] >= -180 &&
        northEast[0] <= 180 &&
        southWest[0] >= -180 &&
        southWest[0] <= 180 &&
        northEast[1] >= -90 &&
        northEast[1] <= 90 &&
        southWest[1] >= -90 &&
        southWest[1] <= 90;
      const requestDiagnostics = {
        style: isSatellite ? 'satellite' : 'map',
        minZoom: MAP_REGION_MIN_ZOOM,
        maxZoom: MAP_REGION_MAX_ZOOM,
        boundsOrder: 'northEast,southWest',
        boundsValid: boundsValuesAreValid && latitudeSpanDegrees > 0 && longitudeSpanDegrees > 0,
        latitudeSpanDegrees: Number(latitudeSpanDegrees.toFixed(4)),
        longitudeSpanDegrees: Number(longitudeSpanDegrees.toFixed(4)),
      };
      const id = `runich-region-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setDownloadingMapId(id);
      setDownloadPercent(0);
      lastProgressRef.current = {};
      let cancelled = false;
      try {
        const [[northEastLongitude, northEastLatitude], [southWestLongitude, southWestLatitude]] = visibleBounds;
        const finishedDownload = new Promise<void>((resolve, reject) => {
          const created = Mapbox.offlineManager.createPack(
            {
              name: id,
              styleURL: isSatellite ? ACTIVITY_ROUTE_REPLAY_MAP_STYLES.satellite : ACTIVITY_ROUTE_REPLAY_MAP_STYLES.map,
              minZoom: MAP_REGION_MIN_ZOOM,
              maxZoom: MAP_REGION_MAX_ZOOM,
              bounds: [
                [northEastLongitude, northEastLatitude],
                [southWestLongitude, southWestLatitude],
              ],
              metadata: { title, style: isSatellite ? 'satellite' : 'map' },
            },
            (_pack, status) => {
              if ('completedResourceCount' in status) {
                lastProgressRef.current = {
                  completedResourceCount: status.completedResourceCount,
                  erroredResourceCount: status.erroredResourceCount,
                  requiredResourceCount: status.requiredResourceCount,
                  loadedResourceCount: status.loadedResourceCount,
                };
              }
              if (!cancelled) setDownloadPercent(status.percentage ?? 0);
              if (status.state === 'complete') resolve();
            },
            (_pack, downloadError) => {
              const error = Object.assign(new Error(downloadError.message), {
                diagnostics: {
                  regionId: downloadError.name,
                  progress: lastProgressRef.current,
                  request: requestDiagnostics,
                },
              });
              reject(error);
            },
          );
          pendingDownloadRef.current = {
            id,
            created,
            cancel: () => {
              cancelled = true;
              resolve();
            },
          };
          void created.catch(reject);
        });
        await finishedDownload;
        if (cancelled) return;
        await saveOfflineMap({ id, title });
        if (cancelled) {
          await Mapbox.offlineManager.deletePack(id).catch(() => undefined);
          await removeOfflineMap(id).catch(() => undefined);
          return;
        }
        setDownloadingMapId(null);
        pendingDownloadRef.current = null;
        successToast(copy.mapDownloadSucceeded);
        await onDownloaded?.();
      } catch (error) {
        if (!cancelled) setDownloadingMapId(null);
        await Mapbox.offlineManager.deletePack(id).catch(() => undefined);
        await removeOfflineMap(id).catch(() => undefined);
        if (!cancelled) {
          if (error && typeof error === 'object' && 'diagnostics' in error) {
            console.error(`[Mapbox offline download] ${getErrorMessageFromError(error)}`);
          }
          if (isMapboxTileLimitError(error)) {
            errorToast(copy.mapTileLimitExceeded);
          } else {
            errorToast(copy.mapDownloadFailed, error);
          }
        }
      } finally {
        if (pendingDownloadRef.current?.id === id) pendingDownloadRef.current = null;
      }
    },
    [copy, downloadingMapId, isSatellite, onDownloaded],
  );

  const cancelMapDownload = useCallback(async () => {
    const pendingDownload = pendingDownloadRef.current;
    if (!downloadingMapId || !pendingDownload) return;
    pendingDownload.cancel();
    try {
      await pendingDownload.created.catch(() => undefined);
      await Mapbox.offlineManager.deletePack(downloadingMapId);
      await removeOfflineMap(downloadingMapId);
      setDownloadingMapId(null);
    } catch (error) {
      errorToast(copy.mapManagementFailed, error);
    }
  }, [copy.mapManagementFailed, downloadingMapId]);

  return { downloadingMapId, downloadPercent, downloadRegion, cancelMapDownload };
}
