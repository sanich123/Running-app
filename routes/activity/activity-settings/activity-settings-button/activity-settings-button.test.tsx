import { screen } from '@testing-library/react-native';
import { Platform, StyleSheet } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { ACTIVITY_SETTINGS } from '../const';
import ActivitySettingsButton from './activity-settings-button';

describe('ActivitySettingsButton', () => {
  it('renders the activity settings action in the header', async () => {
    await renderWithProviders(<ActivitySettingsButton />);

    expect(screen.getByTestId('activity-settings-button')).toBeOnTheScreen();
    expect(screen.getByLabelText(ACTIVITY_SETTINGS[LANGUAGES.russian].title)).toBeOnTheScreen();
    const buttonStyle = StyleSheet.flatten(screen.getByTestId('activity-settings-button').props.style);
    expect(buttonStyle.width).toBe(Platform.OS === 'ios' ? 44 : 40);
    expect(buttonStyle.height).toBe(Platform.OS === 'ios' ? 44 : 40);
  });
});
