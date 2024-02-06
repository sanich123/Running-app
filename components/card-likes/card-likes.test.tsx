import { AvatarShowableTestIds } from '@C/avatar-showable/const';
import { USER_AUTH_MOCKS } from '@T/mocks/use-auth';
import { screen } from '@testing-library/react-native';
import * as router from 'expo-router';

import CardLikes, { CardLikesSize } from './card-likes';
import * as auth from '../../auth/context/auth-context';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

jest.mock('expo-router', () => ({
  usePathname: () => 'some string',
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
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
describe('Card likes', () => {
  it('should correctly renders', async () => {
    jest.spyOn(router, 'usePathname').mockImplementation(() => 'some path');
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someUserId',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(
      <CardLikes
        activityId="617dddae-05b3-418a-9a8e-5d408a1b897a"
        likes={[
          {
            activityId: '617dddae-05b3-418a-9a8e-5d408a1b897a',
            authorId: 'someUserId',
            date: '2023-10-07T14:38:05.885Z',
            id: '20715e5a-17b1-46ac-9814-5ffb5fde8ac9',
          },
        ]}
        size={CardLikesSize.big}
      />,
      {
        store: mockStore,
      },
    );
    expect(screen.getByTestId('pushToActivityLikes')).toBeOnTheScreen();
    expect(await screen.findByTestId('pushToActivityLikes')).toBeOnTheScreen();
    expect(await screen.findByTestId(AvatarShowableTestIds.success)).toBeOnTheScreen();
  });
});
