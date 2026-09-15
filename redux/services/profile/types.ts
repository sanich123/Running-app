import type { ProfileType } from '@S/card/types';

export interface ProfileSettings {
  gender?: string;
  name?: string;
  surname?: string;
  city?: string;
  weight?: string;
  bio?: string;
  profilePhoto?: string;
  email?: string;
  birthday?: string;
  sport?: string;
  emailNotifications?: boolean;
}

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
