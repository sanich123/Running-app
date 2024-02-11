import * as auth from '@A/context/auth-context';
import { ADD_DELETE_FRIEND_BTN } from '@C/add-delete-friend-btn/const';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { MOCK_BAD_REQUEST } from '@T/mocks/mock-requests';
import { USER_AUTH_MOCKS } from '@T/mocks/use-auth';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen } from '@testing-library/react-native';

import UserListItem from './user-list-item';

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
    expect(await screen.findByText(MOCK_PROFILE.name)).toBeOnTheScreen();
    expect(await screen.findByText(MOCK_PROFILE.surname)).toBeOnTheScreen();
    expect(await screen.findByText(MOCK_PROFILE.city)).toBeOnTheScreen();
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
    expect(await screen.findByTestId('avatarShowableImage')).toBeOnTheScreen();
    expect(await screen.findByText(ADD_DELETE_FRIEND_BTN.english.follow)).toBeOnTheScreen();
  });
  it('should correctly show unfollow btn, when user is in the list of friends', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<UserListItem userId="a6135312-595f-4524-b3f3-496a05165d22" />, { store: mockStore });
    expect(await screen.findByText(MOCK_PROFILE.name)).toBeOnTheScreen();
    expect(await screen.findByText(MOCK_PROFILE.surname)).toBeOnTheScreen();
    expect(await screen.findByText(MOCK_PROFILE.city)).toBeOnTheScreen();
    expect(await screen.findByTestId('avatarShowableImage')).toBeOnTheScreen();
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
    expect(await screen.findAllByText(`An error: ${MOCK_BAD_REQUEST.status}`)).toHaveLength(2);
  });
});
