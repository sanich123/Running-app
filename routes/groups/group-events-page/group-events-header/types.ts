import type { GroupEventPeriod, GroupEventsCopy } from '../types';

export interface GroupEventsHeaderProps {
  groupName: string;
  period: GroupEventPeriod;
  onPeriodChange: (period: GroupEventPeriod) => void;
  copy: GroupEventsCopy;
  showTitle?: boolean;
}
