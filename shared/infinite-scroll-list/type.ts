export interface InfiniteScrollListProps {
  dataToRender: any;
  refetch: () => void;
  isLastPage: boolean;
  nextPageCallback: () => Promise<unknown>;
  isFetchingNextPage: boolean;
}
