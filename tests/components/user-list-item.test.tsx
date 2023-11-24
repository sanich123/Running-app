import { screen } from '@testing-library/react-native';

import * as auth from '../../auth/context/auth-context';
import { ADD_DELETE_FRIEND_BTN } from '../../components/add-delete-friend-btn/const';
import UserListItem from '../../components/user-list-item/user-list-item';
import { MOCK_PROFILE } from '../mocks/mock-location';
import { MOCK_BAD_REQUEST } from '../mocks/mock-requests';
import { USER_AUTH_MOCKS } from '../mocks/use-auth';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('User list item', () => {
  it('should correctly renders from server', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someUserId',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<UserListItem userId="someUserId" />, { store: mockStore });
    expect(screen.getByTestId('avatarShowableLoadingIcon')).toBeOnTheScreen();
    expect(await screen.findByText(MOCK_PROFILE.name)).toBeOnTheScreen();
    expect(await screen.findByText(MOCK_PROFILE.surname)).toBeOnTheScreen();
    expect(await screen.findByText(MOCK_PROFILE.city)).toBeOnTheScreen();
    const avatar = await screen.findByTestId('avatarShowableImage');
    expect(avatar.props.source.uri).toEqual(MOCK_PROFILE.profilePhoto);
  });
  it('should show follow btn, when userId !== user.id and userId is not in the list of friends', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<UserListItem userId="someUserId" />, { store: mockStore });
    expect(await screen.findByText(MOCK_PROFILE.name)).toBeOnTheScreen();
    expect(await screen.findByText(MOCK_PROFILE.surname)).toBeOnTheScreen();
    expect(await screen.findByText(MOCK_PROFILE.city)).toBeOnTheScreen();
    const avatar = await screen.findByTestId('avatarShowableImage');
    expect(avatar.props.source.uri).toEqual(MOCK_PROFILE.profilePhoto);
    expect(screen.getByText(ADD_DELETE_FRIEND_BTN.english.follow)).toBeOnTheScreen();
  });
  it('should correctly show unfollow btn, when user is in the list of friends', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<UserListItem userId="a6135312-595f-4524-b3f3-496a05165d22" />, { store: mockStore });
    expect(screen.getByTestId('avatarShowableLoadingIcon')).toBeOnTheScreen();
    expect(await screen.findByText(MOCK_PROFILE.name)).toBeOnTheScreen();
    expect(await screen.findByText(MOCK_PROFILE.surname)).toBeOnTheScreen();
    expect(await screen.findByText(MOCK_PROFILE.city)).toBeOnTheScreen();
    const avatar = await screen.findByTestId('avatarShowableImage');
    expect(avatar.props.source.uri).toEqual(MOCK_PROFILE.profilePhoto);
    expect(await screen.getByText(ADD_DELETE_FRIEND_BTN.english.unfollow)).toBeOnTheScreen();
  });
  it('should correctly handle errors, when occured', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someUserIdWithAnError',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<UserListItem userId="someUserIdWithAnError" />, { store: mockStore });
    expect(screen.getByTestId('avatarShowableLoadingIcon')).toBeOnTheScreen();
    expect(await screen.findAllByText(`An error: ${MOCK_BAD_REQUEST.status}`)).toHaveLength(2);
  });
});
