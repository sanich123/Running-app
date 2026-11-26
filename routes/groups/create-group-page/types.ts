import type { GroupPrivacy, GroupSport } from '@R/services/groups/types';

export interface GroupCreationDetails {
  name: string;
  description: string;
  locationName: string;
}

export type GroupCreationTextFields = Pick<GroupCreationDetails, 'name' | 'description' | 'locationName'>;

export interface GroupCreationOptions {
  sports: GroupSport[];
  privacy: GroupPrivacy;
}
