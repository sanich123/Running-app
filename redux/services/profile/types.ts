import type { ProfileSettings } from '@R/slices/profile/types';
import type { ProfileType } from '@S/card/types';

export type ProfileResponse = ProfileType;

export interface FilteredProfilesResponse {
  items: ProfileResponse[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface SendProfile {
  body: ProfileSettings;
  id: string;
}
