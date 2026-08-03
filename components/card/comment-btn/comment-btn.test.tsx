import { screen } from '@testing-library/react-native';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityCardCommentBtn from './comment-btn';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => 'somePathname',
}));

describe('Activity card comment btn', () => {
  it('should correctly renders', () => {
    renderWithProviders(
      <ActivityCardCommentBtn activityId="someActivityId" commentsLength={6} profile={MOCK_PROFILE} />,
      {
        store: mockStore,
      },
    );
    expect(screen.getByTestId('activityCardCommentBtnIcon')).toBeOnTheScreen();
  });
});
