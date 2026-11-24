import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { BASE_URL } from '@T/utils/handlers';
import { createMockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { GROUPS_COPY } from '../../const';
import { GROUP_FIXTURE } from '../../test-fixtures';
import GroupDetailHeaderActions from './group-detail-header-actions';
import type { GroupDetails } from '@R/services/groups/types';
import type { AppStore } from '@T/utils/mock-store';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockSuccessToast = jest.fn();
const mockErrorToast = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, replace: mockReplace }) }));
jest.mock('@S/success-toast/success-toast', () => ({
  successToast: (...args: unknown[]) => mockSuccessToast(...args),
}));
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: (...args: unknown[]) => mockErrorToast(...args) }));

const group: GroupDetails = {
  ...GROUP_FIXTURE,
  updatedAt: GROUP_FIXTURE.createdAt,
  privacy: 'closed',
  isOwner: true,
  currentMembership: { status: 'active', role: 'owner', notificationPreference: 'all', feedPreference: 'all' },
  canManage: true,
  pendingRequestCount: 2,
};
let groupStore: AppStore;

describe('GroupDetailHeaderActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    groupStore = createMockStore();
    groupStore.dispatch(changeLanguage(LANGUAGES.english));
  });

  it('shows closed-group requests and deletes a group from its menu', async () => {
    let deletedGroupId: string | undefined;
    server.use(
      http.delete(`${BASE_URL}/groups/${group.id}`, () => {
        deletedGroupId = group.id;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await renderWithProviders(<GroupDetailHeaderActions group={group} isActiveMember />, { store: groupStore });
    const user = userEvent.setup();
    const copy = GROUPS_COPY[LANGUAGES.english];

    expect(screen.getByText(String(group.pendingRequestCount))).toBeOnTheScreen();
    await user.press(screen.getByLabelText(copy.manageRequests));
    await user.press(screen.getByTestId('group-create-content-header-button'));
    await user.press(screen.getByLabelText(copy.groupActions));
    await user.press(screen.getByText(copy.deleteGroup));
    expect(screen.getByText(copy.deleteGroupTitle)).toBeOnTheScreen();
    await user.press(screen.getByTestId('delete-group-confirm-button'));

    await waitFor(() => {
      expect(deletedGroupId).toBe(group.id);
      expect(mockReplace).toHaveBeenCalledWith('/groups');
    });
    expect(mockPush).toHaveBeenCalledWith(`/groups/${group.id}/requests`);
    expect(mockPush).toHaveBeenCalledWith(`/groups/${group.id}/create-content`);
    expect(mockSuccessToast).toHaveBeenCalledWith(copy.groupDeleted);
  });

  it('hides join requests for open groups', async () => {
    await renderWithProviders(<GroupDetailHeaderActions group={{ ...group, privacy: 'open' }} isActiveMember />, {
      store: groupStore,
    });

    expect(screen.queryByLabelText(GROUPS_COPY[LANGUAGES.english].manageRequests)).toBeNull();
  });
});
