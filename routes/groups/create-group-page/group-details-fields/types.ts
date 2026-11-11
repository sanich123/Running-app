import type { GroupCreationDetails } from '../types';

export interface GroupDetailsFieldsProps {
  details: GroupCreationDetails;
  onChange: (details: GroupCreationDetails) => void;
}
