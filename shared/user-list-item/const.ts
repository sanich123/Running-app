import type { RefObject } from 'react';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export interface UserListItemType {
  name: string;
  surname: string;
  placeholder: string;
  profilePhoto: string;
  city: string;
  user_id: string;
  commentsModalRef?: RefObject<BottomSheetModal | null>;
}
