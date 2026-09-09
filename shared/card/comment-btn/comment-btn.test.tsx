import { screen, userEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { setCommentToUpdate, setIdOfUpdatingComment } from '@R/slices/comment/comment';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityCardCommentBtn from './comment-btn';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => 'somePathname',
}));

describe('Activity card comment btn', () => {
  it('should correctly renders', async () => {
    await renderWithProviders(
      <ActivityCardCommentBtn activityId="someActivityId" commentsLength={6} profile={MOCK_PROFILE} />,
      {
        store: mockStore,
      },
    );
    expect(screen.getByTestId('activityCardCommentBtnIcon')).toBeOnTheScreen();
  });

  it('opens the activity comments modal and stores their context on web', async () => {
    const user = userEvent.setup();
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    await renderWithProviders(
      <ActivityCardCommentBtn activityId="someActivityId" commentsLength={6} profile={MOCK_PROFILE} />,
    );
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

    await renderWithProviders(
      <ActivityCardCommentBtn activityId="newActivityId" commentsLength={0} profile={MOCK_PROFILE} />,
    );
    await user.press(screen.getByTestId('activityCardCommentBtnIcon'));

    expect(mockStore.getState().comment).toEqual(
      expect.objectContaining({ commentActivityId: 'newActivityId', commentToUpdate: '', idOfUpdatingComment: '' }),
    );
  });
});
