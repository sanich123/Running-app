import type { ReactNode } from 'react';
import MapRegionDownloader from '@Routes/maps-page/offline-maps-tab/map-region-downloader/map-region-downloader';
import ConfirmDialog from '@S/confirm-dialog/confirm-dialog';
import ActivityNavigationContext from '../../navigation-context';
import useActivityNavigation from '../use-activity-navigation';

export default function NavigationProvider({
  isLocationReady,
  children,
}: {
  isLocationReady: boolean;
  children: ReactNode;
}) {
  const { contextValue, finishDialog, offlineMap } = useActivityNavigation(isLocationReady);

  return (
    <ActivityNavigationContext.Provider value={contextValue}>
      {children}
      <ConfirmDialog
        visible={finishDialog.visible}
        title={finishDialog.labels.finishNavigationConfirmTitle}
        message={finishDialog.labels.finishNavigationConfirmMessage}
        confirmText={finishDialog.labels.finishNavigationConfirmAction}
        cancelText={finishDialog.labels.finishNavigationCancel}
        onDismiss={finishDialog.onDismiss}
        onConfirm={finishDialog.onConfirm}
      />
      {offlineMap.request && offlineMap.visible ? (
        <MapRegionDownloader
          embedded
          centerCoordinate={offlineMap.request.centerCoordinate}
          copy={offlineMap.copy}
          initialVisibleBounds={offlineMap.request.bounds}
          onClose={offlineMap.onClose}
          onDownloaded={offlineMap.onDownloaded}
        />
      ) : null}
    </ActivityNavigationContext.Provider>
  );
}
