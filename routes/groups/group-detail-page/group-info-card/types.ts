import type { GroupDetails } from '@R/services/groups/types';

export interface GroupInfoCardProps {
  group: GroupDetails;
  isRefreshing?: boolean;
}
