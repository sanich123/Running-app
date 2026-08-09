import type { SPORTS_BTNS_VALUES } from '@const/sports';
import type { LastKmSplit } from '@R/slices/location/types';
import type { EMOTIONS_BTNS_VALUES } from '@Routes/save-activity-page/emotion-btns/const';
import type { LocationObject } from 'expo-location';

export interface FinishedActivity {
  date?: string;
  locations: LocationObject[];
  duration: number;
  speed: number;
  distance: number;
  kilometresSplit?: LastKmSplit[];
}

export interface AdditionalInfoType {
  title: string;
  description: string;
  sport: SPORTS_BTNS_VALUES;
  emotion: EMOTIONS_BTNS_VALUES;
  isPublic: boolean;
  photoVideoUrls: { url: string; thumbnail: null | string; blurhash?: string }[];
}

export interface ActivityToSend {
  body: FinishedActivity & AdditionalInfoType;
  id: string;
}

export interface Activity {
  description: string;
  title: string;
  date: string;
  sport: string;
  id: string;
  user_id: string;
  photoVideoUrls: string[];
  mapPhotoUrl: string;
  locations?: LocationObject[];
  kilometresSplit?: LastKmSplit[];
  duration: number;
  distance: number;
  profile: Profile;
  _count: {
    comments: number;
  };
}

export interface Profile {
  surname: string;
  name: string;
  profilePhoto: string;
  profilePhotoblurhash: null;
  emailNotifications: boolean;
  users: {
    email: string;
  };
}

export interface ActivitiesReponse {
  activities: Activity[];
  isLastPage: boolean;
}
