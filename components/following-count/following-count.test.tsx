import { screen } from '@testing-library/react-native';

import FollowingCount from './following-count';
import * as auth from '../../auth/context/auth-context';
import { USER_AUTH_MOCKS } from '../../tests/mocks/use-auth';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({
    id: 'someFriendId',
  }),
}));

describe('Following count', () => {
  it('should correctly renders', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someUserId',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<FollowingCount />, { store: mockStore });
    expect(await screen.findByText('3')).toBeOnTheScreen();
  });
});
