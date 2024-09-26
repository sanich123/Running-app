import { LocationPermissionResponse, PermissionResponse } from 'expo-location';

export type LocationPermissionsProps = {
  isMapVisible: boolean;
  isLocationEnabled: boolean;
  isAppOptimizedByPhone: boolean;
  isNeedToRefreshPermission: boolean;
  foregroundPermissionStatus: PermissionResponse | null;
  backgroundPermissionStatus: PermissionResponse | null;
  setIsLocationEnabled: (arg: boolean) => void;
  requestForegroundPermission: () => Promise<LocationPermissionResponse>;
  setIsAppOptimizedByPhone: (arg: boolean) => void;
  setIsNeedToRefreshPermission: (arg: boolean) => void;
  requestBackgroundPermission: () => Promise<LocationPermissionResponse>;
};
