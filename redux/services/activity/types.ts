import { EMOTIONS_BTNS_VALUES } from '@C/save-activity-page/emotion-btns/const';
import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';
import { LastKmSplit } from '@R/slices/location/types';
import { LocationObject } from 'expo-location';

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

export type ActivityToSend = {
  body: FinishedActivity & AdditionalInfoType;
  id: string;
};

export type Activity = {
  description: string;
  title: string;
  date: string;
  sport: string;
  id: string;
  user_id: string;
  photoVideoUrls: string[];
  mapPhotoUrl: string;
  duration: number;
  distance: number;
  profile: Profile;
  _count: {
    comments: number;
  };
};

export type Profile = {
  surname: string;
  name: string;
  profilePhoto: string;
  profilePhotoblurhash: null;
  emailNotifications: boolean;
  users: {
    email: string;
  };
};

export type ActivitiesReponse = {
  activities: Activity[];
  isLastPage: boolean;
};
