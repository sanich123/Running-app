import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { startActivityAsync } from 'expo-intent-launcher';
import { hasServicesEnabledAsync } from 'expo-location';
import { renderWithProviders } from '@T/utils/test-utils';
import LocationSettingsSwitcher from './location-settings-switcher';

jest.mock('expo-intent-launcher', () => ({
  ActivityAction: { LOCATION_SOURCE_SETTINGS: 'location-settings' },
  startActivityAsync: jest.fn(),
}));
jest.mock('expo-location', () => ({ hasServicesEnabledAsync: jest.fn() }));

describe('location settings switcher', () => {
  it('checks services and opens phone location settings', async () => {
    const user = userEvent.setup();
    const setIsLocationEnabled = jest.fn();
    (hasServicesEnabledAsync as jest.Mock).mockResolvedValue(false);
    (startActivityAsync as jest.Mock).mockResolvedValue({ resultCode: 0 });
    await renderWithProviders(
      <LocationSettingsSwitcher isLocationEnabled={false} setIsLocationEnabled={setIsLocationEnabled} />,
    );
    await waitFor(() => expect(setIsLocationEnabled).toHaveBeenCalledWith(false));
    await user.press(screen.getByTestId('location-settings-open'));
    expect(startActivityAsync).toHaveBeenCalledWith('location-settings');
  });
});
