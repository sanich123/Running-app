import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupsPage from './groups-page';

const mockPush = jest.fn();
const mockGetGroupsQuery = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('@R/services/groups/groups', () => ({
  useGetGroupsQuery: (...args: unknown[]) => mockGetGroupsQuery(...args),
}));

const group = {
  id: 'group-1',
  name: 'Saturday runners',
  description: 'Morning runs together',
  sports: ['run'],
  privacy: 'open',
  locationName: 'Moscow',
  createdAt: '2026-10-29T10:00:00.000Z',
  memberCount: 3,
  currentMembership: null,
  canManage: false,
  pendingRequestCount: 0,
} as const;

describe('GroupsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockGetGroupsQuery.mockReturnValue({
      data: [group],
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    });
  });

  it('shows group cards and exactly four supported activity filters', async () => {
    await renderWithProviders(<GroupsPage />);

    expect(screen.getByText('Saturday runners')).toBeOnTheScreen();
    expect(screen.getByText('Running')).toBeOnTheScreen();
    expect(screen.getByText('Walking')).toBeOnTheScreen();
    expect(screen.getByText('Hiking')).toBeOnTheScreen();
    expect(screen.getAllByText('Cycling').length).toBeGreaterThan(0);
    expect(screen.getByTestId('groups-sport-filter-bike')).toBeOnTheScreen();
    expect(screen.queryByTestId('groups-sport-filter-swim')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('groups-sport-filter-workout')).not.toBeOnTheScreen();
  });

  it('shows a group photo and human-readable category labels', async () => {
    mockGetGroupsQuery.mockReturnValue({
      data: [{ ...group, photoUrl: 'https://example.test/group.jpg', categoryTags: ['team', 'local'] }],
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    });
    await renderWithProviders(<GroupsPage />);

    expect(screen.getByText('Team · Local community')).toBeOnTheScreen();
  });

  it('filters the catalog by one of the supported sports', async () => {
    await renderWithProviders(<GroupsPage />);
    await userEvent.press(screen.getByTestId('groups-sport-filter-walk'));

    await waitFor(() =>
      expect(mockGetGroupsQuery).toHaveBeenLastCalledWith({ scope: 'all', search: '', sport: 'walk' }),
    );
  });

  it('opens the create group screen', async () => {
    await renderWithProviders(<GroupsPage />);
    fireEvent.press(screen.getByTestId('groups-create-button'));

    expect(mockPush).toHaveBeenCalledWith('/groups/create');
  });

  it('switches scope, applies and clears a sport filter', async () => {
    await renderWithProviders(<GroupsPage />);
    const user = userEvent.setup();

    await user.press(screen.getByText('My groups'));
    await user.press(screen.getByTestId('groups-sport-filter-walk'));
    await waitFor(() =>
      expect(mockGetGroupsQuery).toHaveBeenLastCalledWith({ scope: 'mine', search: '', sport: 'walk' }),
    );

    await user.press(screen.getByTestId('groups-sport-filter-walk'));
    await waitFor(() =>
      expect(mockGetGroupsQuery).toHaveBeenLastCalledWith({ scope: 'mine', search: '', sport: undefined }),
    );
  });

  it('shows a retry action when the group catalog fails to load', async () => {
    const refetch = jest.fn();
    mockGetGroupsQuery.mockReturnValue({ data: [], isLoading: false, isFetching: false, isError: true, refetch });
    await renderWithProviders(<GroupsPage />);

    expect(screen.getByText('Could not load groups')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Retry'));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('shows a filtered empty state when a search returns no groups', async () => {
    mockGetGroupsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    });
    const user = userEvent.setup();
    await renderWithProviders(<GroupsPage />);

    await user.type(screen.getByPlaceholderText('Search groups'), 'unknown');

    await waitFor(() =>
      expect(mockGetGroupsQuery).toHaveBeenLastCalledWith({ scope: 'all', search: 'unknown', sport: undefined }),
    );
    expect(screen.getByText('No groups found')).toBeOnTheScreen();
  });

  it('opens a pending group card without optional description and location', async () => {
    mockGetGroupsQuery.mockReturnValue({
      data: [
        {
          ...group,
          id: 'pending-group',
          name: 'Pending hikers',
          description: null,
          locationName: null,
          privacy: 'closed',
          currentMembership: { status: 'pending', role: 'member' },
        },
      ],
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    });
    await renderWithProviders(<GroupsPage />);

    fireEvent.press(screen.getByText('Pending hikers'));

    expect(mockPush).toHaveBeenCalledWith('/groups/pending-group');
    expect(screen.queryByText('Morning runs together')).not.toBeOnTheScreen();
    expect(screen.queryByText('Moscow')).not.toBeOnTheScreen();
  });

  it('renders Russian controls and marks the selected sport filter', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<GroupsPage />);
    const user = userEvent.setup();

    expect(screen.getByText('Все')).toBeOnTheScreen();
    const walkFilter = screen.getByTestId('groups-sport-filter-walk');
    await user.press(walkFilter);
    await waitFor(() =>
      expect(screen.getByTestId('groups-sport-filter-walk').props.accessibilityState.selected).toBe(true),
    );
    await waitFor(() =>
      expect(mockGetGroupsQuery).toHaveBeenLastCalledWith({ scope: 'all', search: '', sport: 'walk' }),
    );
  });

  it('shows the loading state when the query has not returned data', async () => {
    mockGetGroupsQuery.mockReturnValue({ isLoading: true, isFetching: true, isError: false, refetch: jest.fn() });
    await renderWithProviders(<GroupsPage />);

    expect(screen.getByRole('progressbar')).toBeOnTheScreen();
  });

  it('shows Russian retry copy when the catalog request fails', async () => {
    const refetch = jest.fn();
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockGetGroupsQuery.mockReturnValue({ data: [], isLoading: false, isFetching: false, isError: true, refetch });
    await renderWithProviders(<GroupsPage />);

    expect(screen.getByText('Не удалось загрузить группы')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Повторить'));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
