import { fireEvent, screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupsList from './groups-list';
import { GROUPS_COPY } from '../../const';
import { GROUP_FIXTURE } from '../../test-fixtures';

const mockGetGroups = jest.fn();
const mockPush = jest.fn();
jest.mock('@R/services/groups/groups', () => ({ useGetGroupsQuery: (...args: unknown[]) => mockGetGroups(...args) }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('GroupsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockGetGroups.mockReturnValue({
      data: [GROUP_FIXTURE],
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    });
  });

  it('loads groups with the selected filters and opens a group', async () => {
    await renderWithProviders(<GroupsList filters={{ scope: 'all', search: 'run', sport: 'run' }} />);

    expect(mockGetGroups).toHaveBeenCalledWith({ scope: 'all', search: 'run', sport: 'run' });
    fireEvent.press(screen.getByText(GROUP_FIXTURE.name));
    expect(mockPush).toHaveBeenCalledWith(`/groups/${GROUP_FIXTURE.id}`);
  });

  it('shows the HTTP status and a retry button after a failed request', async () => {
    const refetch = jest.fn();
    mockGetGroups.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      isError: true,
      error: { status: 500, data: { statusCode: 500, message: 'Ошибка операции с базой данных' } },
      refetch,
    });
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<GroupsList filters={{ scope: 'all', search: '', sport: undefined }} />);

    expect(screen.getByText('500, Ошибка операции с базой данных')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Повторить'));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('shows an empty search result when there are no matches', async () => {
    mockGetGroups.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<GroupsList filters={{ scope: 'all', search: 'unknown', sport: undefined }} />);

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
    const visitorGroup = { ...GROUP_FIXTURE, id: 'visitor-group', name: 'Not joined' };
    mockGetGroups.mockReturnValue({
      data: [activeGroup, ownedGroup, pendingGroup, visitorGroup],
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    });
    await renderWithProviders(<GroupsList filters={{ scope: 'mine', search: '', sport: undefined }} />);

    expect(mockGetGroups).toHaveBeenCalledWith({ scope: 'mine', search: '', sport: undefined });
    expect(screen.getByText('Joined runners')).toBeOnTheScreen();
    expect(screen.getByText('My team')).toBeOnTheScreen();
    expect(screen.queryByText('Requested group')).not.toBeOnTheScreen();
    expect(screen.queryByText('Not joined')).not.toBeOnTheScreen();
  });
});
