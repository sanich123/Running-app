import type { RefObject } from 'react';
import type { SPORTS_BTNS_VALUES } from '@const/sports';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export const USER_INFO_FALLBACK_NAME = {
  russian: 'Пользователь',
  english: 'User',
} as const;

export interface UserInfoProps {
  profile: {
    surname?: string | null;
    name?: string | null;
    profilePhoto?: string | null;
    profilePhotoBlurhash?: string | null;
  };
  sport?: SPORTS_BTNS_VALUES | string;
  date: string;
  userId: string;
  size: UserInfoSize;
  commentsModalRef?: RefObject<BottomSheetModal | null>;
}

export enum UserInfoSize {
  small = 'small',
  large = 'large',
}
