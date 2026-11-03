import type { ReactNode } from 'react';
import { fireEvent, screen, userEvent, waitFor, within } from '@testing-library/react-native';
import { View } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupsPage from './groups-page';
import { GROUP_CATEGORY_LABELS, GROUPS_COPY, GROUP_SPORT_LABELS } from '../const';
import { GROUP_FIXTURE } from '../test-fixtures';

const mockPush = jest.fn();
const mockGetGroupsQuery = jest.fn();
const mockGetUserProfile = jest.fn();
const mockUpdateProfile = jest.fn();
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
jest.mock('@R/services/groups/groups', () => ({
  useGetGroupsQuery: (...args: unknown[]) => mockGetGroupsQuery(...args),
}));
jest.mock('@R/services/profile/profile', () => ({
  useGetUserProfileByUserIdQuery: (...args: unknown[]) => mockGetUserProfile(...args),
  useUpdateProfileByUserIdMutation: () => [mockUpdateProfile, { isLoading: false }],
}));

describe('GroupsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockGetUserProfile.mockReturnValue({
      data: { groupPostsNotifications: true, groupEventsNotifications: true },
      isSuccess: true,
    });
    mockUpdateProfile.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
    mockGetGroupsQuery.mockReturnValue({
      data: [GROUP_FIXTURE],
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    });
  });

  it('shows group cards and exactly four supported activity filters', async () => {
    await renderWithProviders(<GroupsPage />);

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
    mockGetGroupsQuery.mockReturnValue({
      data: [
        {
          ...GROUP_FIXTURE,
          photoUrl: 'https://example.test/group.jpg',
          categoryTags: ['team', 'local'],
          photoPending: true,
        },
      ],
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    });
    await renderWithProviders(<GroupsPage />);

    expect(
      screen.getByText(
        GROUP_FIXTURE.categoryTags.map((categoryTag) => GROUP_CATEGORY_LABELS.en[categoryTag]).join(' · '),
      ),
    ).toBeOnTheScreen();
    expect(screen.getByTestId(`group-photo-${GROUP_FIXTURE.id}-moderation-status`)).toBeOnTheScreen();
  });

  it('filters the catalog by one of the supported sports', async () => {
    await renderWithProviders(<GroupsPage />);
    await userEvent.press(screen.getByTestId('groups-sport-filter'));
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

  it('opens group notification preferences from the tab settings button', async () => {
    await renderWithProviders(<GroupsPage />);
    await userEvent.press(screen.getByTestId('groups-settings-button'));

    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].groupNotificationSettingsTitle)).toBeOnTheScreen();
    expect(screen.getByTestId('group-post-notifications-switch')).toBeOnTheScreen();
    expect(screen.getByTestId('group-event-notifications-switch')).toBeOnTheScreen();
    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].groupNotificationDeliveryHint)).toBeOnTheScreen();
  });

  it('switches scope, applies and clears a sport filter', async () => {
    await renderWithProviders(<GroupsPage />);
    const user = userEvent.setup();

    await user.press(screen.getByText('My groups'));
    await user.press(screen.getByTestId('groups-sport-filter'));
    await user.press(screen.getByTestId('groups-sport-filter-walk'));
    await waitFor(() =>
      expect(mockGetGroupsQuery).toHaveBeenLastCalledWith({ scope: 'mine', search: '', sport: 'walk' }),
    );

    await user.press(screen.getByTestId('groups-sport-filter'));
    await user.press(screen.getByTestId('groups-sport-filter-all'));
    await waitFor(() =>
      expect(mockGetGroupsQuery).toHaveBeenLastCalledWith({ scope: 'mine', search: '', sport: undefined }),
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
    mockGetGroupsQuery.mockReturnValue({
      data: [{ ...GROUP_FIXTURE, currentMembership: { status: 'active', role: 'member' } }, pendingGroup],
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    });
    await renderWithProviders(<GroupsPage />);
    await userEvent.press(screen.getByText('My groups'));

    expect(screen.getByText(GROUP_FIXTURE.name)).toBeOnTheScreen();
    expect(screen.queryByText(pendingGroup.name)).toBeNull();
  });

  it('shows a retry action when the group catalog fails to load', async () => {
    const refetch = jest.fn();
    mockGetGroupsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      isError: true,
      error: { status: 503, data: { message: 'Service unavailable' } },
      refetch,
    });
    await renderWithProviders(<GroupsPage />);

    expect(screen.getByText('503, Service unavailable')).toBeOnTheScreen();
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
    await renderWithProviders(<GroupsPage />);
    const user = userEvent.setup();
    await user.type(screen.getByTestId('search-groups'), 'unknown');

    await waitFor(() =>
      expect(mockGetGroupsQuery).toHaveBeenLastCalledWith({ scope: 'all', search: 'unknown', sport: undefined }),
    );
    expect(screen.getByText('No groups found')).toBeOnTheScreen();
    await user.press(screen.getByTestId('clear-groups-search'));
    await waitFor(() =>
      expect(mockGetGroupsQuery).toHaveBeenLastCalledWith({ scope: 'all', search: '', sport: undefined }),
    );
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
    mockGetGroupsQuery.mockReturnValue({
      data: [pendingGroup],
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    });
    await renderWithProviders(<GroupsPage />);

    fireEvent.press(screen.getByText(pendingGroup.name));

    expect(mockPush).toHaveBeenCalledWith(`/groups/${pendingGroup.id}`);
    expect(screen.queryByText(GROUP_FIXTURE.description!)).not.toBeOnTheScreen();
    expect(screen.queryByText(GROUP_FIXTURE.locationName!)).not.toBeOnTheScreen();
  });

  it('renders Russian controls and marks the selected sport filter', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<GroupsPage />);
    const user = userEvent.setup();

    expect(screen.getByText('Все')).toBeOnTheScreen();
    await user.press(screen.getByTestId('groups-sport-filter'));
    const walkFilter = screen.getByTestId('groups-sport-filter-walk');
    await user.press(walkFilter);
    await waitFor(() => expect(screen.getByTestId('groups-sport-filter').props.accessibilityLabel).toBe('Ходьба'));
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
    mockGetGroupsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      isError: true,
      error: { status: 500, data: { message: 'Внутренняя ошибка' } },
      refetch,
    });
    await renderWithProviders(<GroupsPage />);

    expect(screen.getByText('500, Внутренняя ошибка')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Повторить'));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
