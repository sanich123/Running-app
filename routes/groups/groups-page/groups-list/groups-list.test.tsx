import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { BASE_URL } from '@T/utils/handlers';
import { createMockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupsList from './groups-list';
import { GROUPS_COPY } from '../../const';
import { GROUP_FIXTURE } from '../../test-fixtures';
import type { GroupSport } from '@R/services/groups/types';

const mockPush = jest.fn();
let groupsResponse: unknown[] = [];
let groupsError: { status: number; message: string } | undefined;
const groupRequests: URL[] = [];
let testStore: ReturnType<typeof createMockStore>;
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('GroupsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    testStore = createMockStore();
    groupRequests.length = 0;
    groupsResponse = [GROUP_FIXTURE];
    groupsError = undefined;
    server.use(
      http.get(`${BASE_URL}/groups`, ({ request }) => {
        groupRequests.push(new URL(request.url));
        return groupsError
          ? HttpResponse.json(
              { statusCode: groupsError.status, message: groupsError.message },
              { status: groupsError.status },
            )
          : HttpResponse.json(groupsResponse);
      }),
    );
    testStore.dispatch(changeLanguage(LANGUAGES.english));
  });

  async function renderLoadedList(filters: { scope: 'all' | 'mine'; search: string; sport: GroupSport | undefined }) {
    await renderWithProviders(<GroupsList filters={filters} />, { store: testStore });
    await waitFor(() => {
      expect(groupRequests.length).toBeGreaterThan(0);
    });
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeOnTheScreen());
  }

  it('loads groups with the selected filters and opens a group', async () => {
    await renderLoadedList({ scope: 'all', search: 'run', sport: 'run' });

    expect(groupRequests[0]?.searchParams.get('scope')).toBe('all');
    expect(groupRequests[0]?.searchParams.get('search')).toBe('run');
    expect(groupRequests[0]?.searchParams.get('sport')).toBe('run');
    fireEvent.press(screen.getByText(GROUP_FIXTURE.name));
    expect(mockPush).toHaveBeenCalledWith(`/groups/${GROUP_FIXTURE.id}`);
  });

  it('shows the HTTP status and a retry button after a failed request', async () => {
    groupsError = { status: 500, message: 'Ошибка операции с базой данных' };
    testStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderLoadedList({ scope: 'all', search: '', sport: undefined });

    expect(screen.getByText('500, Ошибка операции с базой данных')).toBeOnTheScreen();
    await userEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.russian].retry));
    await screen.findByText('500, Ошибка операции с базой данных');
    expect(groupRequests).toHaveLength(2);
  });

  it('shows an empty search result when there are no matches', async () => {
    groupsResponse = [];
    testStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderLoadedList({ scope: 'all', search: 'unknown', sport: undefined });

    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].noResults)).toBeOnTheScreen();
  });

  it('shows joined and owned groups in My Groups and excludes pending requests', async () => {
    const activeMembership = {
      status: 'active' as const,
      role: 'member' as const,
      notificationPreference: 'all' as const,
      feedPreference: 'all' as const,
    };
    const activeGroup = { ...GROUP_FIXTURE, name: 'Joined runners', currentMembership: activeMembership };
    const ownedGroup = {
      ...GROUP_FIXTURE,
      id: 'owned-group',
      name: 'My team',
      isOwner: true,
      currentMembership: null,
    };
    const pendingGroup = {
      ...GROUP_FIXTURE,
      id: 'pending-group',
      name: 'Requested group',
      privacy: 'closed' as const,
      currentMembership: { ...activeMembership, status: 'pending' as const },
    };
    const visitorGroup = {
      ...GROUP_FIXTURE,
      id: 'visitor-group',
      name: 'Not joined',
      privacy: 'closed' as const,
    };
    groupsResponse = [activeGroup, ownedGroup, pendingGroup, visitorGroup];
    await renderLoadedList({ scope: 'mine', search: '', sport: undefined });

    expect(groupRequests[0]?.searchParams.get('scope')).toBe('mine');
    expect(screen.getByText('Joined runners')).toBeOnTheScreen();
    expect(screen.getByText('My team')).toBeOnTheScreen();
    expect(screen.queryByText('Requested group')).not.toBeOnTheScreen();
    expect(screen.queryByText('Not joined')).not.toBeOnTheScreen();
  });
});
