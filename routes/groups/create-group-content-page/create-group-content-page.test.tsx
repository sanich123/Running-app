import type * as ReactTypes from 'react';
import { useEffect } from 'react';
import { act, fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { Keyboard, Platform } from 'react-native';
import type * as ReactNativeTypes from 'react-native';
import type * as ReactNativePaperTypes from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { runichApi } from '@R/runich-api/runich-api';
import { useJoinGroupMutation } from '@R/services/groups/groups';
import { resetAuthSlice } from '@R/slices/auth/auth';
import { changeLanguage } from '@R/slices/settings/settings';
import { BASE_URL } from '@T/utils/handlers';
import { createMockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import CreateGroupContentPage from './create-group-content-page';
import { GROUPS_COPY } from '../const';
import type { GroupDetails } from '@R/services/groups/types';
import type { UnknownAction } from '@reduxjs/toolkit';
import type { ThunkAction } from 'redux-thunk';

const mockBack = jest.fn();
const mockRouteParams = jest.fn();
const mockErrorToast = jest.fn();
const mockSuccessToast = jest.fn();
const groupRequests: string[] = [];
const joinRequests: string[] = [];
const postRequests: { groupId: string; body: Record<string, unknown> }[] = [];
let groupQueryError = false;
let holdGroupQuery = false;
let releaseGroupQuery: (() => void) | undefined;
let postRequestError = false;
let testStore: ReturnType<typeof createMockStore>;
type GroupQueryCacheThunk = ThunkAction<unknown, ReturnType<typeof testStore.getState>, unknown, UnknownAction>;
const upsertGroupQueryData = runichApi.util.upsertQueryData as unknown as (
  endpointName: 'getGroupById',
  arg: string,
  value: GroupDetails,
) => GroupQueryCacheThunk;

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

const group: GroupDetails = {
  id: 'group-1',
  name: 'Saturday runners',
  description: null,
  sports: ['run'],
  categoryTags: [],
  photoUrl: null,
  photoPreviewUrl: null,
  photoBlurhash: null,
  photoReviewStatus: null,
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
};

let groupResponse: GroupDetails = group;
let joinResponse: GroupDetails = group;

function JoinGroupRequest({ groupId }: { groupId: string }) {
  const [joinGroup] = useJoinGroupMutation({ fixedCacheKey: `group-join-${groupId}` });

  useEffect(() => {
    void joinGroup(groupId);
  }, [groupId, joinGroup]);

  return null;
}

async function renderLoadedPage() {
  await renderWithProviders(<CreateGroupContentPage />, { store: testStore });
  await waitFor(() => expect(groupRequests.length).toBeGreaterThan(0));
  await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeOnTheScreen());
}

async function preloadGroupQuery() {
  await testStore.dispatch(upsertGroupQueryData('getGroupById', 'group-1', groupResponse));
}

async function releaseGroupQueryAndWait() {
  await act(async () => releaseGroupQuery?.());
  await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeOnTheScreen());
}

