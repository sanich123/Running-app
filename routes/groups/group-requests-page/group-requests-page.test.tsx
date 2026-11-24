import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { BASE_URL } from '@T/utils/handlers';
import { createMockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { GROUPS_COPY } from '../const';
import GroupRequestsPage from './group-requests-page';

const mockErrorToast = jest.fn();
const groupRequests: string[] = [];
const memberRequests: string[] = [];
const updateRequests: { userId: string; body: Record<string, unknown> }[] = [];
let groupRequestError = false;
let updateRequestError = false;
let testStore: ReturnType<typeof createMockStore>;

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useLocalSearchParams: () => ({ groupId: 'group-1' }),
}));
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: (...args: unknown[]) => mockErrorToast(...args) }));
describe('GroupRequestsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    testStore = createMockStore();
    groupRequests.length = 0;
    memberRequests.length = 0;
    updateRequests.length = 0;
    groupRequestError = false;
    updateRequestError = false;
    server.use(
      http.get(`${BASE_URL}/groups/group-1`, () => {
        groupRequests.push('GET /groups/group-1');
        return groupRequestError
          ? HttpResponse.json({ message: 'group unavailable' }, { status: 503 })
          : HttpResponse.json({
              id: 'group-1',
              name: 'Saturday runners',
              createdByUserId: 'owner-1',
              isOwner: true,
              canManage: true,
              privacy: 'open',
              sports: ['run'],
              memberCount: 1,
              currentMembership: null,
            });
      }),
      http.get(`${BASE_URL}/groups/group-1/members`, () => {
        memberRequests.push('GET /groups/group-1/members');
        return HttpResponse.json([
          {
            userId: 'pending-1',
            role: 'member',
            status: 'pending',
            joinedAt: null,
            profile: { name: 'Jordan', surname: 'Hill', city: null, profilePhoto: null },
          },
        ]);
      }),
      http.patch(`${BASE_URL}/groups/group-1/members/:userId`, async ({ params, request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        updateRequests.push({ userId: String(params.userId), body });
        return updateRequestError
          ? HttpResponse.json({ message: 'offline' }, { status: 500 })
          : HttpResponse.json({ userId: params.userId, ...body, role: 'member' });
      }),
    );
    testStore.dispatch(changeLanguage(LANGUAGES.english));
    testStore.dispatch(setMockUserId('owner-1'));
  });

  async function renderLoadedPage() {
    await renderWithProviders(<GroupRequestsPage />, { store: testStore });
    await waitFor(() => {
      expect(groupRequests).toHaveLength(1);
      if (!groupRequestError) expect(memberRequests).toHaveLength(1);
    });
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeOnTheScreen());
  }

  it('loads pending join requests and lets a manager approve or decline them', async () => {
    await renderLoadedPage();

    expect(screen.getByText('Saturday runners')).toBeOnTheScreen();
    expect(screen.getByText('Jordan Hill')).toBeOnTheScreen();
    expect(memberRequests).toContain('GET /groups/group-1/members');

    const user = userEvent.setup();
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].approve));
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].decline));

    await waitFor(() =>
      expect(updateRequests).toEqual([
        { userId: 'pending-1', body: { status: 'active' } },
        { userId: 'pending-1', body: { status: 'rejected' } },
      ]),
    );
  });

  it('shows a retry action when group access cannot be loaded', async () => {
    groupRequestError = true;
    await renderLoadedPage();

    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].loadError)).toBeOnTheScreen();
    await userEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].retry));
    await waitFor(() => expect(groupRequests).toHaveLength(2));
    expect(memberRequests).toEqual([]);
  });

  it('reports an approval failure', async () => {
    updateRequestError = true;
    await renderLoadedPage();
    await userEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].approve));

    await waitFor(() =>
      expect(mockErrorToast).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ status: 500 })),
    );
  });
});
