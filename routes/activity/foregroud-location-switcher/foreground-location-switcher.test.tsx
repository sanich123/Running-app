import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import ForegroundLocationSwitcher from './foreground-location-switcher';

describe('foreground location switcher', () => {
  it('requests foreground location permission', async () => {
    const user = userEvent.setup();
    const requestForegroundPermission = jest.fn().mockResolvedValue({ granted: true });
    await renderWithProviders(
      <ForegroundLocationSwitcher
        foregroundPermissionStatus={{ granted: false } as any}
        requestForegroundPermission={requestForegroundPermission}
      />,
    );
    await user.press(screen.getByTestId('foreground-location-allow'));
    expect(requestForegroundPermission).toHaveBeenCalledTimes(1);
  });
});
