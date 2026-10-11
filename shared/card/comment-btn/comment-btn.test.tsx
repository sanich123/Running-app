import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { Platform } from 'react-native';
import { MD3LightTheme } from 'react-native-paper';
import { setCommentToUpdate, setIdOfUpdatingComment } from '@R/slices/comment/comment';
import { resetLoading } from '@R/slices/loading/loading';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityCardCommentBtn from './comment-btn';
import { ActivityCardContext } from '../context';

jest.mock('react-native-paper', () => {
  const actual = jest.requireActual('react-native-paper');
  const { View } = jest.requireActual('react-native');
  return {
    ...actual,
    IconButton: ({ testID, iconColor, disabled }: { testID?: string; iconColor?: string; disabled?: boolean }) => (
      <View testID={testID} accessibilityLabel={iconColor} accessibilityState={{ disabled: Boolean(disabled) }} />
    ),
  };
});

function renderCommentBtn(activityId = 'someActivityId', commentsLength = 6, allowActivityInteractions = true) {
  return renderWithProviders(
    <ActivityCardContext.Provider
      value={{
        activity: {
          date: '2026-08-09T10:00:00.000Z',
          sport: 'run',
          id: activityId,
          userId: 'activity-owner',
          duration: 0,
          distance: 0,
          elevationGain: 0,
          profile: { ...MOCK_PROFILE, allowActivityInteractions },
          commentsLength,
        },
        isFullView: false,
        isShowDeleteBtn: false,
        isShowDescription: false,
      }}>
      <ActivityCardCommentBtn />
    </ActivityCardContext.Provider>,
    { store: mockStore },
  );
}

async function setCurrentUser(userId: string) {
  await act(async () => {
    mockStore.dispatch(resetLoading());
    mockStore.dispatch(setMockUserId(userId));
  });
}

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => 'somePathname',
}));

describe('Activity card comment btn', () => {
  beforeEach(() => {
    server.use(http.get(`${BASE_URL}/comment/:activityId/count`, () => HttpResponse.json(6)));
  });

  afterEach(async () => {
    await setCurrentUser('');
  });

  it('should correctly renders', async () => {
    await renderCommentBtn();
    const commentIcon = screen.getByTestId('activityCardCommentBtnIcon');
    expect(commentIcon).toBeOnTheScreen();
    expect(commentIcon).toHaveProp('accessibilityLabel', MD3LightTheme.colors.primary);
  });

  it('loads the count for a visible activity without opening comments', async () => {
    let countRequests = 0;
    server.use(
      http.get(`${BASE_URL}/comment/:activityId/count`, () => {
        countRequests += 1;
        return HttpResponse.json(9);
      }),
    );

    await renderCommentBtn('counted-activity', 6);

    await waitFor(() => expect(countRequests).toBe(1));
    expect(await screen.findByText('9')).toBeOnTheScreen();
  });

  it('does not render a badge for a known empty activity', async () => {
    await renderCommentBtn('empty-activity', 0);

    expect(screen.queryByText('0')).not.toBeOnTheScreen();
  });

  it('opens the activity comments modal and stores their context on web', async () => {
    const user = userEvent.setup();
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    await renderCommentBtn();
    await user.press(screen.getByTestId('activityCardCommentBtnIcon'));
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockStore.getState().comment).toEqual(expect.objectContaining({ commentActivityId: 'someActivityId' }));
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });

  it('clears the previous edit mode before opening another activity comments modal', async () => {
    const user = userEvent.setup();
    await act(async () => {
      mockStore.dispatch(setCommentToUpdate('Comment from another activity'));
      mockStore.dispatch(setIdOfUpdatingComment('comment-id'));
    });

    await renderCommentBtn('newActivityId', 0);
    await user.press(screen.getByTestId('activityCardCommentBtnIcon'));

    expect(mockStore.getState().comment).toEqual(
      expect.objectContaining({ commentActivityId: 'newActivityId', commentToUpdate: '', idOfUpdatingComment: '' }),
    );
  });

  it('disables comments for an external viewer when the activity owner has opted out', async () => {
    let countRequests = 0;
    server.use(
      http.get(`${BASE_URL}/comment/:activityId/count`, () => {
        countRequests += 1;
        return HttpResponse.json(3);
      }),
    );

    await setCurrentUser('viewer-id');
    await renderCommentBtn('activity-with-comments-disabled', 3, false);

    expect(countRequests).toBe(0);
    expect(screen.getByTestId('activity-card-comment-button').props.accessibilityState?.disabled).toBe(true);
    expect(screen.queryByText('3')).not.toBeOnTheScreen();
    expect(screen.getByTestId('activityCardCommentBtnIcon')).toHaveProp(
      'accessibilityLabel',
      MD3LightTheme.colors.onSurfaceDisabled,
    );
  });

  it('keeps the activity owner able to open comments to manage their activity', async () => {
    await setCurrentUser('activity-owner');
    await renderCommentBtn('owned-activity', 3, false);
    expect(screen.getByTestId('activity-card-comment-button').props.accessibilityState?.disabled).toBe(false);
  });
});
