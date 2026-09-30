import { screen, userEvent } from '@testing-library/react-native';
import * as Linking from 'expo-linking';
import { renderWithProviders } from '@T/utils/test-utils';
import UpdateAppPage from './update-app';

const mockOpenURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);

jest.mock('expo-router', () => ({ Stack: { Screen: () => null } }));

describe('UpdateAppPage', () => {
  beforeEach(() => mockOpenURL.mockClear());

  it('shows the outdated version message and opens the marketplace', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<UpdateAppPage />);

    expect(
      screen.getByText('Версия приложения устарела. Обновите приложение, чтобы продолжить работу.'),
    ).toBeOnTheScreen();
    await user.press(screen.getByText('Перейти в маркет'));
  });
});
