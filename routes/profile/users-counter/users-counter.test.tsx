import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { LANGUAGES, ROUTES } from '@const/enums';
import { changeLanguage } from '@R/slices/language/language';
import { MOCK_FRIENDS } from '@T/mocks/mock-friends';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { USERS_COUNT, USERS_VARIANT } from './const';
import UsersCounter from './users-counter';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b' }),
  usePathname: () => 'somePathname',
  useRouter: () => ({ push: mockPush }),
}));

describe('Users counter', () => {
  it('should correctly render label and number of users, that you follow in russian', async () => {
    await renderWithProviders(<UsersCounter variant={USERS_VARIANT.whoUserFollows} />, { store: mockStore });
    expect(await screen.findByText(USERS_COUNT.russian.followings)).toBeOnTheScreen();
    expect(await screen.findByText(`${MOCK_FRIENDS.length}`)).toBeOnTheScreen();
  });
  it('should correctly render label and number of users, that you follow in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<UsersCounter variant={USERS_VARIANT.whoUserFollows} />, { store: mockStore });
    expect(await screen.findByText(USERS_COUNT.english.followings)).toBeOnTheScreen();
    expect(await screen.findByText(`${MOCK_FRIENDS.length}`)).toBeOnTheScreen();
  });
  it('does not render the counter when loading it fails', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<UsersCounter variant={USERS_VARIANT.whoFollowsUser} />, { store: mockStore });
    await waitFor(() => expect(screen.queryByText(USERS_COUNT.english.followers)).not.toBeOnTheScreen());
    expect(screen.queryByText(/400/i)).not.toBeOnTheScreen();
  });

  it('opens the followings list for the displayed profile', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<UsersCounter variant={USERS_VARIANT.whoUserFollows} />);
    await screen.findByText(`${MOCK_FRIENDS.length}`);
    await user.press(screen.getByText(USERS_COUNT.english.followings));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.following}/926f4a53-08b5-43c6-99ee-cf31fdfbb49b`);
  });
});
