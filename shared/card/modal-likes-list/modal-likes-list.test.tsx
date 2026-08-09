import { screen } from '@testing-library/react-native';
import { setActivityIdWhichLikesToDownload, resetMainFeedSlice } from '@R/slices/main-feed/main-feed';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ModalLikesList from './modal-likes-list';

jest.mock('@R/services/likes/likes', () => ({
  useGetLikesByActivityIdQuery: jest.fn(() => ({ data: [], isSuccess: true })),
}));

describe('modal likes list', () => {
  beforeEach(() => mockStore.dispatch(resetMainFeedSlice()));

  it('renders an empty state after a successful likes request', async () => {
    mockStore.dispatch(setActivityIdWhichLikesToDownload('activity-1'));
    await renderWithProviders(<ModalLikesList bottomSheetModalRef={{ current: null }} likesLength={0} />);
    expect(screen.getByText('Лайков пока нет')).toBeOnTheScreen();
    expect(screen.getByText('Эта активность ждёт своего первого виртуального «дай пять».')).toBeOnTheScreen();
  });
});
