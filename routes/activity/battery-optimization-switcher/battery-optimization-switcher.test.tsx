import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { createMockBottomSheetModalRef } from '@T/utils/mock-ref';
import { renderWithProviders } from '@T/utils/test-utils';
import BatteryOptimizationSwitcher from './battery-optimization-switcher';

const mockBatteryOptEnabled = jest.fn(() => Promise.resolve(true));
jest.mock('react-native-battery-optimization-check', () => ({ BatteryOptEnabled: () => mockBatteryOptEnabled() }));

describe('battery optimization switcher', () => {
  it('checks optimization and opens its details', async () => {
    const user = userEvent.setup();
    const present = jest.fn();
    const setIsAppOptimizedByPhone = jest.fn();
    const setIsNeedToRefreshPermission = jest.fn();
    await renderWithProviders(
      <BatteryOptimizationSwitcher
        isAppOptimizedByPhone
        setIsAppOptimizedByPhone={setIsAppOptimizedByPhone}
        batteryOptimizationEnabledModalRef={createMockBottomSheetModalRef({ present })}
        setIsNeedToRefreshPermission={setIsNeedToRefreshPermission}
        isNeedToRefreshPermission={false}
      />,
    );
    await waitFor(() => expect(setIsAppOptimizedByPhone).toHaveBeenCalledWith(true));
    await user.press(screen.getByTestId('battery-optimization-details'));
    expect(present).toHaveBeenCalledTimes(1);
  });
});
