import { createContext, useContext } from 'react';
import type { LocationPermissionsProps } from '../types';
import type { MapControlsProps } from './map-controls/types';

export interface ActivityMapContextValue {
  mapControls: MapControlsProps;
  locationPermissions: LocationPermissionsProps;
  batteryOptimization: {
    isActive: boolean;
    setIsNeedToRefreshPermission: (shouldRefresh: boolean) => void;
  };
}

const ActivityMapContext = createContext<ActivityMapContextValue | null>(null);

export function useActivityMapContext() {
  const context = useContext(ActivityMapContext);
  if (!context) {
    throw new Error('Activity map components must be rendered inside ActivityMapContext');
  }
  return context;
}

export default ActivityMapContext;
