import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupRequestsPage from './group-requests-page';
import { GROUPS_COPY } from '../const';

const mockGetGroup = jest.fn();
const mockGetMembers = jest.fn();
const mockUpdateMember = jest.fn();
const mockRefetch = jest.fn();
const mockErrorToast = jest.fn();

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useLocalSearchParams: () => ({ groupId: 'group-1' }),
}));
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: (...args: unknown[]) => mockErrorToast(...args) }));
jest.mock('@R/services/groups/groups', () => ({
  useGetGroupByIdQuery: (...args: unknown[]) => mockGetGroup(...args),
  useGetGroupMembersQuery: (...args: unknown[]) => mockGetMembers(...args),
  useUpdateGroupMemberMutation: () => [mockUpdateMember, { isLoading: false }],
}));

describe('GroupRequestsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockGetGroup.mockReturnValue({
      data: {
        id: 'group-1',
        name: 'Saturday runners',
        isOwner: true,
        canManage: true,
        createdByUserId: 'owner-1',
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });
    mockGetMembers.mockReturnValue({
      data: [
        {
          userId: 'pending-1',
          role: 'member',
          status: 'pending',
          joinedAt: null,
          profile: { name: 'Jordan', surname: 'Hill', city: null, profilePhoto: null },
        },
      ],
      isLoading: false,
    });
    mockUpdateMember.mockReturnValue({ unwrap: jest.fn().mockResolvedValue(undefined) });
  });

  it('loads pending join requests and lets a manager approve or decline them', async () => {
    await renderWithProviders(<GroupRequestsPage />);

    expect(screen.getByText('Saturday runners')).toBeOnTheScreen();
    expect(screen.getByText('Jordan Hill')).toBeOnTheScreen();
    expect(mockGetMembers).toHaveBeenCalledWith({ groupId: 'group-1', status: 'pending' }, { skip: false });

    const user = userEvent.setup();
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].approve));
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].decline));

    expect(mockUpdateMember).toHaveBeenNthCalledWith(1, { groupId: 'group-1', userId: 'pending-1', status: 'active' });
    expect(mockUpdateMember).toHaveBeenNthCalledWith(2, {
      groupId: 'group-1',
      userId: 'pending-1',
      status: 'rejected',
    });
  });

  it('shows a retry action when group access cannot be loaded', async () => {
    mockGetGroup.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: mockRefetch });
    await renderWithProviders(<GroupRequestsPage />);

    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].loadError)).toBeOnTheScreen();
    fireEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].retry));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
    expect(mockGetMembers).toHaveBeenCalledWith({ groupId: 'group-1', status: 'pending' }, { skip: true });
  });

  it('reports an approval failure', async () => {
    mockUpdateMember.mockReturnValue({ unwrap: jest.fn().mockRejectedValue(new Error('offline')) });
    await renderWithProviders(<GroupRequestsPage />);
    await userEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].approve));

    await waitFor(() => expect(mockErrorToast).toHaveBeenCalledWith(expect.any(String), expect.any(Error)));
  });
});
