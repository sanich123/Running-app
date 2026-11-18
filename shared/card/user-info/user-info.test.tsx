import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES, ROUTES } from '@const/enums';
import { SPORTS_BTNS_VALUES } from '@const/sports';
import { changeLanguage } from '@R/slices/settings/settings';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { createMockBottomSheetModalRef } from '@T/utils/mock-ref';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { USER_INFO_FALLBACK_NAME, USER_INFO_PROVENANCE_COPY, UserInfoSize } from './const';
import UserInfo from './user-info';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => 'somePathname',
}));

describe('UserInfo', () => {
  it('does not render the activity emotion badge in the user header', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(
      <UserInfo
        profile={MOCK_PROFILE}
        sport={SPORTS_BTNS_VALUES.run}
        date={`${new Date()}`}
        userId="someUserId"
        size={UserInfoSize.large}
      />,
    );
    expect(screen.queryByTestId('activity-emotion-icon')).not.toBeOnTheScreen();
  });

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
    expect(screen.getByText(new RegExp(`${MOCK_PROFILE.name}`))).toHaveProp('numberOfLines', 1);
  });

  it('shows a localized fallback when profile name fields are empty', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(
      <UserInfo
        profile={{ name: null, surname: null }}
        date={`${new Date()}`}
        userId="someUserId"
        size={UserInfoSize.large}
      />,
      { store: mockStore },
    );

    expect(screen.getByText(USER_INFO_FALLBACK_NAME.russian)).toBeOnTheScreen();
  });

  it('shows available workout source details and places the watch model beside the date', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(
      <UserInfo
        profile={MOCK_PROFILE}
        date="2026-11-17T16:45:00.000Z"
        userId="someUserId"
        size={UserInfoSize.large}
        source="healthkit"
        sourceAppName="Suunto"
        recordingDeviceManufacturer="Suunto"
        recordingDeviceModel="Suunto 9 Peak"
      />,
    );

    expect(screen.getByText(/Suunto 9 Peak/)).toBeOnTheScreen();
    expect(
      screen.getByText(
        `${USER_INFO_PROVENANCE_COPY.russian.app}: Suunto · ${USER_INFO_PROVENANCE_COPY.russian.import}: ${USER_INFO_PROVENANCE_COPY.russian.appleHealth}`,
      ),
    ).toBeOnTheScreen();
  });

  it('shows Health Connect as the import channel and omits a missing watch model', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(
      <UserInfo
        profile={MOCK_PROFILE}
        date="2026-11-17T16:45:00.000Z"
        userId="someUserId"
        size={UserInfoSize.large}
        source="health-connect"
        sourceAppName="Health Sync"
      />,
    );

    expect(
      screen.getByText(
        `${USER_INFO_PROVENANCE_COPY.russian.app}: Health Sync · ${USER_INFO_PROVENANCE_COPY.russian.import}: ${USER_INFO_PROVENANCE_COPY.russian.healthConnect}`,
      ),
    ).toBeOnTheScreen();
    expect(screen.queryByText(/Suunto 9 Peak/)).toBeNull();
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
        commentsModalRef={createMockBottomSheetModalRef({ close })}
      />,
    );
    await user.press(screen.getByText(new RegExp(MOCK_PROFILE.name)));
    expect(close).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.profile}/someUserId`);
  });

  it('opens the user profile when the web modal ref has no callable close method', async () => {
    const user = userEvent.setup();
    await renderWithProviders(
      <UserInfo
        profile={MOCK_PROFILE}
        sport={SPORTS_BTNS_VALUES.run}
        date={`${new Date()}`}
        userId="someUserId"
        size={UserInfoSize.large}
        commentsModalRef={createMockBottomSheetModalRef({ close: 'not-a-function' as unknown as () => void })}
      />,
    );

    await user.press(screen.getByText(new RegExp(MOCK_PROFILE.name)));

    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.profile}/someUserId`);
  });
});
