import { screen, userEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { setCommentToUpdate, setIdOfUpdatingComment } from '@R/slices/comment/comment';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityCardCommentBtn from './comment-btn';
import { ActivityCardContext } from '../context';

function renderCommentBtn(activityId = 'someActivityId', commentsLength = 6) {
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
          profile: MOCK_PROFILE,
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

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => 'somePathname',
}));

describe('Activity card comment btn', () => {
  it('should correctly renders', async () => {
    await renderCommentBtn();
    expect(screen.getByTestId('activityCardCommentBtnIcon')).toBeOnTheScreen();
  });

  it('opens the activity comments modal and stores their context on web', async () => {
    const user = userEvent.setup();
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    await renderCommentBtn();
    await user.press(screen.getByTestId('activityCardCommentBtnIcon'));
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockStore.getState().comment).toEqual(
      expect.objectContaining({ commentActivityId: 'someActivityId', commentsLength: 6 }),
    );
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });

  it('clears the previous edit mode before opening another activity comments modal', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(setCommentToUpdate('Comment from another activity'));
    mockStore.dispatch(setIdOfUpdatingComment('comment-id'));

    await renderCommentBtn('newActivityId', 0);
    await user.press(screen.getByTestId('activityCardCommentBtnIcon'));

    expect(mockStore.getState().comment).toEqual(
      expect.objectContaining({ commentActivityId: 'newActivityId', commentToUpdate: '', idOfUpdatingComment: '' }),
    );
  });
});
