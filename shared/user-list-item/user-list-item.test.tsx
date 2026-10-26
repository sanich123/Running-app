import { screen, userEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { LANGUAGES, ROUTES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { UserProfileAvatarTestIds } from '@S/avatar/user-profile-avatar/const';
import { FOLLOW_UNFOLLOW_BTN } from '@S/user-list-item/follow-unfollow-btn/const';
import { TEST_URLS } from '@T/mocks/const';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import UserListItem from '../user-list-item/user-list-item';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('User list item', () => {
  it('should correctly renders from server', async () => {
    mockStore.dispatch(setMockUserId('someUserId'));
    await renderWithProviders(
      <UserListItem
        name={MOCK_PROFILE.name}
        surname={MOCK_PROFILE.surname}
        placeholder="someString"
        city={MOCK_PROFILE.city}
        profilePhoto="someString"
        userId="someUserId"
      />,
      { store: mockStore },
    );
    expect(await screen.findByText(new RegExp(`${MOCK_PROFILE.name}`))).toBeOnTheScreen();
    expect(await screen.findByText(new RegExp(`${MOCK_PROFILE.surname}`))).toBeOnTheScreen();
    const city = await screen.findByText(MOCK_PROFILE.city);
    expect(city).toHaveProp('numberOfLines', 1);
    expect(city).toHaveProp('ellipsizeMode', 'tail');
  });

  it('renders profile photos through the cached image loader', async () => {
    mockStore.dispatch(setMockUserId('avatar-owner'));
    await renderWithProviders(
      <UserListItem name="Runner" surname="One" profilePhoto={TEST_URLS.avatar} userId="avatar-owner" />,
      { store: mockStore },
    );

    const avatar = screen.getByTestId('user-list-item-avatar-avatar-owner');
    expect(avatar).toHaveProp('cachePolicy', 'memory-disk');
    expect(avatar).toHaveProp('recyclingKey', 'avatar-owner');
    expect(avatar).toHaveProp('transition', 0);
  });

  it('keeps the moderation marker compact on the small user-list avatar', async () => {
    mockStore.dispatch(setMockUserId('viewer-user'));
    await renderWithProviders(
      <UserListItem name="Runner" surname="Pending" userId="pending-user" profilePhotoReviewStatus="review_required" />,
    );

    const moderationButton = screen.getByTestId(`${UserProfileAvatarTestIds.moderationStatus}-container-outer-layer`);
    expect(StyleSheet.flatten(moderationButton.props.style)).toEqual(
      expect.objectContaining({ height: 28, top: 0, width: 28 }),
    );
  });

  it('should show follow btn, when userId !== user.id and userId is not in the list of friends', async () => {
    mockStore.dispatch(setMockUserId('926f4a53-08b5-43c6-99ee-cf31fdfbb49b'));
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(
      <UserListItem
        name={MOCK_PROFILE.name}
        surname={MOCK_PROFILE.surname}
        placeholder="someString"
        city={MOCK_PROFILE.city}
        profilePhoto="someString"
        userId="someUserId"
      />,
      { store: mockStore },
    );
    expect(await screen.findByText(new RegExp(`${MOCK_PROFILE.name}`))).toBeOnTheScreen();
    expect(await screen.findByText(new RegExp(`${MOCK_PROFILE.surname}`))).toBeOnTheScreen();
    expect(await screen.findByText(MOCK_PROFILE.city)).toBeOnTheScreen();
    expect(await screen.findByText(FOLLOW_UNFOLLOW_BTN.english.follow)).toBeOnTheScreen();
  });

  it('hides the follow button when the user disallows new followers', async () => {
    mockStore.dispatch(setMockUserId('viewer-user'));
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(
      <UserListItem
        name={MOCK_PROFILE.name}
        surname={MOCK_PROFILE.surname}
        userId="follow-disabled-user"
        allowNewFollowers={false}
      />,
      { store: mockStore },
    );

    expect(screen.queryByText(FOLLOW_UNFOLLOW_BTN.english.follow)).not.toBeOnTheScreen();
  });

  it('should correctly show unfollow btn, when user is in the list of friends', async () => {
    mockStore.dispatch(setMockUserId('926f4a53-08b5-43c6-99ee-cf31fdfbb49b'));
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(
      <UserListItem
        name={MOCK_PROFILE.name}
        surname={MOCK_PROFILE.surname}
        placeholder="someString"
        city={MOCK_PROFILE.city}
        profilePhoto="someString"
        userId="a6135312-595f-4524-b3f3-496a05165d22"
      />,
      { store: mockStore },
    );
    expect(await screen.findByText(new RegExp(`${MOCK_PROFILE.name}`))).toBeOnTheScreen();
    expect(await screen.findByText(new RegExp(`${MOCK_PROFILE.surname}`))).toBeOnTheScreen();
    expect(await screen.findByText(MOCK_PROFILE.city)).toBeOnTheScreen();
    expect(await screen.findByText(FOLLOW_UNFOLLOW_BTN.english.unfollow)).toBeOnTheScreen();
  });

  it('opens the selected user profile', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(setMockUserId('current-user'));
    await renderWithProviders(
      <UserListItem
        name={MOCK_PROFILE.name}
        surname={MOCK_PROFILE.surname}
        city={MOCK_PROFILE.city}
        profilePhoto={MOCK_PROFILE.profilePhoto}
        placeholder={MOCK_PROFILE.profilePhotoBlurhash}
        userId="selected-user"
      />,
    );
    await user.press(await screen.findByText(new RegExp(MOCK_PROFILE.name)));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.profile}/selected-user`);
  });
});
