import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES, LABELS, ROUTES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { REPORT_CONTENT_COPY } from '@S/moderation/report-content-dialog/const';
import { USER_SAFETY_MENU_COPY } from '@S/moderation/user-safety-menu/const';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ProfileHeaderToolbar from './profile-header-toolbar';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  ...require('@T/utils/expo-router-toolbar-mock').createExpoRouterToolbarMock({
    initiallyOpen: true,
    menuTestIds: { ellipsis: 'profile-user-safety-menu' },
  }),
  useRouter: () => ({ push: mockPush }),
}));

describe('ProfileHeaderToolbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(setMockUserId('current-user'));
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
  });

  it('uses the native toolbar menu to report or block another user', async () => {
    const user = userEvent.setup();

    await renderWithProviders(<ProfileHeaderToolbar profileUserId="other-user" />);

    expect(screen.getByTestId('profile-user-safety-menu')).toBeOnTheScreen();
    expect(screen.getByLabelText(LABELS[LANGUAGES.russian].users)).toBeOnTheScreen();
    expect(screen.getByLabelText(LABELS[LANGUAGES.russian].settings)).toBeOnTheScreen();
    await user.press(screen.getByText(USER_SAFETY_MENU_COPY[LANGUAGES.russian].report));

    expect(screen.getByText(REPORT_CONTENT_COPY[LANGUAGES.russian].title)).toBeOnTheScreen();
  });

  it('opens the block confirmation and hides safety actions on the current profile', async () => {
    const user = userEvent.setup();

    await renderWithProviders(<ProfileHeaderToolbar profileUserId="other-user" />);
    await user.press(screen.getByText(USER_SAFETY_MENU_COPY[LANGUAGES.russian].block));
    expect(screen.getByText(USER_SAFETY_MENU_COPY[LANGUAGES.russian].blockTitle)).toBeOnTheScreen();

    await renderWithProviders(<ProfileHeaderToolbar profileUserId="current-user" />);
    expect(screen.queryByTestId('profile-user-safety-menu')).toBeNull();
  });

  it('navigates to users and settings from native toolbar buttons', async () => {
    const user = userEvent.setup();

    await renderWithProviders(<ProfileHeaderToolbar profileUserId="current-user" />);

    await user.press(screen.getByLabelText(LABELS[LANGUAGES.russian].users));
    await user.press(screen.getByLabelText(LABELS[LANGUAGES.russian].settings));

    expect(mockPush).toHaveBeenNthCalledWith(1, `/${ROUTES.users}`);
    expect(mockPush).toHaveBeenNthCalledWith(2, `/${ROUTES.settings}`);
  });
});
