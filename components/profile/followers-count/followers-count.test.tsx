import { MOCK_FOLLOWERS } from '@T/mocks/mock-followers';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen } from '@testing-library/react-native';

import FollowersCount from './followers-count';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: '7857abb1-b125-4f39-becf-8f30216b46ec' }),
  usePathname: () => 'somePathname',
  useRouter: () => ({ push: jest.fn() }),
}));

describe('Followers count', () => {
  it('should correctly renders', async () => {
    renderWithProviders(<FollowersCount />, { store: mockStore });
    expect(await screen.findByText('Фолловеры')).toBeOnTheScreen();
    expect(await screen.findByText(`${MOCK_FOLLOWERS.length}`)).toBeOnTheScreen();
  });
});
