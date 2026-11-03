import type { GroupEventPeriod, GroupEventsCopy } from '../types';
import type { GroupEvent } from '@R/services/groups/types';

export interface GroupEventsListProps {
  groupId: string;
  period: GroupEventPeriod;
  canSeeEvents: boolean;
  copy: GroupEventsCopy;
  locale: string;
  events?: GroupEvent[];
  isLoading?: boolean;
}
