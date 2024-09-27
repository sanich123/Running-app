import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LocationPermissionResponse, PermissionResponse } from 'expo-location';
import { RefObject } from 'react';

export type BackgroundLocationModalProps = {
  backgroundLocationEnabledModalRef: RefObject<BottomSheetModal>;
  requestBackgroundPermission: () => Promise<LocationPermissionResponse>;
};

export type BackgroundLocationSwitcherProps = {
  backgroundPermissionStatus: boolean;
  backgroundLocationEnabledModalRef: RefObject<BottomSheetModal>;
};

export type BatteryOptimizationModalProps = {
  batteryOptimizationEnabledModalRef: RefObject<BottomSheetModal>;
  setIsNeedToRefreshPermission: (arg: boolean) => void;
};

export type BatteryOptimizationSwitcherProps = {
  isAppOptimizedByPhone: boolean;
  setIsAppOptimizedByPhone: (arg: boolean) => void;
  batteryOptimizationEnabledModalRef: RefObject<BottomSheetModal>;
  setIsNeedToRefreshPermission: (arg: boolean) => void;
  isNeedToRefreshPermission: boolean;
};

export type ChooseSportModalProps = {
  chooseSportModalRef: RefObject<BottomSheetModal>;
};

export type ForgroundLocationSwitcher = {
  foregroundPermissionStatus: LocationPermissionResponse;
  requestForegroundPermission: () => Promise<LocationPermissionResponse>;
};

export type LocationSettingsSwitcherProps = {
  isLocationEnabled: boolean;
  setIsLocationEnabled: (arg: boolean) => void;
};

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
