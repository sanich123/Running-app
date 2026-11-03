import type * as ReactTypes from 'react';
import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import type * as ReactNativeTypes from 'react-native';
import { Keyboard, Platform } from 'react-native';
import type * as ReactNativePaperTypes from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { resetAuthSlice } from '@R/slices/auth/auth';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import CreateGroupContentPage from './create-group-content-page';
import { GROUPS_COPY } from '../const';

const mockBack = jest.fn();
const mockRouteParams = jest.fn();
const mockGetGroup = jest.fn();
const mockCreatePost = jest.fn();
const mockJoinMutation = jest.fn();
const mockRefetch = jest.fn();
const mockErrorToast = jest.fn();
const mockSuccessToast = jest.fn();

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useLocalSearchParams: () => mockRouteParams(),
  useRouter: () => ({ back: mockBack }),
}));
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: (...args: unknown[]) => mockErrorToast(...args) }));
jest.mock('@S/success-toast/success-toast', () => ({
  successToast: (...args: unknown[]) => mockSuccessToast(...args),
}));
jest.mock('@S/empty-state/empty-state', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => {
    const ReactModule = jest.requireActual('react') as typeof ReactTypes;
    const { Text } = jest.requireActual('react-native') as typeof ReactNativeTypes;
    return ReactModule.createElement(Text, null, title);
  },
}));
jest.mock('@R/services/groups/groups', () => ({
  useGetGroupByIdQuery: (...args: unknown[]) => mockGetGroup(...args),
  useCreateGroupPostMutation: () => [mockCreatePost, { isLoading: false }],
  useJoinGroupMutation: (...args: unknown[]) => mockJoinMutation(...args),
}));
jest.mock('../create-group-page/group-photo-picker/group-photo-picker', () => ({
  __esModule: true,
  default: ({ onPhotoAssetChange }: { onPhotoAssetChange: (assetId: string | null) => void }) => {
    const ReactModule = jest.requireActual('react') as typeof ReactTypes;
    const { Button } = jest.requireActual('react-native-paper') as typeof ReactNativePaperTypes;
    return ReactModule.createElement(Button, {
      onPress: () => onPhotoAssetChange('photo-asset-1'),
      testID: 'select-post-photo',
      children: 'Select post photo',
    });
  },
}));
jest.mock('../group-events-page/group-event-form/group-event-form', () => {
  const ReactModule = jest.requireActual('react') as typeof ReactTypes;
  const { Button } = jest.requireActual('react-native-paper') as typeof ReactNativePaperTypes;
  return {
    __esModule: true,
    default: ({ onCreated }: { onCreated: () => void }) =>
      ReactModule.createElement(Button, {
        onPress: onCreated,
        testID: 'mock-create-event',
        children: 'Submit event',
      }),
  };
});

const group = {
  id: 'group-1',
  name: 'Saturday runners',
  description: null,
  sports: ['run'],
  categoryTags: [],
  photoUrl: null,
  photoPreviewUrl: null,
  photoPending: false,
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
} as const;

