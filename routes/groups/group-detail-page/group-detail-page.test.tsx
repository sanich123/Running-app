import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import { Share } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupDetailPage from './group-detail-page';
import { GROUPS_COPY } from '../const';
import { GROUP_FIXTURE } from '../test-fixtures';

const mockBack = jest.fn();
const mockPush = jest.fn();
let mockRouteParams: { groupId: string | string[]; tab?: string | string[] } = { groupId: GROUP_FIXTURE.id };
const mockGetGroup = jest.fn();
const mockGetMembersInfinite = jest.fn();
const mockJoinMutation = jest.fn();
const mockLeaveMutation = jest.fn();
const mockUpdateMutation = jest.fn();
const mockMonthlyStatisticsInfiniteQuery = jest.fn();
const mockPreferencesMutation = jest.fn();
const mockGetPostsInfinite = jest.fn();
const mockGetEventsInfinite = jest.fn();
const mockGetEvents = jest.fn();
const mockDeleteMutation = jest.fn();
const mockJoin = jest.fn();
const mockLeave = jest.fn();
const mockUpdate = jest.fn();
const mockUpdatePreferences = jest.fn();
const mockDeleteGroup = jest.fn();
const mockErrorToast = jest.fn();
const mockSuccessToast = jest.fn();

jest.mock('expo-router', () => ({
  Stack: {
    Screen: ({ options }: { options: { headerRight?: () => unknown } }) => {
      const React = jest.requireActual('react');
      return options.headerRight ? React.createElement(React.Fragment, null, options.headerRight()) : null;
    },
  },
  useLocalSearchParams: () => mockRouteParams,
  useRouter: () => ({ back: mockBack, push: mockPush, replace: mockPush }),
}));
jest.mock('@S/error-toast/error-toast', () => {
  const actual = jest.requireActual('@S/error-toast/error-toast');
  return { ...actual, errorToast: (...args: unknown[]) => mockErrorToast(...args) };
});
jest.mock('@S/success-toast/success-toast', () => ({
  successToast: (...args: unknown[]) => mockSuccessToast(...args),
}));
jest.mock('@R/services/groups/groups', () => ({
  useGetGroupByIdQuery: (...args: unknown[]) => mockGetGroup(...args),
  useGetGroupMembersInfiniteQuery: (...args: unknown[]) => mockGetMembersInfinite(...args),
  useGetGroupMonthlyStatisticsInfiniteQuery: (...args: unknown[]) => mockMonthlyStatisticsInfiniteQuery(...args),
  useGetGroupPostsInfiniteQuery: (...args: unknown[]) => mockGetPostsInfinite(...args),
  useGetGroupEventsInfiniteQuery: (...args: unknown[]) => mockGetEventsInfinite(...args),
  useGetGroupEventsQuery: (...args: unknown[]) => mockGetEvents(...args),
  useJoinGroupMutation: (...args: unknown[]) => mockJoinMutation(...args),
  useLeaveGroupMutation: () => mockLeaveMutation(),
  useUpdateGroupMemberMutation: () => mockUpdateMutation(),
  useUpdateGroupPreferencesMutation: () => mockPreferencesMutation(),
  useDeleteGroupMutation: () => mockDeleteMutation(),
}));

