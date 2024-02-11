import { MOCK_FRIENDS } from '@T/mocks/mock-friends';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen } from '@testing-library/react-native';

import { FOLLOWING_COUNT } from './const';
import FollowingCount from './following-count';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b' }),
  usePathname: () => 'somePathname',
  useRouter: () => ({ push: jest.fn() }),
}));

describe('Following count', () => {
  it('should correctly renders data in english', async () => {
    renderWithProviders(<FollowingCount />, { store: mockStore });
    expect(await screen.findByText(FOLLOWING_COUNT.english.followings)).toBeOnTheScreen();
    expect(await screen.findByText(`${MOCK_FRIENDS.length}`)).toBeOnTheScreen();
  });
});
