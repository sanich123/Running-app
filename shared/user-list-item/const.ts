import type { RefObject } from 'react';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export interface UserListItemType {
  name?: string | null;
  surname?: string | null;
  placeholder?: string | null;
  profilePhoto?: string | null;
  city?: string | null;
  userId: string;
  commentsModalRef?: RefObject<BottomSheetModal | null>;
}
