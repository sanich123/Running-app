import { screen } from '@testing-library/react-native';
import { MOCK_SERVER_IDS, MOCK_SERVER_PROFILE } from '@T/responses/runich';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { HOME_WELCOME_TEXT } from '../const';
import HomeWelcome from './home-welcome';

jest.mock('@S/avatar/showable/showable', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="welcome-avatar" />;
});

describe('HomeWelcome', () => {
  it('renders the current user greeting', async () => {
    mockStore.dispatch(setMockUserId(MOCK_SERVER_IDS.userId));
    await renderWithProviders(<HomeWelcome />);
    expect(await screen.findByText(HOME_WELCOME_TEXT.greeting(MOCK_SERVER_PROFILE.name))).toBeOnTheScreen();
    expect(screen.getByText(HOME_WELCOME_TEXT.subtitle)).toBeOnTheScreen();
  });
});
