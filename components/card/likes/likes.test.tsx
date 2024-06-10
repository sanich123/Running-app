import { AvatarShowableTestIds } from '@C/avatar/showable/const';
import { USER_AUTH_MOCKS } from '@T/mocks/use-auth';
import { screen } from '@testing-library/react-native';
import * as router from 'expo-router';

import { LikesSize } from './const';
import Likes from './likes';
import * as auth from '../../../auth/context/auth-context';
import { mockStore } from '../../../tests/utils/mock-store';
import { renderWithProviders } from '../../../tests/utils/test-utils';

jest.mock('expo-router', () => ({
  usePathname: () => 'some string',
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Card likes', () => {
  it('should correctly renders', async () => {
    jest.spyOn(router, 'usePathname').mockImplementation(() => 'some path');
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someUserId',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<Likes activityId="617dddae-05b3-418a-9a8e-5d408a1b897a" size={LikesSize.big} />, {
      store: mockStore,
    });
    expect(await screen.findByTestId('pushToActivityLikes')).toBeOnTheScreen();
    expect(await screen.findByTestId(AvatarShowableTestIds.success)).toBeOnTheScreen();
  });
});
