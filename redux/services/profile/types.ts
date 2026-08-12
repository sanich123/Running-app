import type { PaginationResponse } from '@R/runich-api/types';
import type { ProfileSettings } from '@R/slices/profile/types';
import type { ProfileType } from '@S/card/types';

export type { PaginationResponse } from '@R/runich-api/types';
export type ProfileResponse = ProfileType;
export type FilteredProfilesResponse = PaginationResponse<ProfileResponse>;

export interface SendProfile {
  body: ProfileSettings;
  id: string;
}
