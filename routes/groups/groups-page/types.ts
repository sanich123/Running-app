import type { GroupListScope, GroupSport } from '@R/services/groups/types';

export interface GroupsFilterState {
  scope: GroupListScope;
  search: string;
  sport: GroupSport | null;
}
