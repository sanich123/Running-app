import { fireEvent, screen } from '@testing-library/react-native';
import { setActivityIdWhichLikesToDownload } from '@R/slices/main-feed/main-feed';
import { mockStore, resetMockMainFeed } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ModalLikesList from './modal-likes-list';

const mockFetchNextPage = jest.fn();
const mockLikesQuery = jest.fn();
jest.mock('@R/services/likes/likes', () => ({
  useGetLikesByActivityIdInfiniteQuery: (...args: unknown[]) => mockLikesQuery(...args),
}));

describe('modal likes list', () => {
  beforeEach(() => {
    mockFetchNextPage.mockReset();
    mockStore.dispatch(resetMockMainFeed());
    mockLikesQuery.mockReturnValue({
      data: { pages: [{ likes: [], hasMore: false, nextCursor: null }], pageParams: [''] },
      isSuccess: true,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
    });
  });

  it('renders an empty state after a successful likes request', async () => {
    mockStore.dispatch(setActivityIdWhichLikesToDownload('activity-1'));
    await renderWithProviders(<ModalLikesList bottomSheetModalRef={{ current: null }} likesLength={0} />);
    expect(screen.getByText('Лайков пока нет')).toBeOnTheScreen();
    expect(screen.getByText('Эта активность ждёт своего первого виртуального «дай пять».')).toBeOnTheScreen();
  });

  it('loads the next page when the likes list reaches its end', async () => {
    mockLikesQuery.mockReturnValue({
      data: { pages: [{ likes: [], hasMore: true, nextCursor: 'cursor-2' }], pageParams: [''] },
      isSuccess: true,
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
    });
    mockStore.dispatch(setActivityIdWhichLikesToDownload('activity-1'));
    await renderWithProviders(<ModalLikesList bottomSheetModalRef={{ current: null }} likesLength={31} />);

    fireEvent(screen.getByTestId('likes-modal-list'), 'onEndReached');

    expect(mockLikesQuery).toHaveBeenCalledWith({ activityId: 'activity-1' }, { skip: false });
    expect(mockFetchNextPage).toHaveBeenCalledTimes(1);
  });
});
