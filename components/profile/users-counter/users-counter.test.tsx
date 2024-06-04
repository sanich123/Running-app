import { changeLanguage } from '@R/language/language';
import { MOCK_FRIENDS } from '@T/mocks/mock-friends';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LANGUAGES } from '@const/enums';
import { screen } from '@testing-library/react-native';

import { USERS_COUNT, USERS_VARIANT } from './const';
import UsersCounter from './users-counter';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b' }),
  usePathname: () => 'somePathname',
  useRouter: () => ({ push: jest.fn() }),
}));

describe('Users counter', () => {
  it('should correctly render label and number of users, that you follow in russian', async () => {
    renderWithProviders(<UsersCounter variant={USERS_VARIANT.whoUserFollows} />, { store: mockStore });
    expect(await screen.findByText(USERS_COUNT.russian.followings)).toBeOnTheScreen();
    expect(await screen.findByText(`${MOCK_FRIENDS.length}`)).toBeOnTheScreen();
  });
  it('should correctly render label and number of users, that you follow in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<UsersCounter variant={USERS_VARIANT.whoUserFollows} />, { store: mockStore });
    expect(await screen.findByText(USERS_COUNT.english.followings)).toBeOnTheScreen();
    expect(await screen.findByText(`${MOCK_FRIENDS.length}`)).toBeOnTheScreen();
  });
  it('should correctly render an error in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<UsersCounter variant={USERS_VARIANT.whoFollowsUser} />, { store: mockStore });
    expect(await screen.findByText(new RegExp(`${USERS_COUNT.english.error}`))).toBeOnTheScreen();
    expect(await screen.findByText(/400/i)).toBeOnTheScreen();
  });
});
