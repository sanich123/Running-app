import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { NOTIFICATION_COPY } from '@Routes/notifications/constants';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupNotificationSettings from './group-notification-settings';
import { GROUPS_COPY } from '../const';

const mockGetProfile = jest.fn();
const mockUpdateProfile = jest.fn();

jest.mock('@R/services/profile/profile', () => ({
  useGetUserProfileByUserIdQuery: (...args: unknown[]) => mockGetProfile(...args),
  useUpdateProfileByUserIdMutation: () => [mockUpdateProfile, { isLoading: false }],
}));

describe('GroupNotificationSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setMockUserId('group-settings-owner'));
    mockGetProfile.mockReturnValue({
      data: { groupPostsNotifications: false, groupEventsNotifications: true },
      isSuccess: true,
    });
    mockUpdateProfile.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
  });

  it('shows group notification preferences and explains delivery channels', async () => {
    await renderWithProviders(<GroupNotificationSettings visible onDismiss={jest.fn()} />);
    const postsSwitch = await screen.findByTestId('group-post-notifications-switch');
    const eventsSwitch = screen.getByTestId('group-event-notifications-switch');

    expect(postsSwitch.props.value).toBe(false);
    expect(eventsSwitch.props.value).toBe(true);
    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].groupNotificationDeliveryHint)).toBeOnTheScreen();
    expect(screen.getByText(NOTIFICATION_COPY.english.groupPostsNotifications)).toBeOnTheScreen();
  });

  it('saves each preference to the matching profile field', async () => {
    await renderWithProviders(<GroupNotificationSettings visible onDismiss={jest.fn()} />);
    await fireEvent(screen.getByTestId('group-post-notifications-switch'), 'valueChange', true);
    await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalledTimes(1));
    await fireEvent(screen.getByTestId('group-event-notifications-switch'), 'valueChange', false);
    await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalledTimes(2));

    expect(mockUpdateProfile).toHaveBeenNthCalledWith(1, {
      body: { groupPostsNotifications: true },
      id: 'group-settings-owner',
    });
    expect(mockUpdateProfile).toHaveBeenNthCalledWith(2, {
      body: { groupEventsNotifications: false },
      id: 'group-settings-owner',
    });
  });

  it('uses the Russian text and keeps controls disabled until the profile loads', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockGetProfile.mockReturnValue({ data: undefined, isSuccess: false });
    await renderWithProviders(<GroupNotificationSettings visible onDismiss={jest.fn()} />);

    expect(await screen.findByTestId('group-notification-settings-loading')).toBeOnTheScreen();
    expect(screen.getByText(GROUPS_COPY[LANGUAGES.russian].groupNotificationDeliveryHint)).toBeOnTheScreen();
  });
});
