import { MOCK_COMMENTS } from '@T/mocks/mock-comments';
import { screen } from '@testing-library/react-native';

import ActivityCardCommentBtn from './comment-btn';
import { renderWithProviders } from '../../../tests/utils/test-utils';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => 'somePathname',
}));

describe('Activity card comment btn', () => {
  it('should correctly renders', () => {
    renderWithProviders(<ActivityCardCommentBtn activityId="someActivityId" comments={MOCK_COMMENTS} />);
    expect(screen.getByTestId('activityCardCommentBtnIcon')).toBeOnTheScreen();
  });
});
