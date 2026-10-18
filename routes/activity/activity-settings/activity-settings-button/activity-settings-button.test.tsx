import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivitySettingsButton from './activity-settings-button';

describe('ActivitySettingsButton', () => {
  it('renders the activity settings action in the header', async () => {
    await renderWithProviders(<ActivitySettingsButton />);

    expect(screen.getByTestId('activity-settings-button')).toBeOnTheScreen();
    expect(screen.getByLabelText('Настройки активности')).toBeOnTheScreen();
  });
});
