import { act, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import InfiniteScrollList from './infinite-scroll-list';

jest.mock('@S/infinite-scroll-list/week-statistics/week-statistics', () => () => null);

describe('infinite scroll list', () => {
  it('loads the next page when the user reaches the end', async () => {
    const nextPageCallback = jest.fn().mockResolvedValue(undefined);
    await renderWithProviders(
      <InfiniteScrollList
        dataToRender={[]}
        refetch={jest.fn()}
        isLastPage={false}
        nextPageCallback={nextPageCallback}
        isFetching={false}
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
        isFetching={false}
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

  it('refetches the feed after pull-to-refresh', async () => {
    const refetch = jest.fn();
    await renderWithProviders(
      <InfiniteScrollList
        dataToRender={[]}
        refetch={refetch}
        isLastPage
        nextPageCallback={jest.fn().mockResolvedValue(undefined)}
        isFetching={false}
      />,
    );
    await act(async () => screen.getByTestId('infinite-scroll-list').props.onRefresh());
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
