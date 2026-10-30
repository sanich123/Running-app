import type { GROUPS_COPY } from '../const';
import type { LANGUAGES } from '@const/enums';
import type { GroupMember } from '@R/services/groups/types';

export type GroupCopy = (typeof GROUPS_COPY)[keyof typeof GROUPS_COPY];
export type GroupMemberUpdateStatus = 'active' | 'rejected' | 'removed';

export interface GroupMemberRowProps {
  member: GroupMember;
  copy: GroupCopy;
  language: LANGUAGES;
  canManage: boolean;
  isRequest?: boolean;
  isUpdating: boolean;
  onUpdateMember: (userId: string, status: GroupMemberUpdateStatus) => void;
  rank?: number;
  distanceLabel?: string;
}