describe('CreateGroupContentPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    testStore = createMockStore();
    groupRequests.length = 0;
    joinRequests.length = 0;
    postRequests.length = 0;
    groupResponse = group;
    joinResponse = group;
    groupQueryError = false;
    holdGroupQuery = false;
    releaseGroupQuery = undefined;
    postRequestError = false;
    server.use(
      http.get(`${BASE_URL}/groups/group-1`, async () => {
        groupRequests.push('GET /groups/group-1');
        if (groupQueryError) return HttpResponse.json({ message: 'group unavailable' }, { status: 503 });
        if (holdGroupQuery) {
          holdGroupQuery = false;
          await new Promise<void>((resolve) => {
            releaseGroupQuery = resolve;
          });
        }
        return HttpResponse.json(groupResponse);
      }),
      http.post(`${BASE_URL}/groups/group-1/join`, () => {
        joinRequests.push('POST /groups/group-1/join');
        return HttpResponse.json(joinResponse);
      }),
      http.post(`${BASE_URL}/groups/group-1/posts`, async ({ request }) => {
        postRequests.push({ groupId: 'group-1', body: (await request.json()) as Record<string, unknown> });
        return postRequestError
          ? HttpResponse.json({ message: 'offline' }, { status: 500 })
          : HttpResponse.json({ id: 'post-1' }, { status: 201 });
      }),
    );
    jest.spyOn(Keyboard, 'addListener').mockImplementation(() => ({ remove: jest.fn() }) as never);
    testStore.dispatch(resetAuthSlice());
    testStore.dispatch(changeLanguage(LANGUAGES.english));
    mockRouteParams.mockReturnValue({ groupId: 'group-1' });
  });

  it('publishes a trimmed post and returns to the group', async () => {
    await renderLoadedPage();
    expect(screen.queryByText(GROUPS_COPY[LANGUAGES.english].createContent)).not.toBeOnTheScreen();
    const user = userEvent.setup();
    await user.type(screen.getByTestId('group-post-input'), '  Meet at the park  ');
    await user.press(screen.getByTestId('group-post-submit'));

    await waitFor(() => expect(postRequests).toEqual([{ groupId: 'group-1', body: { text: 'Meet at the park' } }]));
    expect(mockSuccessToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].postCreated);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('includes the selected photo asset when publishing a post', async () => {
    await renderLoadedPage();
    const user = userEvent.setup();
    await user.type(screen.getByTestId('group-post-input'), 'Photo from today');
    await user.press(screen.getByTestId('select-post-photo'));
    await user.press(screen.getByTestId('group-post-submit'));

    await waitFor(() =>
      expect(postRequests).toEqual([
        { groupId: 'group-1', body: { text: 'Photo from today', photoAssetId: 'photo-asset-1' } },
      ]),
    );
  });

  it('recognizes the signed-in group creator when the response omits the owner flag', async () => {
    testStore.dispatch(setMockUserId('owner-1'));
    groupResponse = { ...group, isOwner: false, currentMembership: null };
    await renderLoadedPage();

    expect(screen.getByTestId('group-post-input')).toBeOnTheScreen();
    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].createEvent)).toBeOnTheScreen();
  });

  it('keeps the post composer available on Android', async () => {
    const originalPlatform = Object.getOwnPropertyDescriptor(Platform, 'OS');
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    try {
      await renderLoadedPage();
      expect(screen.getByTestId('group-post-input')).toBeOnTheScreen();
    } finally {
      if (originalPlatform) Object.defineProperty(Platform, 'OS', originalPlatform);
    }
  });

  it('lets a manager switch to event creation', async () => {
    await renderLoadedPage();
    const user = userEvent.setup();
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].createEvent));
    expect(screen.getByTestId('mock-create-event')).toBeOnTheScreen();
    await user.press(screen.getByTestId('mock-create-event'));

    expect(mockSuccessToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].eventCreated);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('blocks visitors who are not active group members', async () => {
    groupResponse = { ...group, isOwner: false, canManage: false, createdByUserId: 'other-user' };
    await renderLoadedPage();

    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].postAccessDenied)).toBeOnTheScreen();
    fireEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].backToGroup));
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('group-post-submit')).not.toBeOnTheScreen();
  });

  it('allows an active non-owner member to publish after refreshing membership', async () => {
    groupResponse = {
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
    };
    await renderLoadedPage();

    const user = userEvent.setup();
    await user.type(screen.getByTestId('group-post-input'), 'Member update');
    await user.press(screen.getByTestId('group-post-submit'));

    await waitFor(() => expect(postRequests).toEqual([{ groupId: 'group-1', body: { text: 'Member update' } }]));
    expect(mockSuccessToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].postCreated);
  });

  it('keeps event creation available only to owners and group managers', async () => {
    groupResponse = {
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
    };
    await renderLoadedPage();

    expect(screen.getByTestId('group-post-input')).toBeOnTheScreen();
    expect(screen.queryByText(GROUPS_COPY[LANGUAGES.english].createEvent)).not.toBeOnTheScreen();
  });

  it('waits for the group membership query before deciding whether posting is allowed', async () => {
    groupResponse = {
      ...group,
      isOwner: false,
      canManage: false,
      createdByUserId: 'another-owner',
      currentMembership: null,
    };
    await preloadGroupQuery();
    holdGroupQuery = true;
    await renderWithProviders(<CreateGroupContentPage />, { store: testStore });

    await waitFor(() => expect(groupRequests).toHaveLength(1));
    expect(screen.getByRole('progressbar')).toBeOnTheScreen();
    expect(screen.queryByText(GROUPS_COPY[LANGUAGES.english].postAccessDenied)).not.toBeOnTheScreen();
    expect(screen.queryByTestId('group-post-submit')).not.toBeOnTheScreen();
    await releaseGroupQueryAndWait();
  });

  it('uses this group active membership returned by join while the query refreshes', async () => {
    groupResponse = {
      ...group,
      isOwner: false,
      canManage: false,
      createdByUserId: 'another-owner',
      currentMembership: null,
    };
    joinResponse = {
      ...group,
      currentMembership: {
        status: 'active',
        role: 'member',
        notificationPreference: 'all',
        feedPreference: 'all',
      },
    };
    await preloadGroupQuery();
    holdGroupQuery = true;
    await renderWithProviders(
      <>
        <JoinGroupRequest groupId="group-1" />
        <CreateGroupContentPage />
      </>,
      { store: testStore },
    );

    await waitFor(() => {
      expect(groupRequests).toHaveLength(1);
      expect(joinRequests).toHaveLength(1);
    });
    expect(await screen.findByTestId('group-post-input')).toBeOnTheScreen();
    expect(screen.queryByText(GROUPS_COPY[LANGUAGES.english].postAccessDenied)).not.toBeOnTheScreen();
    await releaseGroupQueryAndWait();
  });

  it('does not use a different group join result to grant posting access', async () => {
    groupResponse = {
      ...group,
      isOwner: false,
      canManage: false,
      createdByUserId: 'another-owner',
      currentMembership: null,
    };
    joinResponse = {
      ...group,
      id: 'another-group',
      currentMembership: {
        status: 'active',
        role: 'member',
        notificationPreference: 'all',
        feedPreference: 'all',
      },
    };
    await preloadGroupQuery();
    holdGroupQuery = true;
    await renderWithProviders(
      <>
        <JoinGroupRequest groupId="group-1" />
        <CreateGroupContentPage />
      </>,
      { store: testStore },
    );

    await waitFor(() => {
      expect(groupRequests).toHaveLength(1);
      expect(joinRequests).toHaveLength(1);
    });
    expect(screen.getByRole('progressbar')).toBeOnTheScreen();
    expect(screen.queryByTestId('group-post-submit')).not.toBeOnTheScreen();
    await releaseGroupQueryAndWait();
    expect(await screen.findByText(GROUPS_COPY[LANGUAGES.english].postAccessDenied)).toBeOnTheScreen();
  });

  it('blocks post creation when the join result says membership is still pending', async () => {
    groupResponse = {
      ...group,
      isOwner: false,
      canManage: false,
      createdByUserId: 'another-owner',
      currentMembership: null,
    };
    joinResponse = {
      ...group,
      currentMembership: {
        status: 'pending',
        role: 'member',
        notificationPreference: 'all',
        feedPreference: 'all',
      },
    };
    await preloadGroupQuery();
    holdGroupQuery = true;
    await renderWithProviders(
      <>
        <JoinGroupRequest groupId="group-1" />
        <CreateGroupContentPage />
      </>,
      { store: testStore },
    );

    await waitFor(() => {
      expect(groupRequests).toHaveLength(1);
      expect(joinRequests).toHaveLength(1);
    });
    expect(await screen.findByText(GROUPS_COPY[LANGUAGES.english].postAccessDenied)).toBeOnTheScreen();
    expect(screen.queryByTestId('group-post-submit')).not.toBeOnTheScreen();
    await releaseGroupQueryAndWait();
  });

  it('takes the first group id from array route parameters', async () => {
    mockRouteParams.mockReturnValue({ groupId: ['group-1', 'ignored'] });
    await renderWithProviders(<CreateGroupContentPage />, { store: testStore });
    await waitFor(() => expect(groupRequests).toHaveLength(1));
    await waitFor(() => expect(screen.getByText(group.name)).toBeOnTheScreen());
  });

  it('skips the group lookup when the route parameter is absent', async () => {
    mockRouteParams.mockReturnValue({ groupId: undefined });
    await renderWithProviders(<CreateGroupContentPage />, { store: testStore });
    expect(await screen.findByText(GROUPS_COPY[LANGUAGES.english].loadError)).toBeOnTheScreen();
    expect(groupRequests).toHaveLength(0);
  });

  it('shows a retry action when the group query fails', async () => {
    groupQueryError = true;
    await renderWithProviders(<CreateGroupContentPage />, { store: testStore });
    expect(await screen.findByText(GROUPS_COPY[LANGUAGES.english].loadError)).toBeOnTheScreen();
    await userEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].retry));

    await waitFor(() => expect(groupRequests).toHaveLength(2));
  });

  it('reports a failed post request', async () => {
    postRequestError = true;
    await renderLoadedPage();
    const user = userEvent.setup();
    await user.type(screen.getByTestId('group-post-input'), 'Sunday plans');
    await user.press(screen.getByTestId('group-post-submit'));

    await waitFor(() =>
      expect(mockErrorToast).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ status: 500 })),
    );
  });
});
