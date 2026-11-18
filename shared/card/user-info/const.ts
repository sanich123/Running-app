import type { RefObject } from 'react';
import type { SPORTS_BTNS_VALUES } from '@const/sports';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { ProfileType } from '@S/card/types';

export const USER_INFO_FALLBACK_NAME = {
  russian: 'Пользователь',
  english: 'User',
} as const;

export const USER_INFO_PROVENANCE_COPY = {
  russian: {
    app: 'Приложение',
    import: 'Импорт',
    appleHealth: 'Apple Health',
    healthConnect: 'Health Connect',
  },
  english: {
    app: 'App',
    import: 'Import',
    appleHealth: 'Apple Health',
    healthConnect: 'Health Connect',
  },
} as const;

export interface UserInfoProps {
  profile: Pick<ProfileType, 'surname' | 'name' | 'profilePhoto' | 'profilePhotoBlurhash' | 'profilePhotoReviewStatus'>;
  sport?: SPORTS_BTNS_VALUES | string;
  date: string;
  source?: string | null;
  sourceAppName?: string | null;
  recordingDeviceManufacturer?: string | null;
  recordingDeviceModel?: string | null;
  userId: string;
  size: UserInfoSize;
  commentsModalRef?: RefObject<BottomSheetModal | null>;
}

export enum UserInfoSize {
  small = 'small',
  large = 'large',
}
