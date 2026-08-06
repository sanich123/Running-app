import { screen, userEvent } from '@testing-library/react-native';
import { SPORTS_BTNS_VALUES } from '@Routes/save-activity-page/sports-btns/const';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { UserInfoSize } from './const';
import UserInfo from './user-info';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => 'somePathname',
}));

describe('UserInfo', () => {
  it('should correctly renders', async () => {
    await renderWithProviders(
      <UserInfo
        profile={{ ...MOCK_PROFILE, ...{ email: 'someEmail', language: 'english' } }}
        sport={SPORTS_BTNS_VALUES.run}
        date={`${new Date()}`}
        userId="someUserId"
        size={UserInfoSize.large}
      />,
      { store: mockStore },
    );
    expect(screen.getByText(new RegExp(`${MOCK_PROFILE.name}`))).toBeOnTheScreen();
  });

  it('opens the user profile and closes an enclosing comments modal', async () => {
    const user = userEvent.setup();
    const close = jest.fn();
    await renderWithProviders(
      <UserInfo
        profile={MOCK_PROFILE}
        sport={SPORTS_BTNS_VALUES.run}
        date={`${new Date()}`}
        userId="someUserId"
        size={UserInfoSize.large}
        commentsModalRef={{ current: { close } } as any}
      />,
    );
    await user.press(screen.getByText(new RegExp(MOCK_PROFILE.name)));
    expect(close).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/(protected)/profile/someUserId');
  });
});
