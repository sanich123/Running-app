import type { RefObject } from 'react';
import type { SPORTS_BTNS_VALUES } from '@const/sports';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export interface UserInfoProps {
  profile: { surname: string; name: string; profilePhoto: string; profilePhotoBlurhash: string };
  sport?: SPORTS_BTNS_VALUES;
  date: string;
  userId: string;
  size: UserInfoSize;
  commentsModalRef?: RefObject<BottomSheetModal | null>;
}

export enum UserInfoSize {
  small = 'small',
  large = 'large',
}
