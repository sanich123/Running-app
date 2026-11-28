import { afterAll } from '@jest/globals';
import { act, fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import { delay, http, HttpResponse } from 'msw';
import { AppState, Share } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { BASE_URL } from '@T/utils/handlers';
import { createMockStore } from '@T/utils/mock-store';
import { loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { GROUP_CATEGORY_LABELS, GROUPS_COPY } from '../const';
import { GROUP_FIXTURE } from '../test-fixtures';
import GroupDetailPage from './group-detail-page';
import type { AppStore } from '@T/utils/mock-store';

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockFocusCallbacks: (() => void | (() => void))[] = [];
const mockUseFocusEffect = jest.fn((callback: () => void | (() => void)) => {
  mockFocusCallbacks.push(callback);
});
let mockRouteParams: { groupId: string | string[]; tab?: string | string[] } = { groupId: GROUP_FIXTURE.id };
let groupStore: AppStore;
const groupRequestUrls: string[] = [];
const memberRequestUrls: string[] = [];
const statisticsRequestUrls: string[] = [];
const postRequestUrls: string[] = [];
const eventRequestUrls: string[] = [];
const joinRequestIds: string[] = [];
const leaveRequestIds: string[] = [];
const deleteGroupRequestIds: string[] = [];
const mockErrorToast = jest.fn();
const mockSuccessToast = jest.fn();

function trackGroupRequest({ request }: { request: Request }) {
  const url = new URL(request.url);
  const groupPath = `/groups/${GROUP_FIXTURE.id}`;
  if (url.pathname === groupPath && request.method === 'GET') groupRequestUrls.push(url.href);
  if (url.pathname === `${groupPath}/members` && request.method === 'GET') memberRequestUrls.push(url.href);
  if (url.pathname === `${groupPath}/statistics/month` && request.method === 'GET')
    statisticsRequestUrls.push(url.href);
  if (url.pathname === `${groupPath}/posts` && request.method === 'GET') postRequestUrls.push(url.href);
  if (url.pathname === `${groupPath}/events` && request.method === 'GET') eventRequestUrls.push(url.href);
  if (url.pathname === `${groupPath}/join` && request.method === 'POST') joinRequestIds.push(GROUP_FIXTURE.id);
  if (url.pathname === `${groupPath}/membership` && request.method === 'DELETE') leaveRequestIds.push(GROUP_FIXTURE.id);
  if (url.pathname === groupPath && request.method === 'DELETE') deleteGroupRequestIds.push(GROUP_FIXTURE.id);
}

server.events.on('request:start', trackGroupRequest);
afterAll(() => server.events.removeListener('request:start', trackGroupRequest));

jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => void) => mockUseFocusEffect(callback),
  ...require('@T/utils/expo-router-toolbar-mock').createExpoRouterToolbarMock({ renderHeaderRight: true }),
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
describe('GroupDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFocusCallbacks.length = 0;
    mockRouteParams = { groupId: GROUP_FIXTURE.id };
    groupStore = createMockStore();
    groupRequestUrls.length = 0;
    memberRequestUrls.length = 0;
    statisticsRequestUrls.length = 0;
    postRequestUrls.length = 0;
    eventRequestUrls.length = 0;
    joinRequestIds.length = 0;
    leaveRequestIds.length = 0;
    deleteGroupRequestIds.length = 0;
    groupStore.dispatch(changeLanguage(LANGUAGES.english));
  });

  it('lets a visitor join an open group', async () => {
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}`, () =>
        HttpResponse.json({ ...GROUP_FIXTURE, updatedAt: GROUP_FIXTURE.createdAt, currentMembership: null }),
      ),
    );
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');
    expect(screen.getByText(GROUP_FIXTURE.name)).toBeOnTheScreen();
    await fireEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].join));

    await waitFor(() => expect(joinRequestIds).toContain(GROUP_FIXTURE.id));
    expect(await screen.findByText(GROUPS_COPY[LANGUAGES.english].leave)).toBeOnTheScreen();
    expect(screen.queryByText(GROUPS_COPY[LANGUAGES.english].join)).not.toBeOnTheScreen();
  });

  it('shows a pending state for a closed group request', async () => {
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}`, () =>
        HttpResponse.json({
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
        }),
      ),
    );
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');

    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].pending)).toBeDisabled();
    expect(screen.getByText('3 members')).toBeOnTheScreen();
  });

  it('refetches group details whenever the screen receives focus', async () => {
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}`, () =>
        HttpResponse.json({ ...GROUP_FIXTURE, currentMembership: { status: 'pending', role: 'member' } }),
      ),
    );
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');

    await waitFor(() => expect(groupRequestUrls).toHaveLength(1));
    const onFocus = mockFocusCallbacks.at(-2);
    expect(onFocus).toBeDefined();

    onFocus?.();

    await waitFor(() => expect(groupRequestUrls).toHaveLength(2));
  });

  it('sends a join request to a closed group and reports success', async () => {
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}`, () =>
        HttpResponse.json({
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
        }),
      ),
      http.post(`${BASE_URL}/groups/${GROUP_FIXTURE.id}/join`, () =>
        HttpResponse.json({
          ...GROUP_FIXTURE,
          currentMembership: { status: 'pending', role: 'member' },
        }),
      ),
    );
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');
    await userEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].request));

    await waitFor(() => {
      expect(joinRequestIds).toContain(GROUP_FIXTURE.id);
      expect(groupRequestUrls).toHaveLength(2);
      expect(mockSuccessToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].requestSent);
    });
    expect(await screen.findByText(GROUPS_COPY[LANGUAGES.english].pending)).toBeDisabled();
    expect(screen.queryByText(GROUPS_COPY[LANGUAGES.english].groupContentMembersOnly)).toBeNull();
    expect(joinRequestIds).toHaveLength(1);
  });

  it('lets an active member leave a group', async () => {
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}`, () =>
        HttpResponse.json({
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
        }),
      ),
    );

    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');
    await userEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].leave));

    await waitFor(() => expect(leaveRequestIds).toContain(GROUP_FIXTURE.id));
    await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
  });

  it('lets a group manager open join requests and remove a member', async () => {
    let updatedMemberStatus: string | undefined;
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}`, () =>
        HttpResponse.json({
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
        }),
      ),
    );
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}/members`, () =>
        HttpResponse.json(
          {
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
          }.pages[0],
        ),
      ),
    );
    server.use(
      http.patch(`${BASE_URL}/groups/${GROUP_FIXTURE.id}/members/member-1`, async ({ request }) => {
        const body = (await request.json()) as { status: string };
        updatedMemberStatus = body.status;
        return HttpResponse.json({ userId: 'member-1', ...body, role: 'member' });
      }),
    );

    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');
    const user = userEvent.setup();
    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].manageRequests));
    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].membersTitle));
    await user.press(screen.getByTestId('group-member-profile-member-1'));
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].remove));

    expect(mockPush).toHaveBeenCalledWith(`/groups/${GROUP_FIXTURE.id}/requests`);
    expect(mockPush).toHaveBeenCalledWith('/profile/member-1');
    expect(updatedMemberStatus).toBe('removed');
  });

  it('shows empty member and request sections for an open group owner', async () => {
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}`, () =>
        HttpResponse.json({
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
        }),
      ),
    );
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');
    const user = userEvent.setup();
    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].membersTitle));

    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].noMembers)).toBeOnTheScreen();
    expect(screen.queryByText(GROUPS_COPY[LANGUAGES.english].leave)).not.toBeOnTheScreen();
  });

  it('shows a loading state while group details are being fetched', async () => {
    server.use(http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}`, loadingResponse));
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });

    expect(await screen.findByRole('progressbar')).toBeOnTheScreen();
  });

  it('reports an error when joining a group fails', async () => {
    server.use(
      http.post(`${BASE_URL}/groups/${GROUP_FIXTURE.id}/join`, () =>
        HttpResponse.json({ message: 'offline' }, { status: 500 }),
      ),
    );
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}`, () =>
        HttpResponse.json({ ...GROUP_FIXTURE, updatedAt: GROUP_FIXTURE.createdAt, currentMembership: null }),
      ),
    );
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');
    const user = userEvent.setup();

    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].join));

    await waitFor(() =>
      expect(mockErrorToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].saveError, {
        status: 500,
        data: { message: 'offline' },
      }),
    );
  });

  it('reports an error when leaving a group fails', async () => {
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}`, () =>
        HttpResponse.json({
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
        }),
      ),
    );
    server.use(
      http.delete(`${BASE_URL}/groups/${GROUP_FIXTURE.id}/membership`, () =>
        HttpResponse.json({ message: 'offline' }, { status: 500 }),
      ),
    );
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');
    const user = userEvent.setup();
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].leave));

    await waitFor(() =>
      expect(mockErrorToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].saveError, {
        status: 500,
        data: { message: 'offline' },
      }),
    );
  });

  it('shows a retry action after group details fail to load', async () => {
    const user = userEvent.setup();
    let requestCount = 0;
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}`, () => {
        requestCount += 1;
        return requestCount === 1
          ? HttpResponse.json({ message: 'Service unavailable' }, { status: 503 })
          : HttpResponse.json({
              ...GROUP_FIXTURE,
              updatedAt: GROUP_FIXTURE.createdAt,
              currentMembership: { status: 'active', role: 'member' },
            });
      }),
    );
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });

    expect(await screen.findByText('503, Service unavailable')).toBeOnTheScreen();
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].retry));
    expect(await screen.findByText(GROUP_FIXTURE.name)).toBeOnTheScreen();
    await waitFor(() => expect(groupRequestUrls).toHaveLength(2));
  });

  it('shares the group link and displays its photo and type tags', async () => {
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}`, () =>
        HttpResponse.json({
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
        }),
      ),
    );
    const share = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction', activityType: undefined });
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');
    expect(screen.getByText(GROUP_CATEGORY_LABELS.en.team)).toBeOnTheScreen();
    await userEvent.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].groupActions));
    await userEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].share));
    expect(share).toHaveBeenCalledWith({
      title: GROUP_FIXTURE.name,
      message: expect.stringContaining(`/groups/${GROUP_FIXTURE.id}`),
      url: expect.stringContaining(`/groups/${GROUP_FIXTURE.id}`),
    });
    share.mockRestore();
  });

  it('reports a share failure', async () => {
    const share = jest.spyOn(Share, 'share').mockRejectedValue(new Error('share unavailable'));
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');
    const user = userEvent.setup();
    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].groupActions));
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].share));

    await waitFor(() =>
      expect(mockErrorToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].saveError, expect.any(Error)),
    );
    share.mockRestore();
  });

  it('shows the monthly distance leaderboard for visible member activities', async () => {
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}`, () =>
        HttpResponse.json({
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
        }),
      ),
    );
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}/statistics/month`, () =>
        HttpResponse.json(
          {
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
          }.pages[0],
        ),
      ),
    );
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');

    expect(screen.getByText('Fast Runner')).toBeOnTheScreen();
    expect(screen.getByText('12.5 km')).toBeOnTheScreen();
    await userEvent.press(screen.getByTestId('group-member-profile-runner-1'));
    expect(mockPush).toHaveBeenCalledWith('/profile/runner-1');
  });

  it('formats the group statistics and category in Russian', async () => {
    groupStore.dispatch(changeLanguage(LANGUAGES.russian));
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}`, () =>
        HttpResponse.json({
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
        }),
      ),
    );
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');
    const monthLabel = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(new Date());

    expect(screen.getByText(monthLabel)).toBeOnTheScreen();
    expect(screen.getByText(GROUP_CATEGORY_LABELS.ru.team)).toBeOnTheScreen();
  });

  it('offers retry when monthly statistics fail to load', async () => {
    const user = userEvent.setup();
    let requestCount = 0;
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}/statistics/month`, () => {
        requestCount += 1;
        return requestCount === 1
          ? HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 })
          : HttpResponse.json({ items: [], hasMore: false, nextCursor: null });
      }),
    );
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');

    expect(await screen.findByTestId('errorComponentId')).toBeOnTheScreen();
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].retry));
    expect(await screen.findByText(GROUPS_COPY[LANGUAGES.english].noMonthlyStats)).toBeOnTheScreen();
    await waitFor(() => expect(statisticsRequestUrls).toHaveLength(2));
  });

  it('renders the group feed for active members', async () => {
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}`, () =>
        HttpResponse.json({
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
        }),
      ),
    );
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}/posts`, () =>
        HttpResponse.json(
          {
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
          }.pages[0],
        ),
      ),
    );
    const user = userEvent.setup();
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');
    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].postsTab));

    expect(screen.getByText('Long run on Sunday')).toBeOnTheScreen();
    expect(screen.getByText('Alex Runner')).toBeOnTheScreen();
    expect(screen.queryByText(GROUPS_COPY[LANGUAGES.english].posts)).not.toBeOnTheScreen();
    await user.press(screen.getByTestId('group-post-author-post-1'));
    expect(mockPush).toHaveBeenCalledWith('/profile/member-1');
  });

  it('shows pending and unavailable post photos and falls back to the member label', async () => {
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}/posts`, () =>
        HttpResponse.json(
          {
            pages: [
              {
                items: [
                  {
                    id: 'photo-ready',
                    text: 'Photo ready',
                    createdAt: '2026-10-29T10:00:00.000Z',
                    author: {
                      userId: 'member-1',
                      name: 'Alex Runner',
                      profilePhoto: 'https://example.test/avatar.jpg',
                    },
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
                    photoBlurhash: 'pending-post-blurhash',
                    photoReviewStatus: 'processing',
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
          }.pages[0],
        ),
      ),
    );
    const user = userEvent.setup();
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');
    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].postsTab));

    expect(screen.getByText('Photo ready')).toBeOnTheScreen();
    expect(screen.getByTestId('group-post-photo-photo-pending-placeholder')).toBeOnTheScreen();
    expect(screen.getByTestId('group-post-photo-photo-pending-moderation-status')).toBeOnTheScreen();
    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].postPhotoUnavailable)).toBeOnTheScreen();
    expect(screen.getAllByText(GROUPS_COPY[LANGUAGES.english].member)).toHaveLength(2);
  });

  it('shows a loading state for the group feed', async () => {
    server.use(http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}/posts`, loadingResponse));
    const user = userEvent.setup();
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');
    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].postsTab));

    expect(screen.getByRole('progressbar')).toBeOnTheScreen();
  });

  it('shows an error state when the group feed cannot load', async () => {
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}/posts`, () =>
        HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }),
      ),
    );
    const user = userEvent.setup();
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');
    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].postsTab));

    expect(screen.getByText('500, Internal Server Error')).toBeOnTheScreen();
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].retry));
    await waitFor(() => expect(postRequestUrls).toHaveLength(2));
  });

  it('opens the group post and event composer from the header', async () => {
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}`, () =>
        HttpResponse.json({
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
        }),
      ),
    );
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');

    const createButton = screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].createContent);
    await userEvent.press(createButton);

    expect(mockPush).toHaveBeenCalledWith(`/groups/${GROUP_FIXTURE.id}/create-content`);
  });

  it('loads events for the selected period', async () => {
    mockRouteParams = { groupId: [GROUP_FIXTURE.id], tab: ['events'] };
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}/events`, () =>
        HttpResponse.json(
          {
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
          }.pages[0],
        ),
      ),
    );
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');

    expect(screen.getByText('Sunday long run')).toBeOnTheScreen();
    const user = userEvent.setup();
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].pastEvents));
    await waitFor(() =>
      expect(eventRequestUrls.some((url) => new URL(url).searchParams.get('period') === 'past')).toBe(true),
    );
  });

  it('starts photo moderation polling and clears it when leaving the page', async () => {
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}`, () =>
        HttpResponse.json({
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
        }),
      ),
    );
    const originalAppState = AppState.currentState;
    Object.defineProperty(AppState, 'currentState', { configurable: true, value: 'active' });
    const originalSetInterval = globalThis.setInterval;
    const intervalId = originalSetInterval(() => undefined, 60_000);
    globalThis.clearInterval(intervalId);
    let pollingCallback: (() => void) | undefined;
    const setIntervalSpy = jest.spyOn(globalThis, 'setInterval').mockImplementation((callback, delay, ...args) => {
      if (delay === 8000) {
        pollingCallback = callback as () => void;
        return intervalId;
      }

      return originalSetInterval(callback, delay, ...args);
    });
    const clearIntervalSpy = jest.spyOn(globalThis, 'clearInterval');
    try {
      const { unmount } = await renderWithProviders(<GroupDetailPage />, { store: groupStore });
      await screen.findByTestId('group-detail-photo');
      expect(screen.getByTestId('group-detail-photo-moderation-status')).toBeOnTheScreen();
      const onFocus = mockFocusCallbacks.at(-1);
      expect(onFocus).toBeDefined();
      let onBlur: (() => void) | undefined;
      await act(async () => {
        onBlur = onFocus?.() ?? undefined;
      });
      expect(pollingCallback).toBeDefined();
      await act(async () => pollingCallback?.());
      await waitFor(() => expect(groupRequestUrls).toHaveLength(2));
      await act(async () => {
        onBlur?.();
        unmount();
      });
      expect(clearIntervalSpy).toHaveBeenCalledWith(intervalId);
      expect(groupRequestUrls).toHaveLength(2);
    } finally {
      setIntervalSpy.mockRestore();
      clearIntervalSpy.mockRestore();
      Object.defineProperty(AppState, 'currentState', { configurable: true, value: originalAppState });
    }
  });

  it('shows owner request controls and deletes the group after confirmation', async () => {
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}`, () =>
        HttpResponse.json({
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
        }),
      ),
    );
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');

    expect(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].manageRequests)).toBeOnTheScreen();
    expect(screen.getByText('4')).toBeOnTheScreen();
    const user = userEvent.setup();
    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].groupActions));
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].deleteGroup));
    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].deleteGroupTitle)).toBeOnTheScreen();
    await user.press(screen.getByTestId('delete-group-confirm-button'));

    await waitFor(() => expect(deleteGroupRequestIds).toContain(GROUP_FIXTURE.id));
    expect(mockSuccessToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].groupDeleted);
    expect(mockPush).toHaveBeenCalledWith('/groups');
  });

  it('does not show join request controls for an open group', async () => {
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}`, () =>
        HttpResponse.json({
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
        }),
      ),
    );
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');

    expect(screen.queryByTestId('group-requests-header-button')).toBeNull();
  });

  it('lets the owner cancel deletion and reports a failed deletion', async () => {
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}`, () =>
        HttpResponse.json({
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
        }),
      ),
    );
    server.use(
      http.delete(`${BASE_URL}/groups/${GROUP_FIXTURE.id}`, () =>
        HttpResponse.json({ message: 'offline' }, { status: 500 }),
      ),
    );
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');
    const user = userEvent.setup();
    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].groupActions));
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].deleteGroup));
    await user.press(screen.getByTestId('delete-group-cancel-button'));

    expect(deleteGroupRequestIds).toHaveLength(0);
    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].groupActions));
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].deleteGroup));
    await user.press(screen.getByTestId('delete-group-confirm-button'));

    await waitFor(() =>
      expect(mockErrorToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].deleteGroupError, {
        status: 500,
        data: { message: 'offline' },
      }),
    );
  });

  it('opens the content report dialog from group actions', async () => {
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');
    const user = userEvent.setup();
    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].groupActions));
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].reportGroup));

    expect(screen.getByTestId('report-content-details')).toBeOnTheScreen();
  });

  it('loads another statistics page when scrolling near the bottom', async () => {
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}/statistics/month`, ({ request }) => {
        const cursor = new URL(request.url).searchParams.get('cursor');
        return HttpResponse.json(
          cursor
            ? {
                year: 2026,
                month: 10,
                timeZone: 'UTC',
                items: [
                  {
                    userId: 'statistics-runner',
                    profile: { name: 'Statistics Runner', surname: null, city: null, profilePhoto: null },
                    totalDistance: 5200,
                  },
                ],
                hasMore: false,
                nextCursor: null,
              }
            : { year: 2026, month: 10, timeZone: 'UTC', items: [], hasMore: true, nextCursor: 'statistics' },
        );
      }),
    );
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');
    await screen.findByText(GROUPS_COPY[LANGUAGES.english].noMonthlyStats);
    await act(async () => {
      fireEvent.scroll(screen.getByTestId('group-detail-scroll'), {
        nativeEvent: {
          contentOffset: { y: 600 },
          contentSize: { height: 1000 },
          layoutMeasurement: { height: 500 },
        },
      });
    });

    expect(await screen.findByText('Statistics Runner')).toBeOnTheScreen();
    expect(statisticsRequestUrls.some((url) => new URL(url).searchParams.get('cursor') === 'statistics')).toBe(true);
  });

  it('loads another members page when scrolling near the bottom', async () => {
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}`, () =>
        HttpResponse.json({
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
        }),
      ),
    );
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}/members`, ({ request }) => {
        const cursor = new URL(request.url).searchParams.get('cursor');
        return HttpResponse.json(
          cursor
            ? {
                items: [
                  {
                    userId: 'paginated-member',
                    role: 'member',
                    status: 'active',
                    joinedAt: null,
                    profile: { name: 'Paginated Member', surname: null, city: null, profilePhoto: null },
                  },
                ],
                hasMore: false,
                nextCursor: null,
              }
            : { items: [], hasMore: true, nextCursor: 'members' },
        );
      }),
    );
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');
    const user = userEvent.setup();
    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].membersTab));
    await screen.findByText(GROUPS_COPY[LANGUAGES.english].noMembers);
    await act(async () => {
      fireEvent.scroll(screen.getByTestId('group-detail-scroll'), {
        nativeEvent: {
          contentOffset: { y: 600 },
          contentSize: { height: 1000 },
          layoutMeasurement: { height: 500 },
        },
      });
    });

    expect(await screen.findByText('Paginated Member')).toBeOnTheScreen();
    expect(memberRequestUrls.some((url) => new URL(url).searchParams.get('cursor') === 'members')).toBe(true);
  });

  it('loads another posts page when scrolling near the bottom', async () => {
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}/posts`, ({ request }) => {
        const cursor = new URL(request.url).searchParams.get('cursor');
        return HttpResponse.json(
          cursor
            ? {
                items: [
                  {
                    id: 'paginated-post',
                    text: 'Paginated group post',
                    createdAt: '2026-11-01T10:00:00.000Z',
                    author: { userId: 'post-author', name: 'Post Author', profilePhoto: null },
                    photoUrl: null,
                    hasMore: false,
                    nextCursor: null,
                  },
                ],
                hasMore: false,
                nextCursor: null,
              }
            : { items: [], hasMore: true, nextCursor: 'posts' },
        );
      }),
    );
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');
    const user = userEvent.setup();
    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].postsTab));
    await screen.findByText(GROUPS_COPY[LANGUAGES.english].noPosts);
    await act(async () => {
      fireEvent.scroll(screen.getByTestId('group-detail-scroll'), {
        nativeEvent: {
          contentOffset: { y: 600 },
          contentSize: { height: 1000 },
          layoutMeasurement: { height: 500 },
        },
      });
    });

    expect(await screen.findByText('Paginated group post')).toBeOnTheScreen();
    expect(postRequestUrls.some((url) => new URL(url).searchParams.get('cursor') === 'posts')).toBe(true);
  });

  it('loads another events page when scrolling near the bottom', async () => {
    mockRouteParams = { groupId: GROUP_FIXTURE.id, tab: 'events' };
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}/events`, ({ request }) => {
        const cursor = new URL(request.url).searchParams.get('cursor');
        return HttpResponse.json(
          cursor
            ? {
                items: [
                  {
                    id: 'paginated-event',
                    title: 'Paginated group event',
                    description: null,
                    locationName: null,
                    sport: null,
                    distanceKm: null,
                    startsAt: '2026-11-15T10:00:00.000Z',
                    createdAt: '2026-11-01T10:00:00.000Z',
                  },
                ],
                hasMore: false,
                nextCursor: null,
              }
            : { items: [], hasMore: true, nextCursor: 'events' },
        );
      }),
    );
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');
    await screen.findByText(GROUPS_COPY[LANGUAGES.english].noUpcomingEvents);
    await act(async () => {
      fireEvent.scroll(screen.getByTestId('group-detail-scroll'), {
        nativeEvent: {
          contentOffset: { y: 600 },
          contentSize: { height: 1000 },
          layoutMeasurement: { height: 500 },
        },
      });
    });

    expect(await screen.findByText('Paginated group event')).toBeOnTheScreen();
    expect(eventRequestUrls.some((url) => new URL(url).searchParams.get('cursor') === 'events')).toBe(true);
  });

  it('does not request another statistics page when one is already loading', async () => {
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}/statistics/month`, async ({ request }) => {
        const cursor = new URL(request.url).searchParams.get('cursor');
        if (cursor) await delay(100);
        return HttpResponse.json(
          cursor
            ? {
                year: 2026,
                month: 10,
                timeZone: 'UTC',
                items: [
                  {
                    userId: 'loading-statistics-runner',
                    profile: { name: 'Loading Statistics Runner', surname: null, city: null, profilePhoto: null },
                    totalDistance: 5200,
                  },
                ],
                hasMore: false,
                nextCursor: null,
              }
            : { year: 2026, month: 10, timeZone: 'UTC', items: [], hasMore: true, nextCursor: 'statistics' },
        );
      }),
    );
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');
    await screen.findByText(GROUPS_COPY[LANGUAGES.english].noMonthlyStats);
    await act(async () => {
      fireEvent.scroll(screen.getByTestId('group-detail-scroll'), {
        nativeEvent: {
          contentOffset: { y: 600 },
          contentSize: { height: 1000 },
          layoutMeasurement: { height: 500 },
        },
      });
    });

    await waitFor(() => expect(statisticsRequestUrls).toHaveLength(2));
    await act(async () => {
      fireEvent.scroll(screen.getByTestId('group-detail-scroll'), {
        nativeEvent: {
          contentOffset: { y: 600 },
          contentSize: { height: 1000 },
          layoutMeasurement: { height: 500 },
        },
      });
    });
    expect(await screen.findByText('Loading Statistics Runner')).toBeOnTheScreen();
    expect(statisticsRequestUrls).toHaveLength(2);
  });

  it('does not request another page before reaching the scroll threshold', async () => {
    server.use(
      http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}/statistics/month`, () =>
        HttpResponse.json({ pages: [{ items: [], hasMore: true, nextCursor: 'statistics' }] }.pages[0]),
      ),
    );
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    await screen.findByTestId('group-detail-photo');
    await screen.findByText(GROUPS_COPY[LANGUAGES.english].noMonthlyStats);
    await act(async () => {
      fireEvent.scroll(screen.getByTestId('group-detail-scroll'), {
        nativeEvent: {
          contentOffset: { y: 100 },
          contentSize: { height: 1000 },
          layoutMeasurement: { height: 500 },
        },
      });
    });

    expect(statisticsRequestUrls).toHaveLength(1);
  });

  it('does not join when route parameters have no group id', async () => {
    mockRouteParams = { groupId: [] };
    server.use(http.get(`${BASE_URL}/groups/${GROUP_FIXTURE.id}`, () => HttpResponse.json(null)));
    await renderWithProviders(<GroupDetailPage />, { store: groupStore });
    expect(groupRequestUrls).toHaveLength(0);
    expect(screen.queryByText(GROUPS_COPY[LANGUAGES.english].join)).toBeNull();
    expect(joinRequestIds).toHaveLength(0);
  });
});
