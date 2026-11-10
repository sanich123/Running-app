import { createContext, useContext } from 'react';
import type { OfflineBounds } from '@Routes/maps-page/const';
import type { ActivityLocation } from '@S/card/types';

export interface ActivityNavigationContextValue {
  navigationTrackId: string | null;
  navigationRoute: ActivityLocation[] | null;
  isNavigationActive: boolean;
  hasNavigationStarted: boolean;
  isNavigationRouteVisible: boolean;
  startNavigationLabel: string;
  pauseNavigationLabel: string;
  resumeNavigationLabel: string;
  finishNavigationLabel: string;
  showImportedRouteLabel: string;
  hideImportedRouteLabel: string;
  downloadOfflineMapLabel: string;
  onToggleNavigationActive: () => void;
  onToggleNavigationRouteVisibility: () => void;
  onFinishNavigation: () => void;
  onDownloadOfflineMap: (bounds: OfflineBounds, centerCoordinate: [number, number]) => void;
}

const ActivityNavigationContext = createContext<ActivityNavigationContextValue | null>(null);

export function useActivityNavigationContext() {
  return useContext(ActivityNavigationContext);
}

export default ActivityNavigationContext;
