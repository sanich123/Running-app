import type { ForwardedRef, PropsWithChildren } from 'react';
import { screen, userEvent } from '@testing-library/react-native';
import { startActivityAsync } from 'expo-intent-launcher';
import { renderWithProviders } from '@T/utils/test-utils';
import BatteryOptimizationModal from './battery-optimization-modal';
import ActivityMapContext from '../map/activity-map-context';
import type { ActivityMapContextValue } from '../map/activity-map-context';

jest.mock('@gorhom/bottom-sheet', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return {
    BottomSheetBackdrop: View,
    BottomSheetModal: React.forwardRef(({ children }: PropsWithChildren, ref: ForwardedRef<unknown>) => {
      React.useImperativeHandle(ref, () => ({ close: jest.fn(), present: jest.fn() }));
      return <View>{children}</View>;
    }),
    BottomSheetModalProvider: View,
    BottomSheetView: View,
  };
});
jest.mock('expo-intent-launcher', () => ({
  ActivityAction: { IGNORE_BATTERY_OPTIMIZATION_SETTINGS: 'battery-settings' },
  startActivityAsync: jest.fn(),
}));

describe('battery optimization modal', () => {
  it('opens settings, requests a permission refresh and closes', async () => {
    const user = userEvent.setup();
    const setIsNeedToRefreshPermission = jest.fn();
    const activityMapContext: ActivityMapContextValue = {
      mapControls: {
        mapZoomLevel: 18,
        isCenteringOnCurrentLocation: false,
        onZoomIn: jest.fn(),
        onZoomOut: jest.fn(),
        onCenterOnCurrentLocation: jest.fn(),
      },
      locationPermissions: {
        isMapVisible: true,
        isLocationEnabled: true,
        foregroundPermissionStatus: null,
        backgroundPermissionStatus: null,
        setIsLocationEnabled: jest.fn(),
        requestForegroundPermission: jest.fn(),
        requestBackgroundPermission: jest.fn(),
      },
      batteryOptimization: { isActive: true, setIsNeedToRefreshPermission },
    };
    (startActivityAsync as jest.Mock).mockResolvedValue({ resultCode: 0 });
    await renderWithProviders(
      <ActivityMapContext.Provider value={activityMapContext}>
        <BatteryOptimizationModal />
      </ActivityMapContext.Provider>,
    );
    await user.press(screen.getByTestId('battery-optimization-info'));
    await user.press(screen.getByTestId('battery-optimization-open-settings'));
    expect(startActivityAsync).toHaveBeenCalledWith('battery-settings');
    expect(setIsNeedToRefreshPermission).toHaveBeenCalledWith(true);
  });
});
