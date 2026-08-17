import type { RefObject } from 'react';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { LocationPermissionResponse, PermissionResponse } from 'expo-location';

export interface BackgroundLocationModalProps {
  backgroundLocationEnabledModalRef: RefObject<BottomSheetModal | null>;
  requestBackgroundPermission: () => Promise<LocationPermissionResponse>;
}

export interface BackgroundLocationSwitcherProps {
  backgroundPermissionStatus: boolean;
  backgroundLocationEnabledModalRef: RefObject<BottomSheetModal | null>;
}

export interface BatteryOptimizationModalProps {
  batteryOptimizationEnabledModalRef: RefObject<BottomSheetModal | null>;
  setIsNeedToRefreshPermission: (arg: boolean) => void;
}

export interface BatteryOptimizationSwitcherProps {
  isAppOptimizedByPhone: boolean;
  setIsAppOptimizedByPhone: (arg: boolean) => void;
  batteryOptimizationEnabledModalRef: RefObject<BottomSheetModal | null>;
  setIsNeedToRefreshPermission: (arg: boolean) => void;
  isNeedToRefreshPermission: boolean;
}

export interface ForegroundLocationSwitcherProps {
  foregroundPermissionStatus: LocationPermissionResponse;
  requestForegroundPermission: () => Promise<LocationPermissionResponse>;
}

export interface LocationSettingsSwitcherProps {
  isLocationEnabled: boolean;
  setIsLocationEnabled: (arg: boolean) => void;
}

export interface LocationPermissionsProps {
  isMapVisible: boolean;
  isLocationEnabled: boolean;
  foregroundPermissionStatus: PermissionResponse | null;
  backgroundPermissionStatus: PermissionResponse | null;
  setIsLocationEnabled: (arg: boolean) => void;
  requestForegroundPermission: () => Promise<LocationPermissionResponse>;
  requestBackgroundPermission: () => Promise<LocationPermissionResponse>;
}
