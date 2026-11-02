import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import { Keyboard } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import EditGroupPage from './edit-group-page';
import { GROUPS_COPY } from '../const';

const mockReplace = jest.fn();
const mockGetGroup = jest.fn();
const mockUpdateGroup = jest.fn();
const mockRefetch = jest.fn();
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
jest.mock('@R/services/groups/groups', () => ({
  useGetGroupByIdQuery: (...args: unknown[]) => mockGetGroup(...args),
  useUpdateGroupMutation: () => [mockUpdateGroup, { isLoading: false }],
}));

const group = {
  id: 'group-1',
  name: 'Saturday runners',
  description: 'Morning runs',
  sports: ['run'],
  categoryTags: ['team'],
  photoUrl: null,
  photoPreviewUrl: null,
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
} as const;

describe('EditGroupPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Keyboard, 'addListener').mockImplementation(() => ({ remove: jest.fn() }) as never);
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockGetGroup.mockReturnValue({ data: group, isLoading: false, isError: false, refetch: mockRefetch });
    mockUpdateGroup.mockReturnValue({ unwrap: jest.fn().mockResolvedValue(undefined) });
  });

  it('saves the owner changes and returns to the group', async () => {
    await renderWithProviders(<EditGroupPage />);
    await userEvent.press(screen.getByTestId('edit-group-submit'));

    await waitFor(() =>
      expect(mockUpdateGroup).toHaveBeenCalledWith({
        groupId: 'group-1',
        name: 'Saturday runners',
        description: 'Morning runs',
        sports: ['run'],
        categoryTags: ['team'],
        privacy: 'open',
        locationName: 'Moscow',
      }),
    );
    expect(mockSuccessToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].groupUpdated);
    expect(mockReplace).toHaveBeenCalledWith('/groups/group-1');
  });

  it('saves a worldwide group without a location name', async () => {
    await renderWithProviders(<EditGroupPage />);
    const user = userEvent.setup();
    await user.press(screen.getByTestId('group-worldwide-toggle'));
    await user.press(screen.getByTestId('edit-group-submit'));

    await waitFor(() => expect(mockUpdateGroup).toHaveBeenCalledWith(expect.objectContaining({ locationName: null })));
  });

  it('requires at least one sport before saving', async () => {
    mockGetGroup.mockReturnValue({
      data: { ...group, sports: [] },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });
    await renderWithProviders(<EditGroupPage />);
    fireEvent.press(screen.getByTestId('edit-group-submit'));

    expect(mockErrorToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].chooseSport);
    expect(mockUpdateGroup).not.toHaveBeenCalled();
  });

  it('reports an error when group updates fail', async () => {
    mockUpdateGroup.mockReturnValue({ unwrap: jest.fn().mockRejectedValue(new Error('offline')) });
    await renderWithProviders(<EditGroupPage />);
    await userEvent.press(screen.getByTestId('edit-group-submit'));

    await waitFor(() =>
      expect(mockErrorToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].saveError, expect.any(Error)),
    );
  });

  it('keeps non-owners out of the edit form', async () => {
    mockGetGroup.mockReturnValue({
      data: { ...group, isOwner: false, createdByUserId: 'another-user' },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });
    await renderWithProviders(<EditGroupPage />);

    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].ownerOnlyEdit)).toBeOnTheScreen();
    fireEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].deleteGroupCancel));
    expect(mockReplace).toHaveBeenCalledWith('/groups/group-1');
    expect(screen.queryByTestId('edit-group-submit')).not.toBeOnTheScreen();
  });

  it('requires a valid group name before saving', async () => {
    await renderWithProviders(<EditGroupPage />);
    const user = userEvent.setup();
    await user.clear(screen.getByTestId('group-name-input'));
    await user.type(screen.getByTestId('group-name-input'), 'A');
    await user.press(screen.getByTestId('edit-group-submit'));

    expect(mockErrorToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].nameRequired);
    expect(mockUpdateGroup).not.toHaveBeenCalled();
  });

  it('offers retry when group details fail to load', async () => {
    mockGetGroup.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: mockRefetch });
    await renderWithProviders(<EditGroupPage />);
    fireEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].retry));

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});
