import type { ReactNode } from 'react';
import { act, fireEvent, screen, userEvent, waitFor, within } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { View } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { MOCK_SERVER_IDS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { createMockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupsPage from './groups-page';
import { GROUP_CATEGORY_LABELS, GROUPS_COPY, GROUP_SPORT_LABELS } from '../const';
import { GROUP_FIXTURE } from '../test-fixtures';

const mockPush = jest.fn();
let groupsResponse: unknown[] = [GROUP_FIXTURE];
let groupsError: { status: number; message: string } | undefined;
let holdGroupsResponse = false;
let releaseGroupsResponse: (() => void) | undefined;
const groupRequests: URL[] = [];
let testStore: ReturnType<typeof createMockStore>;
interface MockStackScreenProps {
  options?: { headerTitle?: () => ReactNode; headerRight?: () => ReactNode };
}

function mockStackScreen({ options }: MockStackScreenProps) {
  return (
    <View testID="groups-header">
      {options?.headerTitle?.()}
      {options?.headerRight?.()}
    </View>
  );
}

jest.mock('expo-router', () => ({ Stack: { Screen: mockStackScreen }, useRouter: () => ({ push: mockPush }) }));

describe('GroupsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    testStore = createMockStore();
    groupsResponse = [GROUP_FIXTURE];
    groupsError = undefined;
    holdGroupsResponse = false;
    releaseGroupsResponse = undefined;
    groupRequests.length = 0;
    server.use(
      http.get(`${BASE_URL}/groups`, async ({ request }) => {
        groupRequests.push(new URL(request.url));
        if (groupsError) {
          return HttpResponse.json(
            { statusCode: groupsError.status, message: groupsError.message },
            { status: groupsError.status },
          );
        }
        if (holdGroupsResponse) {
          await new Promise<void>((resolve) => {
            releaseGroupsResponse = resolve;
          });
        }
        return HttpResponse.json(groupsResponse);
      }),
    );
    testStore.dispatch(changeLanguage(LANGUAGES.english));
    testStore.dispatch(setMockUserId(MOCK_SERVER_IDS.userId));
  });

  async function renderLoadedPage() {
    await renderWithProviders(<GroupsPage />, { store: testStore });
    await waitFor(() => {
      expect(groupRequests.length).toBeGreaterThan(0);
    });
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeOnTheScreen());
  }

  it('shows group cards and exactly four supported activity filters', async () => {
    await renderLoadedPage();

    expect(screen.getByText(GROUP_FIXTURE.name)).toBeOnTheScreen();
    const header = screen.getByTestId('groups-header');
    expect(within(header).queryByTestId('search-groups')).toBeNull();
    expect(within(header).getByTestId('groups-create-button')).toBeOnTheScreen();
    const filters = within(screen.getByTestId('groups-filter-row'));
    expect(filters.getByTestId('groups-sport-filter')).toBeOnTheScreen();
    expect(filters.getByTestId('search-groups')).toBeOnTheScreen();
    await userEvent.press(screen.getByTestId('groups-sport-filter'));
    expect(screen.getByText(GROUP_SPORT_LABELS.run.en)).toBeOnTheScreen();
    expect(screen.getByText(GROUP_SPORT_LABELS.walk.en)).toBeOnTheScreen();
    expect(screen.getByText(GROUP_SPORT_LABELS.hike.en)).toBeOnTheScreen();
    expect(screen.getByText(GROUP_SPORT_LABELS.bike.en)).toBeOnTheScreen();
    expect(screen.getByTestId('groups-sport-filter-bike')).toBeOnTheScreen();
    expect(screen.queryByTestId('groups-sport-filter-swim')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('groups-sport-filter-workout')).not.toBeOnTheScreen();
  });

  it('shows a group photo and human-readable category labels', async () => {
    groupsResponse = [
      {
        ...GROUP_FIXTURE,
        photoUrl: 'https://example.test/group.jpg',
        categoryTags: ['team', 'local'],
        photoPending: true,
      },
    ];
    await renderLoadedPage();

    expect(
      screen.getByText(
        GROUP_FIXTURE.categoryTags.map((categoryTag) => GROUP_CATEGORY_LABELS.en[categoryTag]).join(' · '),
      ),
    ).toBeOnTheScreen();
    expect(screen.getByTestId(`group-photo-${GROUP_FIXTURE.id}-moderation-status`)).toBeOnTheScreen();
  });

  it('filters the catalog by one of the supported sports', async () => {
    await renderLoadedPage();
    await userEvent.press(screen.getByTestId('groups-sport-filter'));
    await userEvent.press(screen.getByTestId('groups-sport-filter-walk'));

    await waitFor(() => expect(groupRequests.at(-1)?.searchParams.get('sport')).toBe('walk'));
  });

  it('opens the create group screen', async () => {
    await renderLoadedPage();
    fireEvent.press(screen.getByTestId('groups-create-button'));

    expect(mockPush).toHaveBeenCalledWith('/groups/create');
  });

  it('opens group notification preferences from the tab settings button', async () => {
    await renderLoadedPage();
    await userEvent.press(screen.getByTestId('groups-settings-button'));

    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].groupNotificationSettingsTitle)).toBeOnTheScreen();
    expect(screen.getByTestId('group-post-notifications-switch')).toBeOnTheScreen();
    expect(screen.getByTestId('group-event-notifications-switch')).toBeOnTheScreen();
    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].groupNotificationDeliveryHint)).toBeOnTheScreen();
  });

  it('switches scope, applies and clears a sport filter', async () => {
    await renderLoadedPage();
    const user = userEvent.setup();

    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].myGroups));
    await user.press(screen.getByTestId('groups-sport-filter'));
    await user.press(screen.getByTestId('groups-sport-filter-walk'));
    await waitFor(() => {
      expect(groupRequests.at(-1)?.searchParams.get('scope')).toBe('mine');
      expect(groupRequests.at(-1)?.searchParams.get('sport')).toBe('walk');
    });

    await user.press(screen.getByTestId('groups-sport-filter'));
    await user.press(screen.getByTestId('groups-sport-filter-all'));
    expect(screen.getByTestId('groups-sport-filter').props.accessibilityLabel).toBe(
      GROUPS_COPY[LANGUAGES.english].allActivities,
    );
  });

  it('does not include pending join requests in My groups', async () => {
    const pendingGroup = {
      ...GROUP_FIXTURE,
      id: 'pending-group',
      name: 'Pending hikers',
      privacy: 'closed' as const,
      currentMembership: { status: 'pending' as const, role: 'member' as const },
    };
    groupsResponse = [{ ...GROUP_FIXTURE, currentMembership: { status: 'active', role: 'member' } }, pendingGroup];
    await renderLoadedPage();
    await userEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].myGroups));

    expect(screen.getByText(GROUP_FIXTURE.name)).toBeOnTheScreen();
    expect(screen.queryByText(pendingGroup.name)).toBeNull();
  });

  it('shows a retry action when the group catalog fails to load', async () => {
    groupsError = { status: 503, message: 'Service unavailable' };
    await renderLoadedPage();

    expect(screen.getByText('503, Service unavailable')).toBeOnTheScreen();
    await userEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].retry));
    await waitFor(() => expect(groupRequests).toHaveLength(2));
  });

  it('shows a filtered empty state when a search returns no groups', async () => {
    groupsResponse = [];
    await renderLoadedPage();
    const user = userEvent.setup();
    await user.type(screen.getByTestId('search-groups'), 'unknown');

    await waitFor(() => expect(groupRequests.at(-1)?.searchParams.get('search')).toBe('unknown'));
    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].noResults)).toBeOnTheScreen();
    await user.press(screen.getByTestId('clear-groups-search'));
    expect(screen.getByTestId('search-groups').props.value).toBe('');
  });

  it('opens a pending group card without optional description and location', async () => {
    const pendingGroup = {
      ...GROUP_FIXTURE,
      id: 'pending-group',
      name: 'Pending hikers',
      description: null,
      locationName: null,
      privacy: 'closed' as const,
      currentMembership: { status: 'pending' as const, role: 'member' as const },
    };
    groupsResponse = [pendingGroup];
    await renderLoadedPage();

    fireEvent.press(screen.getByText(pendingGroup.name));

    expect(mockPush).toHaveBeenCalledWith(`/groups/${pendingGroup.id}`);
    expect(screen.queryByText(GROUP_FIXTURE.description!)).not.toBeOnTheScreen();
    expect(screen.queryByText(GROUP_FIXTURE.locationName!)).not.toBeOnTheScreen();
  });

  it('renders Russian controls and marks the selected sport filter', async () => {
    testStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<GroupsPage />, { store: testStore });
    const user = userEvent.setup();

    expect(screen.getByText(GROUPS_COPY[LANGUAGES.russian].allActivities)).toBeOnTheScreen();
    await user.press(screen.getByTestId('groups-sport-filter'));
    const walkFilter = screen.getByTestId('groups-sport-filter-walk');
    await user.press(walkFilter);
    await waitFor(() =>
      expect(screen.getByTestId('groups-sport-filter').props.accessibilityLabel).toBe(GROUP_SPORT_LABELS.walk.ru),
    );
    await waitFor(() => expect(groupRequests.at(-1)?.searchParams.get('sport')).toBe('walk'));
  });

  it('shows the loading state when the query has not returned data', async () => {
    holdGroupsResponse = true;
    await renderWithProviders(<GroupsPage />, { store: testStore });

    await waitFor(() => expect(groupRequests).toHaveLength(1));
    expect(screen.getByRole('progressbar')).toBeOnTheScreen();
    await act(async () => releaseGroupsResponse?.());
  });

  it('shows Russian retry copy when the catalog request fails', async () => {
    testStore.dispatch(changeLanguage(LANGUAGES.russian));
    groupsError = { status: 500, message: 'Внутренняя ошибка' };
    await renderLoadedPage();

    expect(screen.getByText('500, Внутренняя ошибка')).toBeOnTheScreen();
    await userEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.russian].retry));
    await waitFor(() => expect(groupRequests).toHaveLength(2));
  });
});
