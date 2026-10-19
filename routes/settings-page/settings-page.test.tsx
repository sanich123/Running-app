import { screen } from '@testing-library/react-native';
import { Platform, StyleSheet } from 'react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import SettingsPage from './settings-page';

describe('settings page', () => {
  it('renders the settings actions in the scrollable page', async () => {
    await renderWithProviders(<SettingsPage />);
    expect(screen.getByText('Язык')).toBeOnTheScreen();
    expect(screen.getByText('Удалить аккаунт')).toBeOnTheScreen();
    expect(screen.getByText('Выйти')).toBeOnTheScreen();
    expect(screen.getByText('О приложении')).toBeOnTheScreen();
    expect(screen.getByText(/Версия приложения: /)).toBeOnTheScreen();
    expect(screen.getByText(/Устройство: /)).toBeOnTheScreen();
    expect(screen.getByText(/Операционная система: /)).toBeOnTheScreen();

    const contentStyle = StyleSheet.flatten(screen.getByTestId('settings-page-scroll').props.contentContainerStyle);
    expect(contentStyle.paddingBottom).toBe(Platform.OS === 'web' ? 40 : 12);
  });
});
