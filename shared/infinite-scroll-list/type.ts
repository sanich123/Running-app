export interface InfiniteScrollListProps {
  dataToRender: any;
  refetch: () => void;
  isLastPage: boolean;
  nextPageCallback: () => void;
  isFetching: boolean;
}
