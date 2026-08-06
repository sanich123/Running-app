import { fireEvent, screen } from '@testing-library/react-native';
import { openSettings, openURL } from 'expo-linking';
import { renderWithProviders } from '@T/utils/test-utils';
import AppSettingsBtn from './app-settings-btn';
import { APP_SETTINGS_TEXT } from './const';

describe('AppSettingsBtn', () => {
  it('opens the platform settings', async () => {
    await renderWithProviders(<AppSettingsBtn />);
    expect(screen.getByText(APP_SETTINGS_TEXT)).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('app-settings-button'));
    expect((openSettings as jest.Mock).mock.calls.length + (openURL as jest.Mock).mock.calls.length).toBe(1);
  });
});
