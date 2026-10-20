import { screen, userEvent } from '@testing-library/react-native';
import { makeLocationPermissionResponse } from '@T/utils/location-permission';
import { renderWithProviders } from '@T/utils/test-utils';
import ForegroundLocationSwitcher from './foreground-location-switcher';

describe('foreground location switcher', () => {
  it('requests foreground location permission', async () => {
    const user = userEvent.setup();
    const requestForegroundPermission = jest.fn().mockResolvedValue({ granted: true });
    await renderWithProviders(
      <ForegroundLocationSwitcher
        foregroundPermissionStatus={makeLocationPermissionResponse(false)}
        requestForegroundPermission={requestForegroundPermission}
      />,
    );
    expect(screen.getByTestId('foreground-location-allow')).toBeDisabled();
    await user.press(screen.getByTestId('location-consent-checkbox'));
    await user.press(screen.getByTestId('foreground-location-allow'));
    expect(requestForegroundPermission).toHaveBeenCalledTimes(1);
  });
});
