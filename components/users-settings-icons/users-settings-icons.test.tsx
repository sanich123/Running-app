import UsersSettingsIcons from './users-settings-icons';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/home/activity/someActivityId',
  useLocalSearchParams: () => '2341;lkasdjf;lkj',
}));
describe('User settings icons', () => {
  it('should correctly renders', () => {
    renderWithProviders(<UsersSettingsIcons />, { store: mockStore });
  });
});
