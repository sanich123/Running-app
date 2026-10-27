import type { RefObject } from 'react';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { ProfileType } from '@S/card/types';

export interface UserListItemType {
  name?: string | null;
  surname?: string | null;
  placeholder?: string | null;
  profilePhoto?: string | null;
  profilePhotoReviewStatus?: ProfileType['profilePhotoReviewStatus'];
  city?: string | null;
  userId: string;
  allowNewFollowers?: boolean;
  commentsModalRef?: RefObject<BottomSheetModal | null>;
}
