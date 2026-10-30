import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import { Share } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupDetailPage from './group-detail-page';

const mockBack = jest.fn();
const mockGetGroup = jest.fn();
const mockGetMembers = jest.fn();
const mockJoinMutation = jest.fn();
const mockLeaveMutation = jest.fn();
const mockUpdateMutation = jest.fn();
const mockMonthlyStatisticsQuery = jest.fn();
const mockPreferencesMutation = jest.fn();
const mockGetPosts = jest.fn();
const mockCreatePostMutation = jest.fn();
const mockJoin = jest.fn();
const mockLeave = jest.fn();
const mockUpdate = jest.fn();
const mockUpdatePreferences = jest.fn();
const mockCreatePost = jest.fn();
const mockErrorToast = jest.fn();
const mockSuccessToast = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ groupId: 'group-1' }),
  useRouter: () => ({ back: mockBack }),
}));
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: (...args: unknown[]) => mockErrorToast(...args) }));
jest.mock('@S/success-toast/success-toast', () => ({
  successToast: (...args: unknown[]) => mockSuccessToast(...args),
}));
jest.mock('@R/services/groups/groups', () => ({
  useGetGroupByIdQuery: (...args: unknown[]) => mockGetGroup(...args),
  useGetGroupMembersQuery: (...args: unknown[]) => mockGetMembers(...args),
  useGetGroupMonthlyStatisticsQuery: (...args: unknown[]) => mockMonthlyStatisticsQuery(...args),
  useGetGroupPostsQuery: (...args: unknown[]) => mockGetPosts(...args),
  useJoinGroupMutation: () => mockJoinMutation(),
  useLeaveGroupMutation: () => mockLeaveMutation(),
  useUpdateGroupMemberMutation: () => mockUpdateMutation(),
  useUpdateGroupPreferencesMutation: () => mockPreferencesMutation(),
  useCreateGroupPostMutation: () => mockCreatePostMutation(),
}));

