import type { PropsWithChildren } from 'react';
import { screen, userEvent } from '@testing-library/react-native';
import { startActivityAsync } from 'expo-intent-launcher';
import { createMockBottomSheetModalRef } from '@T/utils/mock-ref';
import { renderWithProviders } from '@T/utils/test-utils';
import BatteryOptimizationModal from './battery-optimization-modal';

jest.mock('@gorhom/bottom-sheet', () => {
  const { View } = jest.requireActual('react-native');
  return {
    BottomSheetBackdrop: View,
    BottomSheetModal: ({ children }: PropsWithChildren) => <View>{children}</View>,
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
    const close = jest.fn();
    const setIsNeedToRefreshPermission = jest.fn();
    (startActivityAsync as jest.Mock).mockResolvedValue({ resultCode: 0 });
    await renderWithProviders(
      <BatteryOptimizationModal
        batteryOptimizationEnabledModalRef={createMockBottomSheetModalRef({ close })}
        setIsNeedToRefreshPermission={setIsNeedToRefreshPermission}
      />,
    );
    await user.press(screen.getByTestId('battery-optimization-open-settings'));
    expect(startActivityAsync).toHaveBeenCalledWith('battery-settings');
    expect(setIsNeedToRefreshPermission).toHaveBeenCalledWith(true);
    expect(close).toHaveBeenCalledTimes(1);
  });
});
