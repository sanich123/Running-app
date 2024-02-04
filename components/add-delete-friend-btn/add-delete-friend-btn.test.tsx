import * as auth from '@A/context/auth-context';
import { changeLanguage } from '@R/language/language';
import { USER_AUTH_MOCKS } from '@T/mocks/use-auth';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LANGUAGES } from '@const/enums';
import { screen } from '@testing-library/react-native';

import AddDeleteFriendBtn from './add-delete-friend-btn';
import { ADD_DELETE_FRIEND_BTN } from './const';
jest.mock('../../auth/context/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: 'someUserId',
      app_metadata: {
        someProp: 'some value',
      },
      user_metadata: {
        someProp: 'some value',
      },
      aud: '',
      created_at: '',
    },
  }),
}));
describe('Delete friend btn', () => {
  it('should correctly renders as unfollow btn, when passed friendId is in an array of friends of the user', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<AddDeleteFriendBtn friendId="f38e13df-1ee3-49d8-81df-8327f2b1f728" />, { store: mockStore });
    expect(await screen.findByText(ADD_DELETE_FRIEND_BTN.english.unfollow)).toBeOnTheScreen();
  });
  it('should correctly renders as follow btn, when passed friendId is not in an array of friends of the user', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<AddDeleteFriendBtn friendId="someWrongFriendId" />, { store: mockStore });
    expect(await screen.findByText(ADD_DELETE_FRIEND_BTN.english.follow)).toBeOnTheScreen();
  });
  it('should correctly renders as unfollow btn in russian, when passed friendId is in an array of friends of the user', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<AddDeleteFriendBtn friendId="f38e13df-1ee3-49d8-81df-8327f2b1f728" />, { store: mockStore });
    expect(await screen.findByText(ADD_DELETE_FRIEND_BTN.russian.unfollow)).toBeOnTheScreen();
  });
  it('should correctly renders as follow btn in russian, when passed friendId is not in an array of friends of the user', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<AddDeleteFriendBtn friendId="someWrongFriendId" />, { store: mockStore });
    expect(await screen.findByText(ADD_DELETE_FRIEND_BTN.russian.follow)).toBeOnTheScreen();
  });
});