describe('CreateGroupContentPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Keyboard, 'addListener').mockImplementation(() => ({ remove: jest.fn() }) as never);
    mockStore.dispatch(resetAuthSlice());
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockRouteParams.mockReturnValue({ groupId: 'group-1' });
    mockGetGroup.mockReturnValue({ data: group, isLoading: false, isError: false, refetch: mockRefetch });
    mockCreatePost.mockReturnValue({ unwrap: jest.fn().mockResolvedValue(undefined) });
    mockJoinMutation.mockReturnValue([jest.fn(), { data: undefined, isLoading: false }]);
  });

  it('publishes a trimmed post and returns to the group', async () => {
    await renderWithProviders(<CreateGroupContentPage />);
    expect(screen.queryByText(GROUPS_COPY[LANGUAGES.english].createContent)).not.toBeOnTheScreen();
    const user = userEvent.setup();
    await user.type(screen.getByTestId('group-post-input'), '  Meet at the park  ');
    await user.press(screen.getByTestId('group-post-submit'));

    await waitFor(() => expect(mockCreatePost).toHaveBeenCalledWith({ groupId: 'group-1', text: 'Meet at the park' }));
    expect(mockSuccessToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].postCreated);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('includes the selected photo asset when publishing a post', async () => {
    await renderWithProviders(<CreateGroupContentPage />);
    const user = userEvent.setup();
    await user.type(screen.getByTestId('group-post-input'), 'Photo from today');
    await user.press(screen.getByTestId('select-post-photo'));
    await user.press(screen.getByTestId('group-post-submit'));

    await waitFor(() =>
      expect(mockCreatePost).toHaveBeenCalledWith({
        groupId: 'group-1',
        text: 'Photo from today',
        photoAssetId: 'photo-asset-1',
      }),
    );
  });

  it('recognizes the signed-in group creator when the response omits the owner flag', async () => {
    mockStore.dispatch(setMockUserId('owner-1'));
    mockGetGroup.mockReturnValue({
      data: { ...group, isOwner: false, currentMembership: null },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });
    await renderWithProviders(<CreateGroupContentPage />);

    expect(screen.getByTestId('group-post-input')).toBeOnTheScreen();
    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].createEvent)).toBeOnTheScreen();
  });

  it('keeps the post composer available on Android', async () => {
    const originalPlatform = Object.getOwnPropertyDescriptor(Platform, 'OS');
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    try {
      await renderWithProviders(<CreateGroupContentPage />);
      expect(screen.getByTestId('group-post-input')).toBeOnTheScreen();
    } finally {
      if (originalPlatform) Object.defineProperty(Platform, 'OS', originalPlatform);
    }
  });

  it('lets a manager switch to event creation', async () => {
    await renderWithProviders(<CreateGroupContentPage />);
    const user = userEvent.setup();
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].createEvent));
    expect(screen.getByTestId('mock-create-event')).toBeOnTheScreen();
    await user.press(screen.getByTestId('mock-create-event'));

    expect(mockSuccessToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].eventCreated);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('blocks visitors who are not active group members', async () => {
    mockGetGroup.mockReturnValue({
      data: { ...group, isOwner: false, canManage: false, createdByUserId: 'other-user' },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });
    await renderWithProviders(<CreateGroupContentPage />);

    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].postAccessDenied)).toBeOnTheScreen();
    fireEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].backToGroup));
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('group-post-submit')).not.toBeOnTheScreen();
  });

  it('allows an active non-owner member to publish after refreshing membership', async () => {
    mockGetGroup.mockReturnValue({
      data: {
        ...group,
        isOwner: false,
        canManage: false,
        createdByUserId: 'another-owner',
        currentMembership: {
          status: 'active',
          role: 'member',
          notificationPreference: 'all',
          feedPreference: 'all',
        },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
    });
    await renderWithProviders(<CreateGroupContentPage />);

    expect(mockGetGroup).toHaveBeenCalledWith('group-1', { skip: false, refetchOnMountOrArgChange: true });
    const user = userEvent.setup();
    await user.type(screen.getByTestId('group-post-input'), 'Member update');
    await user.press(screen.getByTestId('group-post-submit'));

    await waitFor(() => expect(mockCreatePost).toHaveBeenCalledWith({ groupId: 'group-1', text: 'Member update' }));
    expect(mockSuccessToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].postCreated);
  });

  it('waits for the group membership query before deciding whether posting is allowed', async () => {
    mockGetGroup.mockReturnValue({
      data: { ...group, isOwner: false, canManage: false, createdByUserId: 'another-owner', currentMembership: null },
      isLoading: false,
      isFetching: true,
      isError: false,
      refetch: mockRefetch,
    });
    await renderWithProviders(<CreateGroupContentPage />);

    expect(screen.getByRole('progressbar')).toBeOnTheScreen();
    expect(screen.queryByText(GROUPS_COPY[LANGUAGES.english].postAccessDenied)).not.toBeOnTheScreen();
    expect(screen.queryByTestId('group-post-submit')).not.toBeOnTheScreen();
  });

  it('uses this group active membership returned by join while the query refreshes', async () => {
    mockGetGroup.mockReturnValue({
      data: { ...group, isOwner: false, canManage: false, createdByUserId: 'another-owner', currentMembership: null },
      isLoading: false,
      isFetching: true,
      isError: false,
      refetch: mockRefetch,
    });
    mockJoinMutation.mockReturnValue([
      jest.fn(),
      {
        data: {
          id: 'group-1',
          currentMembership: {
            status: 'active',
            role: 'member',
            notificationPreference: 'all',
            feedPreference: 'all',
          },
        },
        isLoading: false,
      },
    ]);
    await renderWithProviders(<CreateGroupContentPage />);

    expect(screen.getByTestId('group-post-input')).toBeOnTheScreen();
    expect(screen.queryByText(GROUPS_COPY[LANGUAGES.english].postAccessDenied)).not.toBeOnTheScreen();
  });

  it('does not use a different group join result to grant posting access', async () => {
    mockGetGroup.mockReturnValue({
      data: { ...group, isOwner: false, canManage: false, createdByUserId: 'another-owner', currentMembership: null },
      isLoading: false,
      isFetching: true,
      isError: false,
      refetch: mockRefetch,
    });
    mockJoinMutation.mockReturnValue([
      jest.fn(),
      {
        data: {
          id: 'another-group',
          currentMembership: {
            status: 'active',
            role: 'member',
            notificationPreference: 'all',
            feedPreference: 'all',
          },
        },
        isLoading: false,
      },
    ]);
    await renderWithProviders(<CreateGroupContentPage />);

    expect(screen.getByRole('progressbar')).toBeOnTheScreen();
    expect(screen.queryByTestId('group-post-submit')).not.toBeOnTheScreen();
  });

  it('blocks post creation when the join result says membership is still pending', async () => {
    mockGetGroup.mockReturnValue({
      data: { ...group, isOwner: false, canManage: false, createdByUserId: 'another-owner', currentMembership: null },
      isLoading: false,
      isFetching: true,
      isError: false,
      refetch: mockRefetch,
    });
    mockJoinMutation.mockReturnValue([
      jest.fn(),
      {
        data: {
          id: 'group-1',
          currentMembership: {
            status: 'pending',
            role: 'member',
            notificationPreference: 'all',
            feedPreference: 'all',
          },
        },
        isLoading: false,
      },
    ]);
    await renderWithProviders(<CreateGroupContentPage />);

    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].postAccessDenied)).toBeOnTheScreen();
    expect(screen.queryByTestId('group-post-submit')).not.toBeOnTheScreen();
  });

  it('takes the first group id from array route parameters and skips lookup when absent', async () => {
    mockRouteParams.mockReturnValue({ groupId: ['group-1', 'ignored'] });
    await renderWithProviders(<CreateGroupContentPage />);
    expect(mockGetGroup).toHaveBeenCalledWith('group-1', { skip: false, refetchOnMountOrArgChange: true });

    mockRouteParams.mockReturnValue({ groupId: undefined });
    mockGetGroup.mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch: mockRefetch });
    await renderWithProviders(<CreateGroupContentPage />);
    expect(mockGetGroup).toHaveBeenLastCalledWith('', { skip: true, refetchOnMountOrArgChange: true });
    expect(mockJoinMutation).toHaveBeenLastCalledWith({ fixedCacheKey: 'group-join-unresolved' });
  });

  it('shows a retry action when the group query fails', async () => {
    mockGetGroup.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: mockRefetch });
    await renderWithProviders(<CreateGroupContentPage />);
    fireEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].retry));

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('reports a failed post request', async () => {
    mockCreatePost.mockReturnValue({ unwrap: jest.fn().mockRejectedValue(new Error('offline')) });
    await renderWithProviders(<CreateGroupContentPage />);
    const user = userEvent.setup();
    await user.type(screen.getByTestId('group-post-input'), 'Sunday plans');
    await user.press(screen.getByTestId('group-post-submit'));

    await waitFor(() => expect(mockErrorToast).toHaveBeenCalledWith(expect.any(String), expect.any(Error)));
  });
});
