import type { GroupEventsCopy } from '../types';
import type { GroupSport } from '@R/services/groups/types';

export interface GroupEventFormProps {
  groupId: string;
  groupSports?: GroupSport[];
  copy: GroupEventsCopy;
  onCreated?: () => void;
}
