import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupDetailHeaderActions from './group-detail-header-actions';
import { GROUPS_COPY } from '../../const';
import { GROUP_FIXTURE } from '../../test-fixtures';
import type { GroupDetails } from '@R/services/groups/types';

const mockDeleteGroup = jest.fn();
const mockDeleteMutation = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockSuccessToast = jest.fn();
const mockErrorToast = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, replace: mockReplace }) }));
jest.mock('@R/services/groups/groups', () => ({ useDeleteGroupMutation: () => mockDeleteMutation() }));
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

describe('GroupDetailHeaderActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockDeleteGroup.mockReturnValue({ unwrap: jest.fn().mockResolvedValue(undefined) });
    mockDeleteMutation.mockReturnValue([mockDeleteGroup, { isLoading: false }]);
  });

  it('shows closed-group requests and deletes a group from its menu', async () => {
    await renderWithProviders(<GroupDetailHeaderActions group={group} isActiveMember />);
    const user = userEvent.setup();
    const copy = GROUPS_COPY[LANGUAGES.english];

    expect(screen.getByText(String(group.pendingRequestCount))).toBeOnTheScreen();
    await user.press(screen.getByLabelText(copy.manageRequests));
    await user.press(screen.getByTestId('group-create-content-header-button'));
    await user.press(screen.getByLabelText(copy.groupActions));
    await user.press(screen.getByText(copy.deleteGroup));
    expect(screen.getByText(copy.deleteGroupTitle)).toBeOnTheScreen();
    await user.press(screen.getByText(copy.deleteGroupConfirm));

    await waitFor(() => {
      expect(mockDeleteGroup).toHaveBeenCalledWith(group.id);
      expect(mockReplace).toHaveBeenCalledWith('/groups');
    });
    expect(mockPush).toHaveBeenCalledWith(`/groups/${group.id}/requests`);
    expect(mockPush).toHaveBeenCalledWith(`/groups/${group.id}/create-content`);
    expect(mockSuccessToast).toHaveBeenCalledWith(copy.groupDeleted);
  });

  it('hides join requests for open groups', async () => {
    await renderWithProviders(<GroupDetailHeaderActions group={{ ...group, privacy: 'open' }} isActiveMember />);

    expect(screen.queryByLabelText(GROUPS_COPY[LANGUAGES.english].manageRequests)).toBeNull();
  });
});
