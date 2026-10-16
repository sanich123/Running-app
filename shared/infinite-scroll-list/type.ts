import type { ReactNode } from 'react';

export interface InfiniteScrollListProps {
  dataToRender: any;
  refetch: () => void;
  isLastPage: boolean;
  nextPageCallback: () => Promise<unknown>;
  isFetchingNextPage: boolean;
  headerAfterWeekStatistics?: ReactNode;
}
