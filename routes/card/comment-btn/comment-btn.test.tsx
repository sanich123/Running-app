import { screen, userEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { ROUTES } from '@const/enums';
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

  it('opens the activity comments and stores their context', async () => {
    const user = userEvent.setup();
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    await renderWithProviders(
      <ActivityCardCommentBtn activityId="someActivityId" commentsLength={6} profile={MOCK_PROFILE} />,
    );
    await user.press(screen.getByTestId('activityCardCommentBtnIcon'));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.comment}/someActivityId`);
    expect(mockStore.getState().comment).toEqual(
      expect.objectContaining({ commentActivityId: 'someActivityId', commentsLength: 6, isShowingTextInput: false }),
    );
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });
});
