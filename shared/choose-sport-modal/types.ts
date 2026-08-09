import type { RefObject } from 'react';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export interface ChooseSportModalProps {
  chooseSportModalRef: RefObject<BottomSheetModal | null>;
  isDisabled?: boolean;
}
