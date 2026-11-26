import { screen, userEvent } from '@testing-library/react-native';
import * as Linking from 'expo-linking';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { UPDATE_APP_TEXT } from '../const';
import UpdateAppPage from './update-app-page';

const mockOpenURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);

jest.mock('expo-router', () => ({ Stack: { Screen: () => null } }));

describe('UpdateAppPage', () => {
  beforeEach(() => mockOpenURL.mockClear());

  it('shows the outdated version message and opens the marketplace', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<UpdateAppPage />);

    expect(screen.getByText(UPDATE_APP_TEXT[LANGUAGES.russian].description)).toBeOnTheScreen();
    await user.press(screen.getByText(UPDATE_APP_TEXT[LANGUAGES.russian].action));
  });
});
