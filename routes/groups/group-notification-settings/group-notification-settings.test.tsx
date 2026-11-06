import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { NOTIFICATION_COPY } from '@Routes/notifications/constants';
import { MOCK_SERVER_IDS, MOCK_SERVER_PROFILE } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupNotificationSettings from './group-notification-settings';
import { GROUPS_COPY } from '../const';

const updatedPreferences: Record<string, unknown>[] = [];
let profileResponse = { ...MOCK_SERVER_PROFILE, groupPostsNotifications: false, groupEventsNotifications: true };
let holdProfileResponse = false;
let releaseProfileResponse: (() => void) | undefined;

describe('GroupNotificationSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    updatedPreferences.length = 0;
    profileResponse = { ...MOCK_SERVER_PROFILE, groupPostsNotifications: false, groupEventsNotifications: true };
    holdProfileResponse = false;
    releaseProfileResponse = undefined;
    server.use(
      http.get(`${BASE_URL}/user/${MOCK_SERVER_IDS.userId}/profile`, async () => {
        if (holdProfileResponse) {
          await new Promise<void>((resolve) => {
            releaseProfileResponse = resolve;
          });
        }
        return HttpResponse.json(profileResponse);
      }),
      http.patch(`${BASE_URL}/user/${MOCK_SERVER_IDS.userId}/profile`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        updatedPreferences.push(body);
        profileResponse = { ...profileResponse, ...body };
        return HttpResponse.json(profileResponse);
      }),
    );
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setMockUserId(MOCK_SERVER_IDS.userId));
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
    await waitFor(() => expect(updatedPreferences).toHaveLength(1));
    await fireEvent(screen.getByTestId('group-event-notifications-switch'), 'valueChange', false);
    await waitFor(() => expect(updatedPreferences).toHaveLength(2));

    expect(updatedPreferences).toEqual([{ groupPostsNotifications: true }, { groupEventsNotifications: false }]);
  });

  it('uses the Russian text and keeps controls disabled until the profile loads', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    holdProfileResponse = true;
    await renderWithProviders(<GroupNotificationSettings visible onDismiss={jest.fn()} />);

    expect(await screen.findByTestId('group-notification-settings-loading')).toBeOnTheScreen();
    expect(screen.getByText(GROUPS_COPY[LANGUAGES.russian].groupNotificationDeliveryHint)).toBeOnTheScreen();
    releaseProfileResponse?.();
  });
});