describe('GroupDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockGetGroup.mockReturnValue({
      data: {
        id: 'group-1',
        name: 'Saturday runners',
        description: 'Morning runs together',
        sports: ['run'],
        privacy: 'open',
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
    mockGetMembers.mockReturnValue({ data: [], isLoading: false });
    mockMonthlyStatisticsQuery.mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockGetPosts.mockReturnValue({ data: [], isLoading: false, isError: false });
    mockJoin.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
    mockJoinMutation.mockReturnValue([mockJoin, { isLoading: false }]);
    mockLeave.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
    mockUpdate.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
    mockUpdatePreferences.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
    mockCreatePost.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ id: 'post-1' }) });
    mockLeaveMutation.mockReturnValue([mockLeave, { isLoading: false }]);
    mockUpdateMutation.mockReturnValue([mockUpdate, { isLoading: false }]);
    mockPreferencesMutation.mockReturnValue([mockUpdatePreferences, { isLoading: false }]);
    mockCreatePostMutation.mockReturnValue([mockCreatePost, { isLoading: false }]);
  });

  it('lets a visitor join an open group', async () => {
    await renderWithProviders(<GroupDetailPage />);
    expect(screen.getByText('Saturday runners')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Join group'));

    expect(mockJoin).toHaveBeenCalledWith('group-1');
  });

  it('shows a pending state for a closed group request', async () => {
    mockGetGroup.mockReturnValue({
      data: {
        id: 'group-1',
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

    expect(screen.getByText('Request pending')).toBeDisabled();
    expect(screen.queryByText('Members · 3')).not.toBeOnTheScreen();
  });

  it('sends a join request to a closed group and reports success', async () => {
    mockGetGroup.mockReturnValue({
      data: {
        id: 'group-1',
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
    fireEvent.press(screen.getByText('Request to join'));

    await waitFor(() => expect(mockJoin).toHaveBeenCalledWith('group-1'));
    expect(mockSuccessToast).toHaveBeenCalledWith('Your request was sent');
  });

  it('lets an active member leave a group', async () => {
    mockGetGroup.mockReturnValue({
      data: {
        id: 'group-1',
        name: 'Saturday runners',
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

    await waitFor(() => expect(mockLeave).toHaveBeenCalledWith('group-1'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('lets admins process requests and remove members', async () => {
    mockGetGroup.mockReturnValue({
      data: {
        id: 'group-1',
        name: 'Saturday runners',
        description: 'Morning runs',
        sports: ['run'],
        privacy: 'closed',
        locationName: 'Moscow',
        createdAt: '2026-10-29T10:00:00.000Z',
        updatedAt: '2026-10-29T10:00:00.000Z',
        memberCount: 2,
        currentMembership: { status: 'active', role: 'owner' },
        canManage: true,
        pendingRequestCount: 1,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockGetMembers.mockImplementation(({ status }: { status: string }) => ({
      data: [
        {
          userId: status === 'pending' ? 'request-1' : 'member-1',
          role: 'member',
          status,
          joinedAt: null,
          profile: {
            name: status === 'pending' ? 'Requester' : 'Member',
            surname: null,
            city: null,
            profilePhoto: null,
          },
        },
      ],
    }));

    await renderWithProviders(<GroupDetailPage />);
    const user = userEvent.setup();
    await user.press(screen.getByText('Approve'));
    await user.press(screen.getByText('Decline'));
    await user.press(screen.getByText('Remove'));

    expect(mockUpdate).toHaveBeenCalledWith({ groupId: 'group-1', userId: 'request-1', status: 'active' });
    expect(mockUpdate).toHaveBeenCalledWith({ groupId: 'group-1', userId: 'request-1', status: 'rejected' });
    expect(mockUpdate).toHaveBeenCalledWith({ groupId: 'group-1', userId: 'member-1', status: 'removed' });
  });

  it('shows empty member and request sections for an open group owner', async () => {
    mockGetGroup.mockReturnValue({
      data: {
        id: 'group-1',
        name: 'New club',
        description: null,
        sports: [],
        privacy: 'open',
        locationName: null,
        createdAt: '2026-10-29T10:00:00.000Z',
        updatedAt: '2026-10-29T10:00:00.000Z',
        memberCount: 1,
        currentMembership: { status: 'active', role: 'owner' },
        canManage: true,
        pendingRequestCount: 0,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockGetMembers.mockReturnValue({ data: [] });

    await renderWithProviders(<GroupDetailPage />);

    expect(screen.getByText('No new requests.')).toBeOnTheScreen();
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
    await renderWithProviders(<GroupDetailPage />);
    const user = userEvent.setup();

    await user.press(screen.getByText('Join group'));

    await waitFor(() => expect(mockErrorToast).toHaveBeenCalledWith('Could not save changes', expect.any(Error)));
  });

  it('shows a retry action after group details fail to load', async () => {
    const refetch = jest.fn();
    mockGetGroup.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch });
    await renderWithProviders(<GroupDetailPage />);

    expect(await screen.findByText('Could not load groups')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Retry'));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('shares the group link and displays its photo and type tags', async () => {
    mockGetGroup.mockReturnValue({
      data: {
        id: 'group-1',
        name: 'Saturday runners',
        description: null,
        sports: ['run'],
        categoryTags: ['team'],
        photoUrl: 'https://example.test/group.jpg',
        privacy: 'open',
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
    const share = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction', activityType: undefined });
    await renderWithProviders(<GroupDetailPage />);
    expect(screen.getByText('Team')).toBeOnTheScreen();
    await userEvent.press(screen.getByText('Share group'));
    expect(share).toHaveBeenCalledWith({
      title: 'Saturday runners',
      message: expect.stringContaining('/groups/group-1'),
      url: expect.stringContaining('/groups/group-1'),
    });
    share.mockRestore();
  });

  it('shows the monthly distance leaderboard for visible member activities', async () => {
    mockGetGroup.mockReturnValue({
      data: {
        id: 'group-1',
        name: 'Saturday runners',
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
    mockMonthlyStatisticsQuery.mockReturnValue({
      data: {
        items: [
          {
            userId: 'runner-1',
            profile: { name: 'Fast', surname: 'Runner', city: null, profilePhoto: null },
            totalDistance: 12500,
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    await renderWithProviders(<GroupDetailPage />);

    expect(screen.getByText('Member distance this month')).toBeOnTheScreen();
    expect(screen.getByText('Fast Runner')).toBeOnTheScreen();
    expect(screen.getByText('12.5 km')).toBeOnTheScreen();
  });

  it('saves notification and home-feed preferences for an active member', async () => {
    mockGetGroup.mockReturnValue({
      data: {
        id: 'group-1',
        name: 'Saturday runners',
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

    await user.press(screen.getByText('Announcements only'));
    await user.press(screen.getByText('Admin posts only'));

    expect(mockUpdatePreferences).toHaveBeenNthCalledWith(1, {
      groupId: 'group-1',
      notificationPreference: 'announcements',
      feedPreference: 'all',
    });
    expect(mockUpdatePreferences).toHaveBeenNthCalledWith(2, {
      groupId: 'group-1',
      notificationPreference: 'all',
      feedPreference: 'admins',
    });
  });

  it('publishes a post and renders the group feed for active members', async () => {
    mockGetGroup.mockReturnValue({
      data: {
        id: 'group-1',
        name: 'Saturday runners',
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
    mockGetPosts.mockReturnValue({
      data: [
        {
          id: 'post-1',
          text: 'Long run on Sunday',
          createdAt: '2026-10-29T10:00:00.000Z',
          author: { userId: 'member-1', name: 'Alex Runner', profilePhoto: null },
          photoUrl: null,
        },
      ],
      isError: false,
    });
    const user = userEvent.setup();
    await renderWithProviders(<GroupDetailPage />);
    await user.type(screen.getByTestId('group-post-input'), 'Sunday route is ready');
    await user.press(screen.getByTestId('group-post-submit'));

    expect(screen.getByText('Long run on Sunday')).toBeOnTheScreen();
    expect(screen.getByText('Alex Runner')).toBeOnTheScreen();
    expect(mockCreatePost).toHaveBeenCalledWith({ groupId: 'group-1', text: 'Sunday route is ready' });
  });
});
