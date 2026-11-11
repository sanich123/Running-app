import type { GroupDetails } from '@R/services/groups/types';

export interface GroupDetailTabContentProps {
  group: GroupDetails;
  isActiveMember: boolean;
}
