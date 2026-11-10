import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { Keyboard } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { BASE_URL } from '@T/utils/handlers';
import { createMockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import EditGroupPage from './edit-group-page';
import { GROUPS_COPY } from '../const';
import type { GroupDetails } from '@R/services/groups/types';

const mockReplace = jest.fn();
const mockErrorToast = jest.fn();
const mockSuccessToast = jest.fn();

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useLocalSearchParams: () => ({ groupId: 'group-1' }),
  useRouter: () => ({ replace: mockReplace }),
}));
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: (...args: unknown[]) => mockErrorToast(...args) }));
jest.mock('@S/success-toast/success-toast', () => ({
  successToast: (...args: unknown[]) => mockSuccessToast(...args),
}));
const group: GroupDetails = {
  id: 'group-1',
  name: 'Saturday runners',
  description: 'Morning runs',
  sports: ['run'],
  categoryTags: ['team'],
  photoUrl: null,
  photoPreviewUrl: null,
  photoBlurhash: null,
  photoReviewStatus: null,
  photoPending: false,
  privacy: 'open',
  locationName: 'Moscow',
  createdAt: '2026-10-29T10:00:00.000Z',
  updatedAt: '2026-10-29T10:00:00.000Z',
  createdByUserId: 'owner-1',
  isOwner: true,
  memberCount: 3,
  currentMembership: null,
  canManage: true,
  pendingRequestCount: 0,
};

let groupResponse: GroupDetails = group;
let groupRequestError = false;
let updateRequestError = false;
const groupRequests: string[] = [];
const updateRequests: Record<string, unknown>[] = [];
let testStore: ReturnType<typeof createMockStore>;

describe('EditGroupPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    testStore = createMockStore();
    groupResponse = group;
    groupRequestError = false;
    updateRequestError = false;
    groupRequests.length = 0;
    updateRequests.length = 0;
    server.use(
      http.get(`${BASE_URL}/groups/group-1`, () => {
        groupRequests.push('group-1');
        return groupRequestError
          ? HttpResponse.json({ message: 'group unavailable' }, { status: 503 })
          : HttpResponse.json(groupResponse);
      }),
      http.patch(`${BASE_URL}/groups/group-1`, async ({ request }) => {
        updateRequests.push((await request.json()) as Record<string, unknown>);
        return updateRequestError
          ? HttpResponse.json({ message: 'offline' }, { status: 500 })
          : HttpResponse.json(groupResponse);
      }),
    );
    jest.spyOn(Keyboard, 'addListener').mockImplementation(() => ({ remove: jest.fn() }) as never);
    testStore.dispatch(changeLanguage(LANGUAGES.english));
  });

  async function renderLoadedPage() {
    await renderWithProviders(<EditGroupPage />, { store: testStore });
    await waitFor(() => {
      expect(groupRequests).toHaveLength(1);
    });
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeOnTheScreen());
  }

  it('saves the owner changes and returns to the group', async () => {
    await renderLoadedPage();
    expect(screen.queryByTestId('group-category-selector')).not.toBeOnTheScreen();
    await userEvent.press(screen.getByTestId('edit-group-submit'));

    await waitFor(() => expect(updateRequests).toHaveLength(1));
    expect(updateRequests[0]).toEqual({
      name: 'Saturday runners',
      description: 'Morning runs',
      sports: ['run'],
      categoryTags: ['team'],
      privacy: 'open',
      locationName: 'Moscow',
    });
    expect(mockSuccessToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].groupUpdated);
    expect(mockReplace).toHaveBeenCalledWith('/groups/group-1');
  });

  it('saves a worldwide group without a location name', async () => {
    await renderLoadedPage();
    const user = userEvent.setup();
    await user.press(screen.getByTestId('group-worldwide-toggle'));
    await user.press(screen.getByTestId('edit-group-submit'));

    await waitFor(() => expect(updateRequests[0]).toEqual(expect.objectContaining({ locationName: null })));
  });

  it('requires at least one sport before saving', async () => {
    groupResponse = { ...group, sports: [] };
    await renderLoadedPage();
    fireEvent.press(screen.getByTestId('edit-group-submit'));

    expect(mockErrorToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].chooseSport);
    expect(updateRequests).toHaveLength(0);
  });

  it('reports an error when group updates fail', async () => {
    updateRequestError = true;
    await renderLoadedPage();
    await userEvent.press(screen.getByTestId('edit-group-submit'));

    await waitFor(() =>
      expect(mockErrorToast).toHaveBeenCalledWith(
        GROUPS_COPY[LANGUAGES.english].saveError,
        expect.objectContaining({ status: 500 }),
      ),
    );
  });

  it('keeps non-owners out of the edit form', async () => {
    groupResponse = { ...group, isOwner: false, createdByUserId: 'another-user' };
    await renderLoadedPage();

    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].ownerOnlyEdit)).toBeOnTheScreen();
    fireEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].deleteGroupCancel));
    expect(mockReplace).toHaveBeenCalledWith('/groups/group-1');
    expect(screen.queryByTestId('edit-group-submit')).not.toBeOnTheScreen();
  });

  it('requires a valid group name before saving', async () => {
    await renderLoadedPage();
    const user = userEvent.setup();
    await user.clear(screen.getByTestId('group-name-input'));
    await user.type(screen.getByTestId('group-name-input'), 'A');
    await user.press(screen.getByTestId('edit-group-submit'));

    expect(mockErrorToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].nameRequired);
    expect(updateRequests).toHaveLength(0);
  });

  it('offers retry when group details fail to load', async () => {
    groupRequestError = true;
    await renderLoadedPage();
    await userEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].retry));

    await waitFor(() => expect(groupRequests).toHaveLength(2));
  });
});
