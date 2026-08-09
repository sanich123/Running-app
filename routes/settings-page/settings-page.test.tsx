import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import SettingsPage from './settings-page';

describe('settings page', () => {
  it('renders the settings actions in the scrollable page', async () => {
    await renderWithProviders(<SettingsPage />);
    expect(screen.getByText('Язык')).toBeOnTheScreen();
    expect(screen.getByText('Удалить аккаунт')).toBeOnTheScreen();
    expect(screen.getByText('Выйти')).toBeOnTheScreen();
  });
});
