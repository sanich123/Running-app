import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { setUserId } from '@R/slices/auth/auth';
import { changeLanguage } from '@R/slices/language/language';
import { FOLLOW_UNFOLLOW_BTN } from '@Routes/profile/follow-unfollow-btn/const';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import UserListItem from '../user-list-item/user-list-item';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('User list item', () => {
  it('should correctly renders from server', async () => {
    mockStore.dispatch(setUserId('someUserId'));
    await renderWithProviders(
      <UserListItem
        name={MOCK_PROFILE.name}
        surname={MOCK_PROFILE.surname}
        placeholder="someString"
        city={MOCK_PROFILE.city}
        profilePhoto="someString"
        user_id="someUserId"
      />,
      { store: mockStore },
    );
    expect(await screen.findByText(new RegExp(`${MOCK_PROFILE.name}`))).toBeOnTheScreen();
    expect(await screen.findByText(new RegExp(`${MOCK_PROFILE.surname}`))).toBeOnTheScreen();
    expect(await screen.findByText(MOCK_PROFILE.city)).toBeOnTheScreen();
  });
  it('should show follow btn, when userId !== user.id and userId is not in the list of friends', async () => {
    mockStore.dispatch(setUserId('926f4a53-08b5-43c6-99ee-cf31fdfbb49b'));
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(
      <UserListItem
        name={MOCK_PROFILE.name}
        surname={MOCK_PROFILE.surname}
        placeholder="someString"
        city={MOCK_PROFILE.city}
        profilePhoto="someString"
        user_id="someUserId"
      />,
      { store: mockStore },
    );
    expect(await screen.findByText(new RegExp(`${MOCK_PROFILE.name}`))).toBeOnTheScreen();
    expect(await screen.findByText(new RegExp(`${MOCK_PROFILE.surname}`))).toBeOnTheScreen();
    expect(await screen.findByText(MOCK_PROFILE.city)).toBeOnTheScreen();
    expect(await screen.findByText(FOLLOW_UNFOLLOW_BTN.english.follow)).toBeOnTheScreen();
  });
  it('should correctly show unfollow btn, when user is in the list of friends', async () => {
    mockStore.dispatch(setUserId('926f4a53-08b5-43c6-99ee-cf31fdfbb49b'));
    await renderWithProviders(
      <UserListItem
        name={MOCK_PROFILE.name}
        surname={MOCK_PROFILE.surname}
        placeholder="someString"
        city={MOCK_PROFILE.city}
        profilePhoto="someString"
        user_id="a6135312-595f-4524-b3f3-496a05165d22"
      />,
      { store: mockStore },
    );
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    expect(await screen.findByText(new RegExp(`${MOCK_PROFILE.name}`))).toBeOnTheScreen();
    expect(await screen.findByText(new RegExp(`${MOCK_PROFILE.surname}`))).toBeOnTheScreen();
    expect(await screen.findByText(MOCK_PROFILE.city)).toBeOnTheScreen();
    expect(await screen.getByText(FOLLOW_UNFOLLOW_BTN.english.unfollow)).toBeOnTheScreen();
  });
});
