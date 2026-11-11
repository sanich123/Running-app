import type { GroupsFilterState } from '../types';

export interface GroupsFilterControlsProps {
  filters: GroupsFilterState;
  onChange: (filters: GroupsFilterState) => void;
}
