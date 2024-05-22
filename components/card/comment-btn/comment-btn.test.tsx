import { MOCK_COMMENTS } from '@T/mocks/mock-comments';
import { mockStore } from '@T/utils/mock-store';
import { screen } from '@testing-library/react-native';

import ActivityCardCommentBtn from './comment-btn';
import { renderWithProviders } from '../../../tests/utils/test-utils';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => 'somePathname',
}));

describe('Activity card comment btn', () => {
  it('should correctly renders', () => {
    renderWithProviders(<ActivityCardCommentBtn activityId="someActivityId" />, {
      store: mockStore,
    });
    expect(screen.getByTestId('activityCardCommentBtnIcon')).toBeOnTheScreen();
  });
});
