import type { ReactNode } from 'react';
import type { ActivityListItemResponse } from '@R/runich-api/activity-types';

export interface InfiniteScrollListProps {
  dataToRender: ActivityListItemResponse[];
  refetch: () => { unwrap: () => Promise<unknown> };
  isLastPage: boolean;
  nextPageCallback: () => Promise<unknown>;
  isFetchingNextPage: boolean;
  headerAfterWeekStatistics?: ReactNode;
}