describe('GroupDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = { groupId: GROUP_FIXTURE.id };
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockGetGroup.mockReturnValue({
      data: {
        id: GROUP_FIXTURE.id,
        name: GROUP_FIXTURE.name,
        description: 'Morning runs together',
        sports: ['run'],
        privacy: 'open',
        locationName: null,
        createdAt: '2026-10-29T10:00:00.000Z',
        updatedAt: '2026-10-29T10:00:00.000Z',
        memberCount: 3,
        currentMembership: {
          status: 'active',
          role: 'member',
          notificationPreference: 'all',
          feedPreference: 'all',
        },
        canManage: false,
        pendingRequestCount: 0,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockGetMembersInfinite.mockReturnValue({
      data: { pages: [{ items: [], hasMore: false, nextCursor: null }] },
      isLoading: false,
      isError: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });
    mockMonthlyStatisticsInfiniteQuery.mockReturnValue({
      data: { pages: [{ items: [], hasMore: false, nextCursor: null }] },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });
    mockGetPostsInfinite.mockReturnValue({
      data: { pages: [{ items: [], hasMore: false, nextCursor: null }] },
      isLoading: false,
      isError: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });
    mockGetEventsInfinite.mockReturnValue({
      data: { pages: [{ items: [], hasMore: false, nextCursor: null }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });
    mockGetEvents.mockReturnValue({ data: [], isLoading: false });
    mockJoin.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
    mockJoinMutation.mockReturnValue([mockJoin, { isLoading: false, reset: jest.fn() }]);
    mockLeave.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
    mockUpdate.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
    mockUpdatePreferences.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
    mockDeleteGroup.mockReturnValue({ unwrap: jest.fn().mockResolvedValue(undefined) });
    mockLeaveMutation.mockReturnValue([mockLeave, { isLoading: false }]);
    mockUpdateMutation.mockReturnValue([mockUpdate, { isLoading: false }]);
    mockPreferencesMutation.mockReturnValue([mockUpdatePreferences, { isLoading: false }]);
    mockDeleteMutation.mockReturnValue([mockDeleteGroup, { isLoading: false }]);
  });

  it('lets a visitor join an open group', async () => {
    mockGetGroup.mockReturnValue({
      data: { ...GROUP_FIXTURE, updatedAt: GROUP_FIXTURE.createdAt, currentMembership: null },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    });
    await renderWithProviders(<GroupDetailPage />);
    expect(screen.getByText(GROUP_FIXTURE.name)).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Join group'));

    await waitFor(() => expect(mockJoin).toHaveBeenCalledWith(GROUP_FIXTURE.id));
    expect(screen.getByText('Join group')).toBeOnTheScreen();
    expect(screen.queryByText('Leave group')).not.toBeOnTheScreen();
  });

  it('shows a pending state for a closed group request', async () => {
    mockGetGroup.mockReturnValue({
      data: {
        id: GROUP_FIXTURE.id,
        name: 'Closed runners',
        description: null,
        sports: ['run'],
        privacy: 'closed',
        locationName: null,
        createdAt: '2026-10-29T10:00:00.000Z',
        updatedAt: '2026-10-29T10:00:00.000Z',
        memberCount: 3,
        currentMembership: { status: 'pending', role: 'member' },
        canManage: false,
        pendingRequestCount: 0,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    await renderWithProviders(<GroupDetailPage />);

    expect(screen.getByText('Awaiting approval')).toBeDisabled();
    expect(screen.getByText('3 members')).toBeOnTheScreen();
  });

  it('sends a join request to a closed group and reports success', async () => {
    mockGetGroup.mockReturnValue({
      data: {
        id: GROUP_FIXTURE.id,
        name: 'Closed runners',
        description: null,
        sports: ['run'],
        privacy: 'closed',
        locationName: null,
        createdAt: '2026-10-29T10:00:00.000Z',
        updatedAt: '2026-10-29T10:00:00.000Z',
        memberCount: 3,
        currentMembership: null,
        canManage: false,
        pendingRequestCount: 0,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    await renderWithProviders(<GroupDetailPage />);
    await userEvent.press(screen.getByText('Request to join'));

    await waitFor(() => expect(mockJoin).toHaveBeenCalledWith(GROUP_FIXTURE.id));
    expect(screen.getByText('Request to join')).toBeOnTheScreen();
    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].groupContentMembersOnly)).toBeOnTheScreen();
    expect(mockSuccessToast).toHaveBeenCalledWith('Your request was sent');
    expect(mockJoinMutation).toHaveBeenCalledWith({ fixedCacheKey: `group-join-${GROUP_FIXTURE.id}` });
  });

  it('lets an active member leave a group', async () => {
    mockGetGroup.mockReturnValue({
      data: {
        id: GROUP_FIXTURE.id,
        name: GROUP_FIXTURE.name,
        description: null,
        sports: ['run'],
        privacy: 'open',
        locationName: null,
        createdAt: '2026-10-29T10:00:00.000Z',
        updatedAt: '2026-10-29T10:00:00.000Z',
        memberCount: 3,
        currentMembership: { status: 'active', role: 'member' },
        canManage: false,
        pendingRequestCount: 0,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    await renderWithProviders(<GroupDetailPage />);
    fireEvent.press(screen.getByText('Leave group'));

    await waitFor(() => expect(mockLeave).toHaveBeenCalledWith(GROUP_FIXTURE.id));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('lets a group manager open join requests and remove a member', async () => {
    mockGetGroup.mockReturnValue({
      data: {
        id: GROUP_FIXTURE.id,
        name: GROUP_FIXTURE.name,
        description: 'Morning runs',
        sports: ['run'],
        privacy: 'closed',
        locationName: GROUP_FIXTURE.locationName,
        createdAt: '2026-10-29T10:00:00.000Z',
        memberCount: 2,
        currentMembership: { status: 'active', role: 'owner' },
        canManage: true,
        pendingRequestCount: 1,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockGetMembersInfinite.mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                userId: 'member-1',
                role: 'member',
                status: 'active',
                joinedAt: null,
                profile: { name: 'Member', surname: null, city: null, profilePhoto: null },
              },
            ],
            hasMore: false,
            nextCursor: null,
          },
        ],
      },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });

    await renderWithProviders(<GroupDetailPage />);
    const user = userEvent.setup();
    await user.press(screen.getByLabelText('Manage join requests'));
    await user.press(screen.getByLabelText('Members'));
    await user.press(screen.getByTestId('group-member-profile-member-1'));
    await user.press(screen.getByText('Remove'));

    expect(mockPush).toHaveBeenCalledWith(`/groups/${GROUP_FIXTURE.id}/requests`);
    expect(mockPush).toHaveBeenCalledWith('/profile/member-1');
    expect(mockUpdate).toHaveBeenCalledWith({ groupId: GROUP_FIXTURE.id, userId: 'member-1', status: 'removed' });
  });

  it('shows empty member and request sections for an open group owner', async () => {
    mockGetGroup.mockReturnValue({
      data: {
        id: GROUP_FIXTURE.id,
        name: 'New club',
        description: null,
        sports: [],
        privacy: 'open',
        locationName: null,
        createdAt: '2026-10-29T10:00:00.000Z',
        updatedAt: '2026-10-29T10:00:00.000Z',
        memberCount: 1,
        currentMembership: { status: 'active', role: 'owner' },
        isOwner: true,
        canManage: true,
        pendingRequestCount: 0,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    await renderWithProviders(<GroupDetailPage />);
    const user = userEvent.setup();
    await user.press(screen.getByLabelText('Members'));

    expect(screen.getByText('No members yet.')).toBeOnTheScreen();
    expect(screen.queryByText('Leave group')).not.toBeOnTheScreen();
  });

  it('shows a loading state while group details are being fetched', async () => {
    mockGetGroup.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: jest.fn() });
    await renderWithProviders(<GroupDetailPage />);

    expect(screen.getByRole('progressbar')).toBeOnTheScreen();
  });

  it('reports an error when joining a group fails', async () => {
    mockJoin.mockReturnValue({ unwrap: jest.fn().mockRejectedValue(new Error('offline')) });
    mockGetGroup.mockReturnValue({
      data: { ...GROUP_FIXTURE, updatedAt: GROUP_FIXTURE.createdAt, currentMembership: null },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    await renderWithProviders(<GroupDetailPage />);
    const user = userEvent.setup();

    await user.press(screen.getByText('Join group'));

    await waitFor(() => expect(mockErrorToast).toHaveBeenCalledWith('Could not save changes', expect.any(Error)));
  });

  it('reports an error when leaving a group fails', async () => {
    mockGetGroup.mockReturnValue({
      data: {
        id: GROUP_FIXTURE.id,
        name: GROUP_FIXTURE.name,
        description: null,
        sports: ['run'],
        privacy: 'open',
        locationName: null,
        createdAt: '2026-10-29T10:00:00.000Z',
        updatedAt: '2026-10-29T10:00:00.000Z',
        memberCount: 1,
        currentMembership: { status: 'active', role: 'member' },
        canManage: false,
        pendingRequestCount: 0,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockLeave.mockReturnValue({ unwrap: jest.fn().mockRejectedValue(new Error('offline')) });
    await renderWithProviders(<GroupDetailPage />);
    const user = userEvent.setup();
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].leave));

    await waitFor(() =>
      expect(mockErrorToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].saveError, expect.any(Error)),
    );
  });

  it('shows a retry action after group details fail to load', async () => {
    const refetch = jest.fn();
    mockGetGroup.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 503, data: { message: 'Service unavailable' } },
      refetch,
    });
    await renderWithProviders(<GroupDetailPage />);

    expect(await screen.findByText('503, Service unavailable')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Retry'));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('shares the group link and displays its photo and type tags', async () => {
    mockGetGroup.mockReturnValue({
      data: {
        id: GROUP_FIXTURE.id,
        name: GROUP_FIXTURE.name,
        description: null,
        sports: ['run'],
        categoryTags: ['team'],
        photoUrl: 'https://example.test/group.jpg',
        privacy: 'open',
        locationName: null,
        createdAt: '2026-10-29T10:00:00.000Z',
        updatedAt: '2026-10-29T10:00:00.000Z',
        memberCount: 3,
        currentMembership: { status: 'active', role: 'member' },
        canManage: false,
        pendingRequestCount: 0,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    const share = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction', activityType: undefined });
    await renderWithProviders(<GroupDetailPage />);
    expect(screen.getByText('Team')).toBeOnTheScreen();
    await userEvent.press(screen.getByLabelText('Group actions'));
    await userEvent.press(screen.getByText('Share group'));
    expect(share).toHaveBeenCalledWith({
      title: GROUP_FIXTURE.name,
      message: expect.stringContaining(`/groups/${GROUP_FIXTURE.id}`),
      url: expect.stringContaining(`/groups/${GROUP_FIXTURE.id}`),
    });
    share.mockRestore();
  });

  it('reports a share failure', async () => {
    const share = jest.spyOn(Share, 'share').mockRejectedValue(new Error('share unavailable'));
    await renderWithProviders(<GroupDetailPage />);
    const user = userEvent.setup();
    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].groupActions));
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].share));

    await waitFor(() =>
      expect(mockErrorToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].saveError, expect.any(Error)),
    );
    share.mockRestore();
  });

  it('shows the monthly distance leaderboard for visible member activities', async () => {
    mockGetGroup.mockReturnValue({
      data: {
        id: GROUP_FIXTURE.id,
        name: GROUP_FIXTURE.name,
        description: null,
        sports: ['run'],
        privacy: 'open',
        locationName: null,
        createdAt: '2026-10-29T10:00:00.000Z',
        updatedAt: '2026-10-29T10:00:00.000Z',
        memberCount: 1,
        currentMembership: { status: 'active', role: 'member', notificationPreference: 'all', feedPreference: 'all' },
        canManage: false,
        pendingRequestCount: 0,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockMonthlyStatisticsInfiniteQuery.mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                userId: 'runner-1',
                profile: { name: 'Fast', surname: 'Runner', city: null, profilePhoto: null },
                totalDistance: 12500,
              },
            ],
            hasMore: false,
            nextCursor: null,
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    await renderWithProviders(<GroupDetailPage />);

    expect(screen.getByText('Fast Runner')).toBeOnTheScreen();
    expect(screen.getByText('12.5 km')).toBeOnTheScreen();
    await userEvent.press(screen.getByTestId('group-member-profile-runner-1'));
    expect(mockPush).toHaveBeenCalledWith('/profile/runner-1');
  });

  it('formats the group statistics and category in Russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockGetGroup.mockReturnValue({
      data: {
        id: GROUP_FIXTURE.id,
        name: GROUP_FIXTURE.name,
        description: null,
        sports: ['run'],
        categoryTags: ['team'],
        privacy: 'open',
        locationName: null,
        createdAt: '2026-10-29T10:00:00.000Z',
        updatedAt: '2026-10-29T10:00:00.000Z',
        memberCount: 1,
        currentMembership: { status: 'active', role: 'member' },
        canManage: false,
        pendingRequestCount: 0,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    await renderWithProviders(<GroupDetailPage />);
    const monthLabel = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(new Date());

    expect(screen.getByText(monthLabel)).toBeOnTheScreen();
    expect(screen.getByText('Команда')).toBeOnTheScreen();
  });

  it('offers retry when monthly statistics fail to load', async () => {
    const refetch = jest.fn();
    mockMonthlyStatisticsInfiniteQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });
    await renderWithProviders(<GroupDetailPage />);

    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].statsError)).toBeOnTheScreen();
    fireEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].retry));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('saves notification and home-feed preferences for an active member', async () => {
    mockGetGroup.mockReturnValue({
      data: {
        id: GROUP_FIXTURE.id,
        name: GROUP_FIXTURE.name,
        description: null,
        sports: ['run'],
        privacy: 'open',
        locationName: null,
        createdAt: '2026-10-29T10:00:00.000Z',
        updatedAt: '2026-10-29T10:00:00.000Z',
        memberCount: 1,
        currentMembership: { status: 'active', role: 'member', notificationPreference: 'all', feedPreference: 'all' },
        canManage: false,
        pendingRequestCount: 0,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    const user = userEvent.setup();
    await renderWithProviders(<GroupDetailPage />);

    await user.press(screen.getByLabelText('Members'));
    await user.press(screen.getByText('Announcements only'));
    await user.press(screen.getByText('Admin posts only'));

    expect(mockUpdatePreferences).toHaveBeenNthCalledWith(1, {
      groupId: GROUP_FIXTURE.id,
      notificationPreference: 'announcements',
      feedPreference: 'all',
    });
    expect(mockUpdatePreferences).toHaveBeenNthCalledWith(2, {
      groupId: GROUP_FIXTURE.id,
      notificationPreference: 'all',
      feedPreference: 'admins',
    });
  });

  it('uses preference defaults and reports when saving preferences fails', async () => {
    mockGetGroup.mockReturnValue({
      data: {
        id: GROUP_FIXTURE.id,
        name: GROUP_FIXTURE.name,
        description: null,
        sports: ['run'],
        privacy: 'open',
        locationName: null,
        createdAt: '2026-10-29T10:00:00.000Z',
        updatedAt: '2026-10-29T10:00:00.000Z',
        memberCount: 1,
        currentMembership: { status: 'active', role: 'member' },
        canManage: false,
        pendingRequestCount: 0,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockUpdatePreferences.mockReturnValue({ unwrap: jest.fn().mockRejectedValue(new Error('offline')) });
    await renderWithProviders(<GroupDetailPage />);
    const user = userEvent.setup();
    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].membersTab));
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].announcementNotifications));

    await waitFor(() =>
      expect(mockErrorToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].saveError, expect.any(Error)),
    );
    expect(mockUpdatePreferences).toHaveBeenCalledWith({
      groupId: GROUP_FIXTURE.id,
      notificationPreference: 'announcements',
      feedPreference: 'all',
    });
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].adminPostsOnly));
    await waitFor(() =>
      expect(mockUpdatePreferences).toHaveBeenLastCalledWith({
        groupId: GROUP_FIXTURE.id,
        notificationPreference: 'all',
        feedPreference: 'admins',
      }),
    );
  });

  it('renders the group feed for active members', async () => {
    mockGetGroup.mockReturnValue({
      data: {
        id: GROUP_FIXTURE.id,
        name: GROUP_FIXTURE.name,
        description: null,
        sports: ['run'],
        privacy: 'open',
        locationName: null,
        createdAt: '2026-10-29T10:00:00.000Z',
        updatedAt: '2026-10-29T10:00:00.000Z',
        memberCount: 1,
        currentMembership: { status: 'active', role: 'member', notificationPreference: 'all', feedPreference: 'all' },
        canManage: false,
        pendingRequestCount: 0,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockGetPostsInfinite.mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: 'post-1',
                text: 'Long run on Sunday',
                createdAt: '2026-10-29T10:00:00.000Z',
                author: { userId: 'member-1', name: 'Alex Runner', profilePhoto: null },
                photoUrl: null,
              },
            ],
            hasMore: false,
            nextCursor: null,
          },
        ],
      },
      isLoading: false,
      isError: false,
    });
    const user = userEvent.setup();
    await renderWithProviders(<GroupDetailPage />);
    await user.press(screen.getByLabelText('Posts'));

    expect(screen.getByText('Long run on Sunday')).toBeOnTheScreen();
    expect(screen.getByText('Alex Runner')).toBeOnTheScreen();
    expect(screen.queryByText(GROUPS_COPY[LANGUAGES.english].posts)).not.toBeOnTheScreen();
    await user.press(screen.getByTestId('group-post-author-post-1'));
    expect(mockPush).toHaveBeenCalledWith('/profile/member-1');
  });

  it('shows pending and unavailable post photos and falls back to the member label', async () => {
    mockGetPostsInfinite.mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: 'photo-ready',
                text: 'Photo ready',
                createdAt: '2026-10-29T10:00:00.000Z',
                author: { userId: 'member-1', name: 'Alex Runner', profilePhoto: 'https://example.test/avatar.jpg' },
                photoUrl: null,
                photoPreviewUrl: 'https://example.test/post.jpg',
                hasPhoto: true,
                photoPending: false,
              },
              {
                id: 'photo-pending',
                text: 'Photo pending',
                createdAt: '2026-10-29T10:00:00.000Z',
                author: { userId: 'member-2', name: null, profilePhoto: null },
                photoUrl: null,
                hasPhoto: true,
                photoPending: true,
              },
              {
                id: 'photo-unavailable',
                text: 'Photo unavailable',
                createdAt: '2026-10-29T10:00:00.000Z',
                author: { userId: 'member-3', name: null, profilePhoto: null },
                photoUrl: null,
                hasPhoto: true,
                photoPending: false,
              },
            ],
            hasMore: false,
            nextCursor: null,
          },
        ],
      },
      isLoading: false,
      isError: false,
    });
    const user = userEvent.setup();
    await renderWithProviders(<GroupDetailPage />);
    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].postsTab));

    expect(screen.getByText('Photo ready')).toBeOnTheScreen();
    expect(screen.getByTestId('group-post-photo-photo-pending-moderation-status')).toBeOnTheScreen();
    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].postPhotoUnavailable)).toBeOnTheScreen();
    expect(screen.getAllByText(GROUPS_COPY[LANGUAGES.english].member)).toHaveLength(2);
  });

  it('shows a loading state for the group feed', async () => {
    mockGetPostsInfinite.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    const user = userEvent.setup();
    await renderWithProviders(<GroupDetailPage />);
    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].postsTab));

    expect(screen.getByRole('progressbar')).toBeOnTheScreen();
  });

  it('shows an error state when the group feed cannot load', async () => {
    const refetchPosts = jest.fn();
    mockGetPostsInfinite.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 500, data: { message: 'Internal Server Error' } },
      refetch: refetchPosts,
    });
    const user = userEvent.setup();
    await renderWithProviders(<GroupDetailPage />);
    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].postsTab));

    expect(screen.getByText('500, Internal Server Error')).toBeOnTheScreen();
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].retry));
    expect(refetchPosts).toHaveBeenCalledTimes(1);
  });

  it('opens the group post and event composer from the header', async () => {
    mockGetGroup.mockReturnValue({
      data: {
        id: GROUP_FIXTURE.id,
        name: GROUP_FIXTURE.name,
        description: null,
        sports: ['run'],
        privacy: 'closed',
        locationName: null,
        createdAt: '2026-10-29T10:00:00.000Z',
        updatedAt: '2026-10-29T10:00:00.000Z',
        memberCount: 1,
        currentMembership: { status: 'active', role: 'member' },
        canManage: false,
        pendingRequestCount: 0,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    await renderWithProviders(<GroupDetailPage />);

    const createButton = screen.getByTestId('group-create-content-header-button');
    await userEvent.press(createButton);

    expect(mockPush).toHaveBeenCalledWith(`/groups/${GROUP_FIXTURE.id}/create-content`);
  });

  it('loads events for the selected period', async () => {
    mockRouteParams = { groupId: [GROUP_FIXTURE.id], tab: ['events'] };
    mockGetEventsInfinite.mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: 'event-1',
                title: 'Sunday long run',
                description: 'Meet by the fountain',
                locationName: 'Gorky Park',
                sport: 'run',
                distanceKm: 8,
                startsAt: '2026-11-08T10:00:00.000Z',
                createdAt: '2026-11-01T10:00:00.000Z',
              },
            ],
            hasMore: true,
            nextCursor: 'next-event',
          },
        ],
      },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });
    await renderWithProviders(<GroupDetailPage />);

    expect(screen.getByText('Sunday long run')).toBeOnTheScreen();
    const user = userEvent.setup();
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].pastEvents));
    await waitFor(() =>
      expect(mockGetEventsInfinite).toHaveBeenLastCalledWith(
        { groupId: GROUP_FIXTURE.id, period: 'past' },
        { skip: false },
      ),
    );
  });

  it('starts photo moderation polling and clears it when leaving the page', async () => {
    const refetch = jest.fn();
    mockGetGroup.mockReturnValue({
      data: {
        id: GROUP_FIXTURE.id,
        name: GROUP_FIXTURE.name,
        description: null,
        sports: ['run'],
        privacy: 'open',
        locationName: null,
        photoPending: true,
        createdAt: '2026-10-29T10:00:00.000Z',
        updatedAt: '2026-10-29T10:00:00.000Z',
        memberCount: 1,
        currentMembership: null,
        canManage: false,
        pendingRequestCount: 0,
      },
      isLoading: false,
      isError: false,
      refetch,
    });
    const { unmount } = await renderWithProviders(<GroupDetailPage />);
    expect(screen.getByTestId('group-detail-photo-moderation-status')).toBeOnTheScreen();
    unmount();
    expect(refetch).not.toHaveBeenCalled();
  });

  it('shows owner request controls and deletes the group after confirmation', async () => {
    mockGetGroup.mockReturnValue({
      data: {
        id: GROUP_FIXTURE.id,
        name: GROUP_FIXTURE.name,
        description: null,
        sports: ['run'],
        privacy: 'closed',
        locationName: null,
        createdAt: '2026-10-29T10:00:00.000Z',
        updatedAt: '2026-10-29T10:00:00.000Z',
        createdByUserId: 'owner-1',
        isOwner: true,
        memberCount: 1,
        currentMembership: null,
        canManage: true,
        pendingRequestCount: 4,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    await renderWithProviders(<GroupDetailPage />);

    expect(screen.getByTestId('group-requests-header-button')).toBeOnTheScreen();
    expect(screen.getByText('4')).toBeOnTheScreen();
    const user = userEvent.setup();
    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].groupActions));
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].deleteGroup));
    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].deleteGroupTitle)).toBeOnTheScreen();
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].deleteGroupConfirm));

    await waitFor(() => expect(mockDeleteGroup).toHaveBeenCalledWith(GROUP_FIXTURE.id));
    expect(mockSuccessToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].groupDeleted);
    expect(mockPush).toHaveBeenCalledWith('/groups');
  });

  it('does not show join request controls for an open group', async () => {
    mockGetGroup.mockReturnValue({
      data: {
        id: GROUP_FIXTURE.id,
        name: GROUP_FIXTURE.name,
        description: null,
        sports: ['run'],
        privacy: 'open',
        locationName: null,
        createdAt: '2026-10-29T10:00:00.000Z',
        updatedAt: '2026-10-29T10:00:00.000Z',
        createdByUserId: 'owner-1',
        isOwner: true,
        memberCount: 1,
        currentMembership: null,
        canManage: true,
        pendingRequestCount: 0,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    await renderWithProviders(<GroupDetailPage />);

    expect(screen.queryByTestId('group-requests-header-button')).toBeNull();
  });

  it('lets the owner cancel deletion and reports a failed deletion', async () => {
    mockGetGroup.mockReturnValue({
      data: {
        id: GROUP_FIXTURE.id,
        name: GROUP_FIXTURE.name,
        description: null,
        sports: ['run'],
        privacy: 'open',
        locationName: null,
        createdAt: '2026-10-29T10:00:00.000Z',
        updatedAt: '2026-10-29T10:00:00.000Z',
        createdByUserId: 'owner-1',
        isOwner: true,
        memberCount: 1,
        currentMembership: null,
        canManage: true,
        pendingRequestCount: 0,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockDeleteGroup.mockReturnValue({ unwrap: jest.fn().mockRejectedValue(new Error('offline')) });
    await renderWithProviders(<GroupDetailPage />);
    const user = userEvent.setup();
    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].groupActions));
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].deleteGroup));
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].deleteGroupCancel));

    expect(mockDeleteGroup).not.toHaveBeenCalled();
    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].groupActions));
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].deleteGroup));
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].deleteGroupConfirm));

    await waitFor(() =>
      expect(mockErrorToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].deleteGroupError, expect.any(Error)),
    );
  });

  it('opens the content report dialog from group actions', async () => {
    await renderWithProviders(<GroupDetailPage />);
    const user = userEvent.setup();
    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].groupActions));
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].reportGroup));

    expect(screen.getByTestId('report-content-details')).toBeOnTheScreen();
  });

  it('loads another statistics page when scrolling near the bottom', async () => {
    const fetchNextPage = jest.fn();
    mockMonthlyStatisticsInfiniteQuery.mockReturnValue({
      data: { pages: [{ items: [], hasMore: true, nextCursor: 'statistics' }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: true,
      fetchNextPage,
    });
    await renderWithProviders(<GroupDetailPage />);
    fireEvent.scroll(screen.getByTestId('group-detail-scroll'), {
      nativeEvent: {
        contentOffset: { y: 600 },
        contentSize: { height: 1000 },
        layoutMeasurement: { height: 500 },
      },
    });

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('loads another members page when scrolling near the bottom', async () => {
    const fetchNextPage = jest.fn();
    mockGetGroup.mockReturnValue({
      data: {
        id: GROUP_FIXTURE.id,
        name: GROUP_FIXTURE.name,
        description: null,
        sports: ['run'],
        privacy: 'open',
        locationName: null,
        createdAt: '2026-10-29T10:00:00.000Z',
        updatedAt: '2026-10-29T10:00:00.000Z',
        memberCount: 1,
        currentMembership: { status: 'active', role: 'member' },
        canManage: false,
        pendingRequestCount: 0,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockGetMembersInfinite.mockReturnValue({
      data: { pages: [{ items: [], hasMore: true, nextCursor: 'members' }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: true,
      fetchNextPage,
    });
    await renderWithProviders(<GroupDetailPage />);
    const user = userEvent.setup();
    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].membersTab));
    fireEvent.scroll(screen.getByTestId('group-detail-scroll'), {
      nativeEvent: {
        contentOffset: { y: 600 },
        contentSize: { height: 1000 },
        layoutMeasurement: { height: 500 },
      },
    });

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('loads another posts page when scrolling near the bottom', async () => {
    const fetchNextPage = jest.fn();
    mockGetPostsInfinite.mockReturnValue({
      data: { pages: [{ items: [], hasMore: true, nextCursor: 'posts' }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: true,
      fetchNextPage,
    });
    await renderWithProviders(<GroupDetailPage />);
    const user = userEvent.setup();
    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].postsTab));
    fireEvent.scroll(screen.getByTestId('group-detail-scroll'), {
      nativeEvent: {
        contentOffset: { y: 600 },
        contentSize: { height: 1000 },
        layoutMeasurement: { height: 500 },
      },
    });

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('loads another events page when scrolling near the bottom', async () => {
    mockRouteParams = { groupId: GROUP_FIXTURE.id, tab: 'events' };
    const fetchNextPage = jest.fn();
    mockGetEventsInfinite.mockReturnValue({
      data: { pages: [{ items: [], hasMore: true, nextCursor: 'events' }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: true,
      fetchNextPage,
    });
    await renderWithProviders(<GroupDetailPage />);
    fireEvent.scroll(screen.getByTestId('group-detail-scroll'), {
      nativeEvent: {
        contentOffset: { y: 600 },
        contentSize: { height: 1000 },
        layoutMeasurement: { height: 500 },
      },
    });

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('does not request another statistics page when one is already loading', async () => {
    const fetchNextPage = jest.fn();
    mockMonthlyStatisticsInfiniteQuery.mockReturnValue({
      data: { pages: [{ items: [], hasMore: true, nextCursor: 'statistics' }] },
      isLoading: false,
      isFetchingNextPage: true,
      hasNextPage: true,
      fetchNextPage,
    });
    await renderWithProviders(<GroupDetailPage />);
    fireEvent.scroll(screen.getByTestId('group-detail-scroll'), {
      nativeEvent: {
        contentOffset: { y: 600 },
        contentSize: { height: 1000 },
        layoutMeasurement: { height: 500 },
      },
    });

    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  it('does not request another page before reaching the scroll threshold', async () => {
    const fetchNextPage = jest.fn();
    mockMonthlyStatisticsInfiniteQuery.mockReturnValue({
      data: { pages: [{ items: [], hasMore: true, nextCursor: 'statistics' }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: true,
      fetchNextPage,
    });
    await renderWithProviders(<GroupDetailPage />);
    fireEvent.scroll(screen.getByTestId('group-detail-scroll'), {
      nativeEvent: {
        contentOffset: { y: 100 },
        contentSize: { height: 1000 },
        layoutMeasurement: { height: 500 },
      },
    });

    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  it('does not join when route parameters have no group id', async () => {
    mockRouteParams = { groupId: [] };
    mockGetGroup.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    await renderWithProviders(<GroupDetailPage />);
    expect(mockGetGroup).toHaveBeenCalledWith('', { skip: true });
    expect(screen.queryByText(GROUPS_COPY[LANGUAGES.english].join)).toBeNull();
    expect(mockJoin).not.toHaveBeenCalled();
  });
});
