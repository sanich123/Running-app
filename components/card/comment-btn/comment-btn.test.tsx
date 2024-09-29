import { mockStore } from '@T/utils/mock-store';
import { screen } from '@testing-library/react-native';

import ActivityCardCommentBtn from './comment-btn';
import { renderWithProviders } from '../../../tests/utils/test-utils';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => 'somePathname',
}));

describe('Activity card comment btn', () => {
  it('should correctly renders', () => {
    renderWithProviders(
      <BottomSheetModalProvider>
        <ActivityCardCommentBtn activityId="someActivityId" commentsLength={6} />
      </BottomSheetModalProvider>,
      {
        store: mockStore,
      },
    );
    expect(screen.getByTestId('activityCardCommentBtnIcon')).toBeOnTheScreen();
  });
});
