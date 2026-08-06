import type { RefObject } from 'react';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { SPORTS_BTNS_VALUES } from '@Routes/save-activity-page/sports-btns/const';

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
