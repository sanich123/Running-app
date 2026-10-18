import { act, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import InfiniteScrollList from './infinite-scroll-list';

jest.mock('@S/infinite-scroll-list/week-statistics/week-statistics', () => () => null);
jest.mock('@S/card/activity-card/activity-card', () => () => null);

const activities = Array.from({ length: 20 }, (_, index) => ({
  id: `activity-${index}`,
  title: `Activity ${index}`,
  date: '2026-08-09',
  sport: 'run',
  media: [],
  duration: 1000,
  distance: 2000,
  elevationGain: 15,
  steps: 0,
  userId: 'user-1',
  profile: {},
  _count: { comments: 0, likes: 0 },
}));

describe('infinite scroll list', () => {
  it('loads the next page when the user reaches the end', async () => {
    const nextPageCallback = jest.fn().mockResolvedValue(undefined);
    await renderWithProviders(
      <InfiniteScrollList
        dataToRender={[]}
        refetch={jest.fn()}
        isLastPage={false}
        nextPageCallback={nextPageCallback}
        isFetchingNextPage={false}
      />,
    );
    await act(async () => screen.getByTestId('infinite-scroll-list').props.onEndReached());
    expect(nextPageCallback).toHaveBeenCalledTimes(1);
  });

  it('waits for the next page request to finish', async () => {
    let resolveNextPage!: () => void;
    const nextPageRequest = new Promise<void>((resolve) => {
      resolveNextPage = resolve;
    });
    const nextPageCallback = jest.fn(() => nextPageRequest);
    await renderWithProviders(
      <InfiniteScrollList
        dataToRender={[]}
        refetch={jest.fn()}
        isLastPage={false}
        nextPageCallback={nextPageCallback}
        isFetchingNextPage={false}
      />,
    );

    const endReachedPromise = screen.getByTestId('infinite-scroll-list').props.onEndReached();
    let hasFinished = false;
    endReachedPromise.then(() => {
      hasFinished = true;
    });

    expect(nextPageCallback).toHaveBeenCalledTimes(1);
    await Promise.resolve();
    expect(hasFinished).toBe(false);

    resolveNextPage();
    await act(async () => {
      await endReachedPromise;
    });
    expect(hasFinished).toBe(true);
  });

  it('prefetches the next page when half of the loaded page is visible', async () => {
    const nextPageCallback = jest.fn().mockResolvedValue(undefined);
    await renderWithProviders(
      <InfiniteScrollList
        dataToRender={activities}
        refetch={jest.fn()}
        isLastPage={false}
        nextPageCallback={nextPageCallback}
        isFetchingNextPage={false}
      />,
    );

    await act(async () => {
      screen.getByTestId('infinite-scroll-list').props.onViewableItemsChanged({ viewableItems: [{ index: 9 }] });
    });

    expect(nextPageCallback).toHaveBeenCalledTimes(1);
  });

  it('does not show a footer loader while the next page is idle', async () => {
    const nextPageCallback = jest.fn().mockResolvedValue(undefined);
    await renderWithProviders(
      <InfiniteScrollList
        dataToRender={[]}
        refetch={jest.fn()}
        isLastPage={false}
        nextPageCallback={nextPageCallback}
        isFetchingNextPage={false}
      />,
    );

    expect(screen.getByTestId('infinite-scroll-list').props.ListFooterComponent).toBeUndefined();
  });

  it('shows a small footer loader only while the next page is fetching', async () => {
    const nextPageCallback = jest.fn().mockResolvedValue(undefined);
    await renderWithProviders(
      <InfiniteScrollList
        dataToRender={[]}
        refetch={jest.fn()}
        isLastPage={false}
        nextPageCallback={nextPageCallback}
        isFetchingNextPage
      />,
    );

    expect(screen.getByTestId('infinite-scroll-list').props.ListFooterComponent).not.toBeNull();
    await act(async () => screen.getByTestId('infinite-scroll-list').props.onEndReached());
    expect(nextPageCallback).not.toHaveBeenCalled();
  });

  it('refetches the feed after pull-to-refresh', async () => {
    const refetch = jest.fn();
    await renderWithProviders(
      <InfiniteScrollList
        dataToRender={[]}
        refetch={refetch}
        isLastPage
        nextPageCallback={jest.fn().mockResolvedValue(undefined)}
        isFetchingNextPage={false}
      />,
    );
    await act(async () => screen.getByTestId('infinite-scroll-list').props.onRefresh());
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
