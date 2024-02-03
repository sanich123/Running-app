import { screen } from '@testing-library/react-native';

import ActivityCardCommentBtn from './card-comment-btn';
import { renderWithProviders } from '../../tests/utils/test-utils';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => 'somePathname',
}));

describe('Activity card comment btn', () => {
  it('should correctly renders', () => {
    renderWithProviders(<ActivityCardCommentBtn activityId="someActivityId" />);
    expect(screen.getByTestId('activityCardCommentBtnIcon')).toBeOnTheScreen();
  });
});
