import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { RefObject } from 'react';

export type UserInfoProps = {
  profile: { surname: string; name: string; profilePhoto: string; profilePhotoBlurhash: string };
  sport?: SPORTS_BTNS_VALUES;
  date: string;
  userId: string;
  size: UserInfoSize;
  commentsModalRef?: RefObject<BottomSheetModal | null>;
};

export enum UserInfoSize {
  small = 'small',
  large = 'large',
}
